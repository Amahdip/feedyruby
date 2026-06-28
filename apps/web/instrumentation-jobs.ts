import {
  type JobHandlerOverrides,
  type JobsRuntimeHandle,
  type TResponsePipelineJobData,
  type TSurveySchedulingJobData,
  removeRecurringSurveySchedulingJobSchedule,
  startJobsRuntime,
  upsertRecurringSurveySchedulingJobSchedule,
} from "@feedyruby/jobs";
import { logger } from "@feedyruby/logger";
import { getJobsQueueingConfig, getJobsWorkerBootstrapConfig } from "@/lib/jobs/config";
import { processResponsePipelineJob } from "@/modules/response-pipeline/lib/process-response-pipeline-job";
import {
  SURVEY_SCHEDULING_DAILY_CRON_PATTERN,
  SURVEY_SCHEDULING_DAILY_SCHEDULE_ID,
  SURVEY_SCHEDULING_GLOBAL_SCOPE,
  SURVEY_SCHEDULING_TIME_ZONE,
} from "@/modules/survey/scheduling/lib/constants";
import { processSurveySchedulingJob } from "@/modules/survey/scheduling/lib/process-survey-scheduling-job";

const WORKER_STARTUP_RETRY_DELAY_MS = 30_000;

type TJobsRuntimeGlobal = typeof globalThis & {
  feedyrubyJobsRecurringRegistration: Promise<void> | undefined;
  feedyrubyJobsRecurringRegistered: boolean | undefined;
  feedyrubyJobsRecurringRetryTimeout: ReturnType<typeof setTimeout> | undefined;
  feedyrubyJobsRuntime: JobsRuntimeHandle | undefined;
  feedyrubyJobsRuntimeInitializing: Promise<JobsRuntimeHandle> | undefined;
  feedyrubyJobsRuntimeRetryTimeout: ReturnType<typeof setTimeout> | undefined;
};

const globalForJobsRuntime = globalThis as TJobsRuntimeGlobal;
const RESPONSE_PIPELINE_JOB_NAME = "response-pipeline.process";
const SURVEY_SCHEDULING_JOB_NAME = "survey-scheduling.reconcile";

const responsePipelineJobHandler: NonNullable<JobHandlerOverrides[string]> = async (data, context) => {
  await processResponsePipelineJob(data as TResponsePipelineJobData, context);
};
const surveySchedulingJobHandler: NonNullable<JobHandlerOverrides[string]> = async (data, context) => {
  await processSurveySchedulingJob(data as TSurveySchedulingJobData, context);
};

const registerSurveySchedulingSchedule = async (): Promise<void> => {
  await removeRecurringSurveySchedulingJobSchedule({
    scheduleId: SURVEY_SCHEDULING_DAILY_SCHEDULE_ID,
    scope: SURVEY_SCHEDULING_GLOBAL_SCOPE,
  });

  await upsertRecurringSurveySchedulingJobSchedule(
    {
      scheduleId: SURVEY_SCHEDULING_DAILY_SCHEDULE_ID,
      scope: SURVEY_SCHEDULING_GLOBAL_SCOPE,
    },
    {
      cronPattern: SURVEY_SCHEDULING_DAILY_CRON_PATTERN,
      kind: "cron",
      timeZone: SURVEY_SCHEDULING_TIME_ZONE,
    },
    {
      scope: SURVEY_SCHEDULING_GLOBAL_SCOPE,
    }
  );
};

const clearRecurringJobsRetryTimeout = (): void => {
  if (globalForJobsRuntime.feedyrubyJobsRecurringRetryTimeout) {
    clearTimeout(globalForJobsRuntime.feedyrubyJobsRecurringRetryTimeout);
    globalForJobsRuntime.feedyrubyJobsRecurringRetryTimeout = undefined;
  }
};

const scheduleRecurringJobsRetry = (): void => {
  if (
    globalForJobsRuntime.feedyrubyJobsRecurringRegistered ||
    globalForJobsRuntime.feedyrubyJobsRecurringRegistration ||
    globalForJobsRuntime.feedyrubyJobsRecurringRetryTimeout
  ) {
    return;
  }

  globalForJobsRuntime.feedyrubyJobsRecurringRetryTimeout = setTimeout(() => {
    globalForJobsRuntime.feedyrubyJobsRecurringRetryTimeout = undefined;
    void registerRecurringJobs().catch(() => undefined);
  }, WORKER_STARTUP_RETRY_DELAY_MS);

  logger.warn(
    { retryDelayMs: WORKER_STARTUP_RETRY_DELAY_MS },
    "BullMQ recurring job registration retry scheduled"
  );
};

const clearJobsWorkerRetryTimeout = (): void => {
  if (globalForJobsRuntime.feedyrubyJobsRuntimeRetryTimeout) {
    clearTimeout(globalForJobsRuntime.feedyrubyJobsRuntimeRetryTimeout);
    globalForJobsRuntime.feedyrubyJobsRuntimeRetryTimeout = undefined;
  }
};

const scheduleJobsWorkerRetry = (): void => {
  if (
    globalForJobsRuntime.feedyrubyJobsRuntime ||
    globalForJobsRuntime.feedyrubyJobsRuntimeInitializing ||
    globalForJobsRuntime.feedyrubyJobsRuntimeRetryTimeout
  ) {
    return;
  }

  globalForJobsRuntime.feedyrubyJobsRuntimeRetryTimeout = setTimeout(() => {
    globalForJobsRuntime.feedyrubyJobsRuntimeRetryTimeout = undefined;
    void registerJobsWorker().catch(() => undefined);
  }, WORKER_STARTUP_RETRY_DELAY_MS);

  logger.warn({ retryDelayMs: WORKER_STARTUP_RETRY_DELAY_MS }, "BullMQ worker registration retry scheduled");
};

