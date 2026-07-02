import Link from "next/link";
import type { ReactNode } from "react";
import { APP_NAME, SCHOOL_NAME_FA, SCHOOL_URL } from "@/lib/brand-color";
import { FeedyRubyWordmark } from "@/modules/ui/components/feedyruby-brand";

/**
 * Shared chrome for the public marketing surface (templates, comparison pages).
 * A sticky header gives every page a clear way back to the homepage + into the
 * templates hub and signup; the footer repeats the internal links (and a
 * crawlable link to the parent brand SalamRuby) so link equity + topical context
 * flow across the whole catalog.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-gray-950/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" aria-label={APP_NAME} className="flex items-center">
            <FeedyRubyWordmark className="h-7 w-auto max-w-[8rem]" isRtl />
          </Link>
          <nav className="flex items-center gap-4 text-sm sm:gap-6">
            <Link
              href="/templates"
              className="font-medium text-slate-600 transition-colors hover:text-brand dark:text-slate-300">
              قالب‌ها
            </Link>
            <Link
              href="/alternatives/porsline"
              className="hidden font-medium text-slate-600 transition-colors hover:text-brand dark:text-slate-300 sm:inline">
              مقایسه با پرس‌لاین
            </Link>
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
          </nav>
        </div>
      </header>

      {children}

      <footer className="mt-16 border-t border-slate-200 py-10 text-sm text-slate-500 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/" className="transition-colors hover:text-brand hover:underline">
              خانه
            </Link>
            <Link href="/templates" className="transition-colors hover:text-brand hover:underline">
              قالب‌های آماده
            </Link>
            <Link
              href="/alternatives/porsline"
              className="transition-colors hover:text-brand hover:underline">
              مقایسه با پرس‌لاین
            </Link>
          </nav>
          <p>
            {APP_NAME} پروژه‌ای از{" "}
            <a
              href={SCHOOL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-700 transition-colors hover:text-brand hover:underline dark:text-slate-300">
              {SCHOOL_NAME_FA}
            </a>{" "}
            است.
          </p>
        </div>
      </footer>
    </>
  );
}
