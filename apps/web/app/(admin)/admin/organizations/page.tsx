import Link from "next/link";
import { AdminSearchBar, Pagination, fmtDate } from "@/app/(admin)/components/table-controls";
import { getTranslate } from "@/lingodotdev/server";
import { requireSuperAdmin } from "@/modules/admin/lib/auth";
import { getOrganizationsPage } from "@/modules/admin/lib/queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/modules/ui/components/table";

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("en-US");

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireSuperAdmin();
  const t = await getTranslate();
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Number(sp.page) || 1;
  const { rows, total, pageSize } = await getOrganizationsPage({ search: q, page });

  const exportHref = q
    ? `/admin/export/organizations?q=${encodeURIComponent(q)}`
    : "/admin/export/organizations";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.organizations")}</h1>
          <p className="text-sm text-slate-500">{t("admin.n_total", { count: total })}</p>
        </div>
        <a
          href={exportHref}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium leading-9 text-slate-700 hover:bg-slate-50">
          {t("admin.export_csv")}
        </a>
      </div>

      <AdminSearchBar action="/admin/organizations" placeholder={t("admin.search_orgs")} defaultValue={q} />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.organization")}</TableHead>
              <TableHead>{t("admin.owner")}</TableHead>
              <TableHead className="text-right">{t("admin.members")}</TableHead>
              <TableHead className="text-right">{t("admin.workspaces")}</TableHead>
              <TableHead className="text-right">{t("admin.surveys")}</TableHead>
              <TableHead className="text-right">{t("admin.responses")}</TableHead>
              <TableHead>{t("admin.created")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-400">
                  {t("admin.no_orgs")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/organizations/${o.id}`} className="hover:underline">
                      {o.name}
                    </Link>
                  </TableCell>
                  <TableCell
                    className="max-w-[18rem] truncate text-slate-500"
                    title={o.ownerEmail ?? undefined}>
                    {o.ownerEmail ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">{nf.format(o.members)}</TableCell>
                  <TableCell className="text-right">{nf.format(o.workspaces)}</TableCell>
                  <TableCell className="text-right">{nf.format(o.surveys)}</TableCell>
                  <TableCell className="text-right font-medium">{nf.format(o.responses)}</TableCell>
                  <TableCell className="text-slate-500">{fmtDate(o.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination basePath="/admin/organizations" page={page} pageSize={pageSize} total={total} query={q} />
    </div>
  );
}
