import { Pagination, fmtDate } from "@/app/(admin)/components/table-controls";
import { getTranslate } from "@/lingodotdev/server";
import { requireSuperAdmin } from "@/modules/admin/lib/auth";
import { getAuditPage } from "@/modules/admin/lib/queries";
import { Badge } from "@/modules/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/modules/ui/components/table";

export const dynamic = "force-dynamic";

const actionType = (action: string) =>
  action.endsWith(".delete") ||
  action.endsWith(".block") ||
  action.endsWith(".suspend") ||
  action.endsWith(".remove")
    ? "error"
    : action.endsWith(".unblock") || action.endsWith(".unsuspend") || action.endsWith(".verify_email")
      ? "success"
      : "gray";

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperAdmin();
  const t = await getTranslate();
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { rows, total, pageSize } = await getAuditPage({ page });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.audit_log")}</h1>
        <p className="text-sm text-slate-500">{t("admin.audit_log_hint")}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.when")}</TableHead>
              <TableHead>{t("admin.actor")}</TableHead>
              <TableHead>{t("admin.action")}</TableHead>
              <TableHead>{t("admin.target")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-400">
                  {t("admin.no_audit")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const key = `admin.audit_${r.action.replace(/\./g, "_")}`;
                const label = t(key);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-slate-500">{fmtDate(r.createdAt)}</TableCell>
                    <TableCell className="font-medium">{r.actorEmail}</TableCell>
                    <TableCell>
                      <Badge
                        text={label === key ? r.action : label}
                        type={actionType(r.action)}
                        size="tiny"
                      />
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {r.targetLabel || r.targetId || "—"}
                      {Object.keys(r.meta).length > 0 && (
                        <span className="ms-2 text-xs text-slate-400">{JSON.stringify(r.meta)}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination basePath="/admin/audit" page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