export const registerRecurringJobs = async (): Promise<void> => {
  const jobsQueueingConfig = getJobsQueueingConfig();

  if (!jobsQueueingConfig.enabled || !jobsQueueingConfig.redisUrl) {
    clearRecurringJobsRetryTimeout();
    logger.debug("BullMQ recurring job registration skipped");
    return;
  }

  if (globalForJobsRuntime.feedyrubyJobsRecurringRegistered) {
    return;
  }

  if (globalForJobsRuntime.feedyrubyJobsRecurringRegistration) {
    return await globalForJobsRuntime.feedyrubyJobsRecurringRegistration;
  }

  globalForJobsRuntime.feedyrubyJobsRecurringRegistration = (async () => {
    await registerSurveySchedulingSchedule();
    clearRecurringJobsRetryTimeout();
    globalForJobsRuntime.feedyrubyJobsRecurringRegistered = true;
    globalForJobsRuntime.feedyrubyJobsRecurringRegistration = undefined;
  })();

  try {
    return await globalForJobsRuntime.feedyrubyJobsRecurringRegistration;
  } catch (error) {
    globalForJobsRuntime.feedyrubyJobsRecurringRegistration = undefined;
    logger.error({ err: error }, "BullMQ recurring job registration failed");
    scheduleRecurringJobsRetry();
    throw error;
  }
};

export const registerJobsWorker = async (): Promise<JobsRuntimeHandle | null> => {
  const jobsWorkerBootstrapConfig = getJobsWorkerBootstrapConfig();

  if (!jobsWorkerBootstrapConfig.enabled || !jobsWorkerBootstrapConfig.runtimeOptions) {
    clearJobsWorkerRetryTimeout();
    logger.debug("BullMQ worker startup skipped");
    return null;
  }

  if (globalForJobsRuntime.feedyrubyJobsRuntime) {
    return globalForJobsRuntime.feedyrubyJobsRuntime;
  }

  if (globalForJobsRuntime.feedyrubyJobsRuntimeInitializing) {
    return await globalForJobsRuntime.feedyrubyJobsRuntimeInitializing;
  }

  const runtimeOptions = jobsWorkerBootstrapConfig.runtimeOptions;
  const jobHandlerOverrides: JobHandlerOverrides = runtimeOptions.jobHandlerOverrides
    ? {
        ...runtimeOptions.jobHandlerOverrides,
        [RESPONSE_PIPELINE_JOB_NAME]: responsePipelineJobHandler,
        [SURVEY_SCHEDULING_JOB_NAME]: surveySchedulingJobHandler,
      }
    : {
        [RESPONSE_PIPELINE_JOB_NAME]: responsePipelineJobHandler,
        [SURVEY_SCHEDULING_JOB_NAME]: surveySchedulingJobHandler,
      };

  globalForJobsRuntime.feedyrubyJobsRuntimeInitializing = (async () => {
    const runtime = await startJobsRuntime({
      ...runtimeOptions,
      jobHandlerOverrides,
    });

    clearJobsWorkerRetryTimeout();
    globalForJobsRuntime.feedyrubyJobsRuntime = runtime;
    globalForJobsRuntime.feedyrubyJobsRuntimeInitializing = undefined;
    return runtime;
  })();

  try {
    return await globalForJobsRuntime.feedyrubyJobsRuntimeInitializing;
  } catch (error) {
    globalForJobsRuntime.feedyrubyJobsRuntimeInitializing = undefined;
    logger.error({ err: error }, "BullMQ worker registration failed");
    scheduleJobsWorkerRetry();
    throw error;
  }
};

export const resetJobsWorkerRegistrationForTests = async (): Promise<void> => {
  const runtime = globalForJobsRuntime.feedyrubyJobsRuntime;
  const initializing = globalForJobsRuntime.feedyrubyJobsRuntimeInitializing;
  clearRecurringJobsRetryTimeout();
  clearJobsWorkerRetryTimeout();
  globalForJobsRuntime.feedyrubyJobsRecurringRegistered = undefined;
  globalForJobsRuntime.feedyrubyJobsRecurringRegistration = undefined;
  globalForJobsRuntime.feedyrubyJobsRuntime = undefined;
  globalForJobsRuntime.feedyrubyJobsRuntimeInitializing = undefined;

  const runtimesToClose = new Set<JobsRuntimeHandle>();

  if (runtime) {
    runtimesToClose.add(runtime);
  }

  if (initializing) {
    try {
      const initializedRuntime = await initializing;
      runtimesToClose.add(initializedRuntime);
    } catch {
      // Startup failures are already surfaced by the test that triggered them.
    }
  }

  if (globalForJobsRuntime.feedyrubyJobsRuntime) {
    runtimesToClose.add(globalForJobsRuntime.feedyrubyJobsRuntime);
  }

  globalForJobsRuntime.feedyrubyJobsRuntime = undefined;
  globalForJobsRuntime.feedyrubyJobsRuntimeInitializing = undefined;

  await Promise.all(
    [...runtimesToClose].map(async (runtimeHandle) => {
      try {
        await runtimeHandle.close();
      } catch (error) {
        logger.error({ err: error }, "BullMQ worker test reset close failed");
      }
    })
  );
};
