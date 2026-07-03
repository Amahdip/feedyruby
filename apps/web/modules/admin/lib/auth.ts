import "server-only";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@feedyruby/database";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { authOptions } from "@/modules/auth/lib/authOptions";

/**
 * PERMANENT (env) admins — a session email on the SUPER_ADMIN_EMAILS allowlist.
 * These can't be revoked in-app (they're config / break-glass). Case-insensitive.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Full admin check: permanent env admin OR DB-flagged (`User.isSuperAdmin`, which
 * the panel can grant/revoke). Env is checked first so it needs no DB query and
 * can never be locked out. Use this everywhere access is gated.
 */
export async function isSuperAdmin(user?: { id?: string; email?: string | null } | null): Promise<boolean> {
  if (!user) return false;
  if (isSuperAdminEmail(user.email)) return true;
  if (!user.id) return false;
  const row = await prisma.user.findUnique({ where: { id: user.id }, select: { isSuperAdmin: true } });
  return row?.isSuperAdmin === true;
}

// Defense in depth: the allowlist env is the primary revocation control, but the
// DB session (strategy:"database") also carries the live `isActive` flag — so a
// deactivated operator loses access immediately, without waiting for a redeploy.
const isInactive = (session: Session | null): boolean =>
  (session?.user as { isActive?: boolean } | undefined)?.isActive === false;

/**
 * For route handlers (CSV export etc.), where layouts don't run. Returns the
 * session only if the caller is an active super-admin, otherwise null (caller 403s).
 */
export async function getSuperAdminSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (isInactive(session) || !(await isSuperAdmin(session?.user))) return null;
  return session;
}

/**
 * Page-level guard: MUST be awaited at the very top of every /admin page, before
 * any data query. Next renders layout + page concurrently, so the layout's
 * redirect alone won't stop a page from fetching/streaming tenant data — calling
 * this first throws before any query runs, so nothing leaks. Unauthorized users
 * get a 404 (notFound) so the panel is indistinguishable from a missing route.
 */
export async function requireSuperAdmin(): Promise<Session> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");
  if (isInactive(session) || !(await isSuperAdmin(session.user))) notFound();
  return session;
}
