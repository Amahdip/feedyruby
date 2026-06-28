import { cache as reactCache } from "react";
import { z } from "zod";
import { prisma } from "@feedyruby/database";
import { Prisma, Workspace } from "@feedyruby/database/prisma";
import { logger } from "@feedyruby/logger";
import { DatabaseError } from "@feedyruby/types/errors";
import { validateInputs } from "@/lib/utils/validate";

export const getWorkspaceById = reactCache(async (workspaceId: string): Promise<Workspace | null> => {
  validateInputs([workspaceId, z.cuid2()]);

  try {
    const workspacePrisma = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    return workspacePrisma;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(error, "Error fetching workspace by id");
      throw new DatabaseError(error.message);
    }
    throw error;
  }
});
