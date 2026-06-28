import "server-only";
import type { User } from "@feedyruby/database/prisma";

type TAccountDeletionPasswordAuthData = Pick<User, "identityProvider">;

export const requiresPasswordConfirmationForAccountDeletion = ({
  identityProvider,
}: TAccountDeletionPasswordAuthData): boolean => identityProvider === "email";
