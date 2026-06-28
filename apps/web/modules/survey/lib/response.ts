import { cache as reactCache } from "react";
import { prisma } from "@feedyruby/database";
import { Prisma } from "@feedyruby/database/prisma";
import { DatabaseError } from "@feedyruby/types/errors";

export const getResponseCountBySurveyId = reactCache(async (surveyId: string): Promise<number> => {
  try {
    const responseCount = await prisma.response.count({
      where: {
        surveyId,
      },
    });
    return responseCount;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
});
