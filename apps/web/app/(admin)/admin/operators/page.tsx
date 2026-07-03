import { prisma } from "@feedyruby/database";
import { fmtDate } from "@/app/(admin)/components/table-controls";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { getTranslate } from "@/lingodotdev/server";
import { getSuperAdminSession, requireSuperAdmin } from "@/modules/admin/lib/auth";
import { Badge } from "@/modules/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/modules/ui/components/table";

export const dynamic = "force-dynamic";

export default async function AdminOperatorsPage() {
  await requireSuperAdmin();
  const t = await getTranslate();
  const session = await getSuperAdminSession();
  const me = session?.user?.email?.toLowerCase();

  // Operators are defined by the SUPER_ADMIN_EMAILS env; enrich each with its
  // user record (if the person has signed up) so we can show name/status.
  const users = await prisma.user.findMany({
    where: { email: { in: SUPER_ADMIN_EMAILS } },
    select: { email: true, name: true, isActive: true, lastLoginAt: true },
  });
  const byEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));

  const rows = SUPER_ADMIN_EMAILS.map((email) => ({ email, user: byEmail.get(email.toLowerCase()) ?? null }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.operators")}</h1>
        <p className="text-sm text-slate-500">{t("admin.operators_hint")}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.email")}</TableHead>
              <TableHead>{t("admin.name")}</TableHead>
              <TableHead>{t("admin.status")}</TableHead>
              <TableHead>{t("admin.last_login")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ email, user }) => (
              <TableRow key={email}>
                <TableCell className="font-medium">
                  {email}
                  {me === email.toLowerCase() && (
                    <Badge text={t("admin.operator_you")} type="info" size="tiny" className="ms-2" />
                  )}
                </TableCell>
                <TableCell>{user?.name || "—"}</TableCell>
                <TableCell>
                  {!user ? (
                    <Badge text={t("admin.not_registered")} type="warning" size="tiny" />
                  ) : (
                    <Badge
                      text={user.isActive ? t("admin.status_active") : t("admin.status_blocked")}
                      type={user.isActive ? "success" : "error"}
                      size="tiny"
                    />
                  )}
                </TableCell>
                <TableCell className="text-slate-500">{fmtDate(user?.lastLoginAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        {t("admin.operators_env_note")}
      </p>
    </div>
  );
}
