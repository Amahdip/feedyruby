"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@feedyruby/database";
import { writeAudit } from "@/modules/admin/lib/audit";
import { getSuperAdminSession, isSuperAdminEmail } from "@/modules/admin/lib/auth";
import { requestPasswordReset } from "@/modules/auth/forgot-password/lib/password-reset-service";

export type ActionResult = { ok: true } | { ok: false; error: string };

const ROLES = ["owner", "manager", "member", "billing"] as const;
type Role = (typeof ROLES)[number];

/** The acting super-admin's (lowercased) email, or null if not authorized. */
async function actor(): Promise<string | null> {
  const s = await getSuperAdminSession();
  return s?.user?.email?.toLowerCase() ?? null;
}

// ---------------------------------------------------------------- users

export async function setUserActive(userId: string, active: boolean): Promise<ActionResult> {
  const email = await actor();
  if (!email) return { ok: false, error: "unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) return { ok: false, error: "not_found" };
  // Safety: an operator can't lock themselves out.
  if (!active && user.email.toLowerCase() === email) return { ok: false, error: "cannot_block_self" };

  await prisma.user.update({ where: { id: userId }, data: { isActive: active } });
  await writeAudit({
    actorEmail: email,
    action: active ? "user.unblock" : "user.block",
    targetType: "user",
    targetId: userId,
    targetLabel: user.email,
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}

export async function verifyUserEmail(userId: string): Promise<ActionResult> {
  const email = await actor();
  if (!email) return { ok: false, error: "unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, emailVerified: true },
  });
  if (!user) return { ok: false, error: "not_found" };
  if (user.emailVerified) return { ok: true };

  await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
  await writeAudit({
    actorEmail: email,
    action: "user.verify_email",
    targetType: "user",
    targetId: userId,
    targetLabel: user.email,
  });
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}

export async function sendUserPasswordReset(userId: string): Promise<ActionResult> {
  const email = await actor();
  if (!email) return { ok: false, error: "unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, locale: true },
  });
  if (!user) return { ok: false, error: "not_found" };

  await requestPasswordReset({ id: user.id, email: user.email, locale: user.locale }, "public");
  await writeAudit({
    actorEmail: email,
    action: "user.password_reset",
    targetType: "user",
    targetId: userId,
    targetLabel: user.email,
  });
  return { ok: true };
}

// ---------------------------------------------------------------- org members / access

export async function changeMemberRole(orgId: string, userId: string, role: Role): Promise<ActionResult> {
  const email = await actor();
  if (!email) return { ok: false, error: "unauthorized" };
  if (!ROLES.includes(role)) return { ok: false, error: "invalid_role" };

  const target = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
    select: { role: true },
  });
  if (!target) return { ok: false, error: "not_found" };
  if (target.role === "owner" && role !== "owner") {
    const owners = await prisma.membership.count({ where: { organizationId: orgId, role: "owner" } });
    if (owners <= 1) return { ok: false, error: "last_owner" };
  }

  await prisma.membership.update({
    where: { userId_organizationId: { userId, organizationId: orgId } },
    data: { role },
  });
  await writeAudit({
    actorEmail: email,
    action: "org.member.role_change",
    targetType: "membership",
    targetId: userId,
    targetLabel: orgId,
    meta: { role, from: target.role },
  });
  revalidatePath(`/admin/organizations/${orgId}`);
  return { ok: true };
}

