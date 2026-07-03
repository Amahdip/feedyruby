import Link from "next/link";
import { AdminSearchBar, Pagination, fmtDate } from "@/app/(admin)/components/table-controls";
import { getTranslate } from "@/lingodotdev/server";
import { requireSuperAdmin } from "@/modules/admin/lib/auth";
import { getUsersPage } from "@/modules/admin/lib/queries";
import { Badge } from "@/modules/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/modules/ui/components/table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireSuperAdmin();
  const t = await getTranslate();
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Number(sp.page) || 1;
  const { rows, total, pageSize } = await getUsersPage({ search: q, page });

  const exportHref = q ? `/admin/export/users?q=${encodeURIComponent(q)}` : "/admin/export/users";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.users")}</h1>
          <p className="text-sm text-slate-500">{t("admin.total_signups", { count: total })}</p>
        </div>
        <a
          href={exportHref}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium leading-9 text-slate-700 hover:bg-slate-50">
          {t("admin.export_csv")}
        </a>
      </div>

      <AdminSearchBar action="/admin/users" placeholder={t("admin.search_users")} defaultValue={q} />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.email")}</TableHead>
              <TableHead>{t("admin.name")}</TableHead>
              <TableHead>{t("admin.organization")}</TableHead>
              <TableHead>{t("admin.verified")}</TableHead>
              <TableHead>{t("admin.last_login")}</TableHead>
              <TableHead>{t("admin.joined")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-400">
                  {t("admin.no_users")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="max-w-[20rem] truncate font-medium" title={u.email}>
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-slate-800 hover:text-slate-900 hover:underline">
                      {u.email}
                    </Link>
                    {!u.isActive && (
                      <Badge text={t("admin.status_blocked")} type="error" size="tiny" className="ms-2" />
                    )}
                  </TableCell>
                  <TableCell className="max-w-[14rem] truncate" title={u.name || undefined}>
                    {u.name || "—"}
                  </TableCell>
                  <TableCell>
                    {u.org ? (
                      <Link
                        href={`/admin/organizations/${u.org.id}`}
                        className="text-slate-600 hover:text-slate-900 hover:underline">
                        {u.org.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      text={u.emailVerified ? t("admin.verified") : t("admin.unverified")}
                      type={u.emailVerified ? "success" : "gray"}
                      size="tiny"
                    />
                  </TableCell>
                  <TableCell className="text-slate-500">{fmtDate(u.lastLoginAt)}</TableCell>
                  <TableCell className="text-slate-500">{fmtDate(u.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination basePath="/admin/users" page={page} pageSize={pageSize} total={total} query={q} />
    </div>
  );
}
