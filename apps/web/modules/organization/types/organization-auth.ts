import { z } from "zod";
import { ZMembership } from "@feedyruby/types/memberships";
import { ZOrganization } from "@feedyruby/types/organizations";
import { ZUser } from "@feedyruby/types/user";

export const ZOrganizationAuth = z.object({
  organization: ZOrganization,
  session: z.object({
    user: ZUser.pick({ id: true }),
    expires: z.string(),
  }),
  currentUserMembership: ZMembership,
  isMember: z.boolean(),
  isOwner: z.boolean(),
  isManager: z.boolean(),
  isBilling: z.boolean(),
});

export type TOrganizationAuth = z.infer<typeof ZOrganizationAuth>;
