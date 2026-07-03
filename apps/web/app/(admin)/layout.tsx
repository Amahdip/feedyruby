import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminNav } from "@/app/(admin)/components/admin-nav";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { isRtlLocale } from "@/lib/i18n/rtl";
import { getOrganizationsByUserId } from "@/lib/organization/service";
import { getUserLocale } from "@/lib/user/service";
import { requireSuperAdmin } from "@/modules/admin/lib/auth";

export const metadata: Metadata = {
  title: "Operator · FeedyRuby",
  robots: { index: false, follow: false },
};

/**
 * Chrome for the cross-tenant operator panel. Gating lives in requireSuperAdmin
 * (allowlist + active check); each page also calls it before querying, since
 * Next renders layout + page concurrently. Direction follows the operator's
 * locale (RTL for Farsi), matching the rest of the app.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireSuperAdmin();
  const locale = (await getUserLocale(session.user.id)) ?? DEFAULT_LOCALE;
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";
  // A pure operator (no customer org) has no app dashboard to go "back" to —
  // hide the link so it doesn't just loop back to the panel.
  const hasApp = (await getOrganizationsByUserId(session.user.id)).length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 md:flex-row" dir={dir}>
      <AdminNav email={session.user.email ?? ""} showBackToApp={hasApp} />
      <main className="min-w-0 flex-1 overflow-x-auto px-4 py-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
