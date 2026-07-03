import "server-only";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { authOptions } from "@/modules/auth/lib/authOptions";

/**
 * Access gate for the cross-tenant operator panel (/admin). Membership is driven
 * entirely by the SUPER_ADMIN_EMAILS env — a session email must be on that list.
 * Case-insensitive; if the env is empty, nobody can get in.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
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
  if (!isSuperAdminEmail(session?.user?.email) || isInactive(session)) return null;
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
  if (!isSuperAdminEmail(session.user.email) || isInactive(session)) notFound();
  return session;
}
