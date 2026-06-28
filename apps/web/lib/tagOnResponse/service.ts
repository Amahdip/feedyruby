import "server-only";
import { cache as reactCache } from "react";
import { prisma } from "@feedyruby/database";
import { Prisma } from "@feedyruby/database/prisma";
import { ZId } from "@feedyruby/types/common";
import { DatabaseError } from "@feedyruby/types/errors";
import { TTagsCount, TTagsOnResponses } from "@feedyruby/types/tags";
import { validateInputs } from "../utils/validate";

const selectTagsOnResponse = {
  tag: {
    select: {
      workspaceId: true,
    },
  },
};

export const addTagToRespone = async (responseId: string, tagId: string): Promise<TTagsOnResponses> => {
  try {
    await prisma.tagsOnResponses.create({
      data: {
        responseId,
        tagId,
      },
      select: selectTagsOnResponse,
    });

    return {
      responseId,
      tagId,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};

export const deleteTagOnResponse = async (responseId: string, tagId: string): Promise<TTagsOnResponses> => {
  try {
    await prisma.tagsOnResponses.delete({
      where: {
        responseId_tagId: {
          responseId,
          tagId,
        },
      },
      select: selectTagsOnResponse,
    });

    return {
      tagId,
      responseId,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
};

export const getTagsOnResponsesCount = reactCache(async (workspaceId: string): Promise<TTagsCount> => {
  validateInputs([workspaceId, ZId]);

  try {
    const tagsCount = await prisma.tagsOnResponses.groupBy({
      by: ["tagId"],
      where: {
        response: {
          survey: {
            workspaceId,
          },
        },
      },
      _count: {
        _all: true,
      },
    });

    return tagsCount.map((tagCount) => ({ tagId: tagCount.tagId, count: tagCount._count._all }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }
    throw error;
  }
});
