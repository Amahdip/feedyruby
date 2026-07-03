"use client";

import {
  BarChart3,
  Building2,
  ExternalLink,
  LogOut,
  ScrollText,
  ShieldCheck,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { useSignOut } from "@/modules/auth/hooks/use-sign-out";

const LINKS = [
  { href: "/admin", labelKey: "admin.overview", icon: BarChart3, exact: true },
  { href: "/admin/users", labelKey: "admin.users", icon: Users, exact: false },
  { href: "/admin/organizations", labelKey: "admin.organizations", icon: Building2, exact: false },
  { href: "/admin/audit", labelKey: "admin.audit_log", icon: ScrollText, exact: false },
  { href: "/admin/operators", labelKey: "admin.operators", icon: ShieldCheck, exact: false },
  { href: "/admin/account", labelKey: "admin.account", icon: UserCircle, exact: false },
];

const isActive = (pathname: string, href: string, exact: boolean) =>
  exact ? pathname === href : pathname.startsWith(href);

export function AdminNav({
  userId,
  email,
  showBackToApp = true,
}: {
  userId: string;
  email: string;
  showBackToApp?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { signOut } = useSignOut({ id: userId, email });

  const logout = async () => {
    await signOut({ reason: "user_initiated", callbackUrl: "/auth/login", redirect: false });
    window.location.href = "/auth/login";
  };

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
          <button
            type="button"
            onClick={logout}
            aria-label={t("common.logout")}
            className="flex shrink-0 items-center rounded-md px-2 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-600">
            <LogOut className="size-3.5 rtl:rotate-180" />
          </button>
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
        <div className="space-y-2 border-t border-slate-100 px-4 py-4">
          <p className="truncate text-xs text-slate-400" title={email}>
            {email}
          </p>
          {showBackToApp && (
            <Link
              href="/continue"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900">
              <ExternalLink className="size-3" /> {t("admin.back_to_app")}
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600">
            <LogOut className="size-3 rtl:rotate-180" /> {t("common.logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
