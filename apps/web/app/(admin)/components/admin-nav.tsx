"use client";

import { BarChart3, Building2, ExternalLink, ScrollText, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", labelKey: "admin.overview", icon: BarChart3, exact: true },
  { href: "/admin/users", labelKey: "admin.users", icon: Users, exact: false },
  { href: "/admin/organizations", labelKey: "admin.organizations", icon: Building2, exact: false },
  { href: "/admin/audit", labelKey: "admin.audit_log", icon: ScrollText, exact: false },
];

const isActive = (pathname: string, href: string, exact: boolean) =>
  exact ? pathname === href : pathname.startsWith(href);

export function AdminNav({ email, showBackToApp = true }: { email: string; showBackToApp?: boolean }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile top bar (< md) */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5 md:hidden">
        <span className="text-sm font-bold">
          FeedyRuby{" "}
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {t("admin.operator")}
          </span>
        </span>
        <nav className="-mx-1 ms-auto flex items-center gap-1 overflow-x-auto">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium",
                isActive(pathname, l.href, l.exact)
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}>
              <l.icon className="size-3.5" />
              {t(l.labelKey)}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop sidebar (md+) */}
      <aside className="hidden w-56 shrink-0 flex-col border-e border-slate-200 bg-white md:flex">
        <div className="px-5 py-5">
          <p className="text-sm font-bold tracking-tight">FeedyRuby</p>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{t("admin.operator")}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(pathname, l.href, l.exact)
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}>
              <l.icon className="size-4" />
              {t(l.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 px-4 py-4">
          <p className="truncate text-xs text-slate-400" title={email}>
            {email}
          </p>
          {showBackToApp && (
            <Link
              href="/continue"
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900">
              <ExternalLink className="size-3" /> {t("admin.back_to_app")}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
