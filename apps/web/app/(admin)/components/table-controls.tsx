import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getTranslate } from "@/lingodotdev/server";

// Realtime search bar lives in its own client module; re-exported here so the
// pages keep importing search + pagination from one place.
export { AdminSearchBar } from "@/app/(admin)/components/admin-search-bar";

export async function Pagination({
  basePath,
  page,
  pageSize,
  total,
  query,
}: {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  query?: string;
}) {
  const t = await getTranslate();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Clamp the displayed page so an out-of-range ?page=9999 doesn't render a
  // nonsensical range/label (the query itself is unaffected).
  const p = Math.min(Math.max(1, page), totalPages);
  const from = total ? (p - 1) * pageSize + 1 : 0;
  const to = Math.min(p * pageSize, total);
  const href = (n: number) => {
    const s = new URLSearchParams();
    if (query) s.set("q", query);
    if (n > 1) s.set("page", String(n));
    const qs = s.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span>{t("admin.range_of", { from, to, total })}</span>
      <div className="flex items-center gap-3">
        {p > 1 ? (
          <Link
            href={href(p - 1)}
            className="flex items-center gap-1 font-medium text-slate-700 hover:underline">
            <ChevronLeft className="size-4 rtl:rotate-180" /> {t("admin.prev")}
          </Link>
        ) : (
          <span className="flex items-center gap-1 opacity-40">
            <ChevronLeft className="size-4 rtl:rotate-180" /> {t("admin.prev")}
          </span>
        )}
        <span>{t("admin.page_of", { page: p, total: totalPages })}</span>
        {p < totalPages ? (
          <Link
            href={href(p + 1)}
            className="flex items-center gap-1 font-medium text-slate-700 hover:underline">
            {t("admin.next")} <ChevronRight className="size-4 rtl:rotate-180" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 opacity-40">
            {t("admin.next")} <ChevronRight className="size-4 rtl:rotate-180" />
          </span>
        )}
      </div>
    </div>
  );
}

export const fmtDate = (d?: Date | string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "—");
