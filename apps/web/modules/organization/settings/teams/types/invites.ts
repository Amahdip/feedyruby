import { z } from "zod";
import { Invite } from "@feedyruby/database/prisma";
import { ZInvite } from "@feedyruby/database/zod/invites";
import { ZUserName } from "@feedyruby/types/user";

export interface TInvite extends Omit<
  Invite,
  "deprecatedRole" | "organizationId" | "creatorId" | "acceptorId" | "teamIds"
> {}

export interface InviteWithCreator extends Pick<Invite, "email"> {
  creator: {
    name: string;
  };
}

export const ZInvitee = ZInvite.pick({
  email: true,
  role: true,
  teamIds: true,
}).extend({
  name: ZUserName,
});

export type TInvitee = z.infer<typeof ZInvitee>;

export const ZInvitees = z.array(ZInvitee);
