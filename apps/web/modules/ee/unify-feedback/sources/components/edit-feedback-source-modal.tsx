"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TFeedbackSourceWithMappings } from "@feedyruby/types/feedback-source";
import { Button } from "@/modules/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/ui/components/dialog";
import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormProvider,
} from "@/modules/ui/components/form";
import { Input } from "@/modules/ui/components/input";
import { Label } from "@/modules/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/ui/components/select";
import {
  CSV_HIDDEN_STATIC_MAPPINGS,
  CSV_PROTECTED_TARGET_IDS,
  SAMPLE_CSV_COLUMNS,
  TFeedyRubyFeedbackSourceForm,
  TFieldMapping,
  TSourceField,
  TUnifySurvey,
  ZFeedyRubyFeedbackSourceForm,
  getTranslatedFeedbackSourceError,
} from "../types";
import {
  areAllRequiredCsvFieldsMapped,
  isFeedbackSourceNameValid,
  parseCSVColumnsToFields,
  toggleQuestionId,
} from "../utils";
import { getFeedbackSourceIcon, getFeedbackSourceTypeLabelKey } from "./feedback-source-display";
import { FeedyRubyQuestionList } from "./feedyruby-question-list";
import { MappingUI } from "./mapping-ui";

interface EditFeedbackSourceModalProps {
  feedbackSource: TFeedbackSourceWithMappings | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateFeedbackSource: (data: {
    feedbackSourceId: string;
    workspaceId: string;
    name: string;
    surveyMappings?: { surveyId: string; elementIds: string[] }[];
    fieldMappings?: TFieldMapping[];
  }) => Promise<boolean>;
  surveys: TUnifySurvey[];
  onOpenCsvImport?: () => void;
  isReadOnly?: boolean;
}

