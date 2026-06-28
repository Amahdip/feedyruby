import "server-only";
import { cache as reactCache } from "react";
import { prisma } from "@feedyruby/database";
import { Prisma } from "@feedyruby/database/prisma";
import { logger } from "@feedyruby/logger";
import { ZString } from "@feedyruby/types/common";
import { DatabaseError, UnknownError } from "@feedyruby/types/errors";
import { validateInputs } from "@/lib/utils/validate";
import { TOrganizationWorkspace } from "@/modules/ee/teams/team-list/types/workspace";

export const getWorkspacesByOrganizationId = reactCache(
  async (organizationId: string): Promise<TOrganizationWorkspace[]> => {
    validateInputs([organizationId, ZString]);

    try {
      const workspaces = await prisma.workspace.findMany({
        where: {
          organizationId,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return workspaces.map((workspace) => ({
        id: workspace.id,
        name: workspace.name,
      }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error(error, "Error fetching workspaces by organization id");
        throw new DatabaseError(error.message);
      }

      throw new UnknownError("Error while fetching workspaces");
    }
  }
);