export async function removeMember(orgId: string, userId: string): Promise<ActionResult> {
  const email = await actor();
  if (!email) return { ok: false, error: "unauthorized" };

  const target = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
    select: { role: true, user: { select: { email: true } } },
  });
  if (!target) return { ok: false, error: "not_found" };
  if (target.role === "owner") {
    const owners = await prisma.membership.count({ where: { organizationId: orgId, role: "owner" } });
    if (owners <= 1) return { ok: false, error: "last_owner" };
  }

  await prisma.membership.delete({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
  await writeAudit({
    actorEmail: email,
    action: "org.member.remove",
    targetType: "membership",
    targetId: userId,
    targetLabel: orgId,
    meta: { removedEmail: target.user.email, role: target.role },
  });
  revalidatePath(`/admin/organizations/${orgId}`);
  return { ok: true };
}

// ---------------------------------------------------------------- org suspend / delete

/**
 * Suspend/unsuspend an org by toggling every member's `isActive`. This reuses the
 * proven login/session block (no new auth-flow gating). NOTE: unsuspending also
 * re-activates a member who was individually blocked — acceptable trade-off.
 */
export async function setOrgSuspended(orgId: string, suspended: boolean): Promise<ActionResult> {
  const email = await actor();
  if (!email) return { ok: false, error: "unauthorized" };

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      memberships: { select: { userId: true, user: { select: { email: true } } } },
    },
  });
  if (!org) return { ok: false, error: "not_found" };
  // Safety: don't suspend an org you belong to (would lock yourself out).
  if (suspended && org.memberships.some((m) => m.user.email.toLowerCase() === email)) {
    return { ok: false, error: "cannot_target_own_org" };
  }

  const userIds = org.memberships.map((m) => m.userId);
  if (userIds.length) {
    await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { isActive: !suspended } });
  }
  await writeAudit({
    actorEmail: email,
    action: suspended ? "org.suspend" : "org.unsuspend",
    targetType: "org",
    targetId: orgId,
    targetLabel: org.name,
    meta: { members: userIds.length },
  });
  revalidatePath(`/admin/organizations/${orgId}`);
  revalidatePath("/admin/organizations");
  return { ok: true };
}

export async function deleteOrg(orgId: string, confirmName: string): Promise<ActionResult> {
  const email = await actor();
  if (!email) return { ok: false, error: "unauthorized" };

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true, memberships: { select: { user: { select: { email: true } } } } },
  });
  if (!org) return { ok: false, error: "not_found" };
  if (confirmName.trim() !== org.name.trim()) return { ok: false, error: "name_mismatch" };
  // Safety: don't delete an org you belong to.
  if (org.memberships.some((m) => m.user.email.toLowerCase() === email)) {
    return { ok: false, error: "cannot_target_own_org" };
  }

  // Audit BEFORE the cascade delete so the record survives the org's removal.
  await writeAudit({
    actorEmail: email,
    action: "org.delete",
    targetType: "org",
    targetId: orgId,
    targetLabel: org.name,
    meta: { members: org.memberships.length },
  });
  await prisma.organization.delete({ where: { id: orgId } });
  revalidatePath("/admin/organizations");
  return { ok: true };
}

// ---------------------------------------------------------------- admins (super-admin grant/revoke)

export async function grantAdmin(email: string): Promise<ActionResult> {
  const actorEmail = await actor();
  if (!actorEmail) return { ok: false, error: "unauthorized" };
  const target = email.trim().toLowerCase();
  if (!target) return { ok: false, error: "user_not_found" };

  const user = await prisma.user.findFirst({
    where: { email: { equals: target, mode: "insensitive" } },
    select: { id: true, email: true, isSuperAdmin: true },
  });
  if (!user) return { ok: false, error: "user_not_found" }; // must have signed up first
  if (isSuperAdminEmail(user.email) || user.isSuperAdmin) return { ok: false, error: "already_admin" };

  await prisma.user.update({ where: { id: user.id }, data: { isSuperAdmin: true } });
  await writeAudit({
    actorEmail,
    action: "admin.grant",
    targetType: "user",
    targetId: user.id,
    targetLabel: user.email,
  });
  revalidatePath("/admin/operators");
  return { ok: true };
}

export async function revokeAdmin(userId: string): Promise<ActionResult> {
  const actorEmail = await actor();
  if (!actorEmail) return { ok: false, error: "unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, isSuperAdmin: true },
  });
  if (!user) return { ok: false, error: "not_found" };
  if (user.email.toLowerCase() === actorEmail) return { ok: false, error: "cannot_revoke_self" };
  // Env (permanent) admins can't be revoked in-app — they're config.
  if (isSuperAdminEmail(user.email)) return { ok: false, error: "cannot_revoke_permanent" };
  if (!user.isSuperAdmin) return { ok: false, error: "not_admin" };

  await prisma.user.update({ where: { id: user.id }, data: { isSuperAdmin: false } });
  await writeAudit({
    actorEmail,
    action: "admin.revoke",
    targetType: "user",
    targetId: user.id,
    targetLabel: user.email,
  });
  revalidatePath("/admin/operators");
  return { ok: true };
}
