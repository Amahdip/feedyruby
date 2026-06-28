import "server-only";
import { prisma } from "@feedyruby/database";
import { Prisma } from "@feedyruby/database/prisma";
import { logger } from "@feedyruby/logger";
import { ZId } from "@feedyruby/types/common";
import { DatabaseError, ResourceNotFoundError } from "@feedyruby/types/errors";
import { validateInputs } from "@/lib/utils/validate";

export const deleteSurvey = async (surveyId: string) => {
  validateInputs([surveyId, ZId]);

  try {
    return await prisma.$transaction(async (tx) => {
      const deletedSurvey = await tx.survey.delete({
        where: {
          id: surveyId,
        },
        include: {
          segment: true,
          triggers: {
            include: {
              actionClass: true,
            },
          },
        },
      });

      if (deletedSurvey.type === "app" && deletedSurvey.segment?.isPrivate) {
        await tx.segment.delete({
          where: {
            id: deletedSurvey.segment.id,
          },
        });
      }

      return deletedSurvey;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        logger.warn({ surveyId }, "Survey not found during delete");
        throw new ResourceNotFoundError("Survey", surveyId);
      }

      logger.error({ error, surveyId }, "Error deleting survey");
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};
