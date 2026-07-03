import "server-only";
import { prisma } from "@feedyruby/database";

export type AdminAction =
  | "user.block"
  | "user.unblock"
  | "user.verify_email"
  | "user.password_reset"
  | "org.member.role_change"
  | "org.member.remove"
  | "org.suspend"
  | "org.unsuspend"
  | "org.delete"
  | "admin.grant"
  | "admin.revoke";

/**
 * Append-only record of an operator action. Written inside every mutation server
 * action (see modules/admin/actions.ts) so there's a full trail of who did what.
 * The audit write is part of the action's transaction-of-intent: it runs right
 * after the mutation succeeds, before revalidation.
 */
export async function writeAudit(entry: {
  actorEmail: string;
  action: AdminAction;
  targetType: "user" | "org" | "membership";
  targetId?: string | null;
  targetLabel?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      actorEmail: entry.actorEmail,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      targetLabel: entry.targetLabel ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meta: (entry.meta ?? {}) as any,
    },
  });
}
