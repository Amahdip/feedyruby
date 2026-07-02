"use client";

import Link from "next/link";
import { useIsAuthed } from "@/modules/marketing/hooks/use-is-authed";

/**
 * Session-aware auth CTA for the shared marketing header. Logged-in visitors get
 * a single «داشبورد» button into the app (via /continue); everyone else — and
 * crawlers / first paint, since it defaults to "loading" → guest — sees the
 * ورود / شروع رایگان pair. Keeps the public pages usable while signed in.
 */
export function MarketingHeaderCta() {
  const authState = useIsAuthed();

  if (authState === "authed") {
    return (
      <Link
        href="/continue"
        className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-fr-violet via-fr-fuchsia to-fr-orange px-4 py-1.5 font-medium text-white shadow-sm transition-all hover:opacity-90">
        داشبورد
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/auth/login"
        className="font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
        ورود
      </Link>
      <Link
        href="/auth/signup"
        className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-fr-violet via-fr-fuchsia to-fr-orange px-4 py-1.5 font-medium text-white shadow-sm transition-all hover:opacity-90">
        شروع رایگان
      </Link>
    </>
  );
}