export const EditFeedbackSourceModal = ({
  feedbackSource,
  open,
  onOpenChange,
  onUpdateFeedbackSource,
  surveys,
  onOpenCsvImport,
  isReadOnly = false,
}: EditFeedbackSourceModalProps) => {
  const { t } = useTranslation();
  const [csvFeedbackSourceName, setCsvFeedbackSourceName] = useState("");
  const [mappings, setMappings] = useState<TFieldMapping[]>([]);
  const [sourceFields, setSourceFields] = useState<TSourceField[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const feedyrubyForm = useForm<TFeedyRubyFeedbackSourceForm>({
    resolver: zodResolver(ZFeedyRubyFeedbackSourceForm),
    defaultValues: {
      sourceName: "",
      surveyId: "",
      selectedQuestionIds: [],
      importHistorical: true,
    },
    mode: "onChange",
  });

  const feedyrubyValues = feedyrubyForm.watch();
  const selectedSurveyId = feedyrubyValues.surveyId;
  const selectedQuestionIds = feedyrubyValues.selectedQuestionIds ?? [];
  const selectedSurvey = useMemo(
    () => surveys.find((survey) => survey.id === selectedSurveyId) ?? null,
    [surveys, selectedSurveyId]
  );

  useEffect(() => {
    if (feedbackSource) {
      if (feedbackSource.type === "feedyruby_survey") {
        const mappedSurveyId = feedbackSource.feedyrubyMappings[0]?.surveyId ?? "";
        const mappedQuestionIds = feedbackSource.feedyrubyMappings
          .filter((mapping) => mapping.surveyId === mappedSurveyId)
          .map((mapping) => mapping.elementId);

        feedyrubyForm.reset({
          sourceName: feedbackSource.name,
          surveyId: mappedSurveyId,
          selectedQuestionIds: mappedQuestionIds,
          importHistorical: true,
        });
        setCsvFeedbackSourceName("");
        setSourceFields([]);
        setMappings([]);
      } else if (feedbackSource.type === "csv") {
        setCsvFeedbackSourceName(feedbackSource.name);
        const columnsFromMappings = [
          ...new Set(feedbackSource.fieldMappings.map((m) => m.sourceFieldId).filter(Boolean)),
        ];
        setSourceFields(
          columnsFromMappings.length > 0
            ? parseCSVColumnsToFields(columnsFromMappings.join(","), { includeSampleValues: false })
            : parseCSVColumnsToFields(SAMPLE_CSV_COLUMNS, { includeSampleValues: false })
        );
        setMappings(
          feedbackSource.fieldMappings.map((m) => ({
            sourceFieldId: m.sourceFieldId,
            targetFieldId: m.targetFieldId,
            staticValue: m.staticValue ?? undefined,
          }))
        );
        feedyrubyForm.reset({
          sourceName: "",
          surveyId: "",
          selectedQuestionIds: [],
          importHistorical: true,
        });
      } else {
        setCsvFeedbackSourceName("");
        setSourceFields([]);
        setMappings([]);
        feedyrubyForm.reset({
          sourceName: "",
          surveyId: "",
          selectedQuestionIds: [],
          importHistorical: true,
        });
      }
    }
  }, [feedbackSource, feedyrubyForm]);

  const resetForm = () => {
    setCsvFeedbackSourceName("");
    setMappings([]);
    setSourceFields([]);
    feedyrubyForm.reset({
      sourceName: "",
      surveyId: "",
      selectedQuestionIds: [],
      importHistorical: true,
    });
    setIsUpdating(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleUpdateFeedyRubyFeedbackSource = async (values: TFeedyRubyFeedbackSourceForm) => {
    if (feedbackSource?.type !== "feedyruby_survey") return;
    setIsUpdating(true);
    const success = await onUpdateFeedbackSource({
      feedbackSourceId: feedbackSource.id,
      workspaceId: feedbackSource.workspaceId,
      name: values.sourceName.trim(),
      surveyMappings: [{ surveyId: values.surveyId, elementIds: values.selectedQuestionIds }],
      fieldMappings: undefined,
    });
    setIsUpdating(false);
    if (success) {
      handleOpenChange(false);
    }
  };

  const handleUpdateCsvFeedbackSource = async () => {
    if (feedbackSource?.type !== "csv" || !isFeedbackSourceNameValid(csvFeedbackSourceName)) return;

    const requiredCheck = areAllRequiredCsvFieldsMapped(mappings);
    if (!requiredCheck.valid) {
      toast.error(
        t("workspace.unify.csv_required_fields_missing", { fields: requiredCheck.missing.join(", ") })
      );
      return;
    }

    setIsUpdating(true);
    const userMappings = mappings.filter((m) =>
      CSV_PROTECTED_TARGET_IDS.every((id) => m.targetFieldId !== id)
    );
    const fieldMappings = [...userMappings, ...CSV_HIDDEN_STATIC_MAPPINGS];

    const success = await onUpdateFeedbackSource({
      feedbackSourceId: feedbackSource.id,
      workspaceId: feedbackSource.workspaceId,
      name: csvFeedbackSourceName.trim(),
      surveyMappings: undefined,
      fieldMappings,
    });
    setIsUpdating(false);
    if (success) {
      handleOpenChange(false);
    }
  };

  const handleFeedyRubyQuestionToggle = (questionId: string) => {
    const nextSelection = toggleQuestionId(feedyrubyForm.getValues("selectedQuestionIds"), questionId);
    feedyrubyForm.setValue("selectedQuestionIds", nextSelection, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const saveChangesDisabled = useMemo(() => {
    if (!feedbackSource) return true;
    if (isUpdating) return true;

    if (feedbackSource.type === "feedyruby_survey") {
      return (
        !isFeedbackSourceNameValid(feedyrubyValues.sourceName ?? "") ||
        !feedyrubyValues.surveyId ||
        !feedyrubyValues.selectedQuestionIds?.length
      );
    }

    if (feedbackSource.type === "csv") {
      return (
        !isFeedbackSourceNameValid(csvFeedbackSourceName) || !areAllRequiredCsvFieldsMapped(mappings).valid
      );
    }

    return true;
  }, [feedbackSource, csvFeedbackSourceName, feedyrubyValues, isUpdating, mappings]);

  if (!feedbackSource) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("workspace.unify.edit_source_connection")}</DialogTitle>
          <DialogDescription>{t("workspace.unify.update_mapping_description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {feedbackSource.type === "feedyruby_survey" ? (
            <FormProvider {...feedyrubyForm}>
              <form
                className="space-y-4"
                onSubmit={feedyrubyForm.handleSubmit(handleUpdateFeedyRubyFeedbackSource)}>
                <FormField
                  control={feedyrubyForm.control}
                  name="sourceName"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>{t("workspace.unify.source_name")}</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t("workspace.unify.enter_name_for_source")}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      {error?.message && (
                        <FormError>{getTranslatedFeedbackSourceError(error.message, t)}</FormError>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={feedyrubyForm.control}
                  name="surveyId"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>{t("workspace.unify.select_survey")}</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange} disabled>
                          <SelectTrigger>
                            <SelectValue placeholder={t("workspace.unify.select_survey")} />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedSurvey && (
                              <SelectItem key={selectedSurvey.id} value={selectedSurvey.id}>
                                {selectedSurvey.name}
                              </SelectItem>
                            )}
                            {!selectedSurvey && field.value && (
                              <SelectItem value={field.value}>{field.value}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {error?.message && (
                        <FormError>{getTranslatedFeedbackSourceError(error.message, t)}</FormError>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={feedyrubyForm.control}
                  name="selectedQuestionIds"
                  render={({ fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>{t("workspace.unify.select_questions")}</FormLabel>
                      <FormControl>
                        <fieldset className={isReadOnly ? "opacity-70" : undefined} disabled={isReadOnly}>
                          <FeedyRubyQuestionList
                            survey={selectedSurvey}
                            selectedQuestionIds={selectedQuestionIds}
                            onQuestionToggle={handleFeedyRubyQuestionToggle}
                          />
                        </fieldset>
                      </FormControl>
                      {error?.message && (
                        <FormError>{getTranslatedFeedbackSourceError(error.message, t)}</FormError>
                      )}
                    </FormItem>
                  )}
                />
              </form>
            </FormProvider>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                {getFeedbackSourceIcon(feedbackSource.type, "h-5 w-5 text-slate-500")}
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t(getFeedbackSourceTypeLabelKey(feedbackSource.type))}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("workspace.unify.source_type_cannot_be_changed")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editFeedbackSourceName">{t("workspace.unify.source_name")}</Label>
                <Input
                  id="editFeedbackSourceName"
                  value={csvFeedbackSourceName}
                  onChange={(event) => setCsvFeedbackSourceName(event.target.value)}
                  placeholder={t("workspace.unify.enter_name_for_source")}
                  disabled={isReadOnly}
                />
              </div>

              <fieldset
                disabled={isReadOnly}
                className={`max-h-[40vh] overflow-y-auto rounded-lg border border-slate-200 p-4 ${
                  isReadOnly ? "opacity-70" : ""
                }`}>
                <MappingUI
                  sourceFields={sourceFields}
                  mappings={mappings}
                  onMappingsChange={setMappings}
                  feedbackSourceType={feedbackSource.type}
                />
              </fieldset>
            </>
          )}
        </div>

        <DialogFooter>
          {isReadOnly ? (
            <Button variant="secondary" onClick={() => handleOpenChange(false)}>
              {t("common.close")}
            </Button>
          ) : (
            <>
              {feedbackSource.type === "csv" && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleOpenChange(false);
                    onOpenCsvImport?.();
                  }}>
                  {t("workspace.unify.import_feedback")}
                </Button>
              )}
              <Button
                onClick={
                  feedbackSource.type === "feedyruby_survey"
                    ? () => void feedyrubyForm.handleSubmit(handleUpdateFeedyRubyFeedbackSource)()
                    : handleUpdateCsvFeedbackSource
                }
                disabled={saveChangesDisabled}>
                {t("workspace.unify.save_changes")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
