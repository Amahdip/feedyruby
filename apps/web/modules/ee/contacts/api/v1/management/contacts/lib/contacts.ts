import { cache as reactCache } from "react";
import { prisma } from "@feedyruby/database";
import { Prisma } from "@feedyruby/database/prisma";
import { ZId } from "@feedyruby/types/common";
import { DatabaseError } from "@feedyruby/types/errors";
import { validateInputs } from "@/lib/utils/validate";
import { TContact } from "@/modules/ee/contacts/types/contact";

export const getContacts = reactCache(async (workspaceIds: string[]): Promise<TContact[]> => {
  validateInputs([workspaceIds, ZId.array()]);

  try {
    const contacts = await prisma.contact.findMany({
      where: { workspaceId: { in: workspaceIds } },
    });

    return contacts;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
});
