import { prisma } from "@feedyruby/database";
import { GrantAdminForm } from "@/app/(admin)/components/grant-admin-form";
import { RevokeAdminButton } from "@/app/(admin)/components/revoke-admin-button";
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

  const select = { id: true, email: true, name: true, isActive: true, lastLoginAt: true } as const;
  const [envUsers, dbAdmins] = await Promise.all([
    prisma.user.findMany({ where: { email: { in: SUPER_ADMIN_EMAILS } }, select }),
    prisma.user.findMany({ where: { isSuperAdmin: true }, select }),
  ]);
  const envByEmail = new Map(envUsers.map((u) => [u.email.toLowerCase(), u]));
  const envSet = new Set(SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()));

  // Permanent (env) admins first, then DB-managed (revocable) admins.
  const rows = [
    ...SUPER_ADMIN_EMAILS.map((email) => ({
      email,
      user: envByEmail.get(email.toLowerCase()) ?? null,
      permanent: true,
    })),
    ...dbAdmins
      .filter((u) => !envSet.has(u.email.toLowerCase()))
      .map((u) => ({ email: u.email, user: u, permanent: false })),
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.operators")}</h1>
        <p className="text-sm text-slate-500">{t("admin.operators_hint")}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">{t("admin.add_admin")}</p>
        <GrantAdminForm />
        <p className="mt-2 text-xs text-slate-400">{t("admin.add_admin_hint")}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.email")}</TableHead>
              <TableHead>{t("admin.name")}</TableHead>
              <TableHead>{t("admin.status")}</TableHead>
              <TableHead>{t("admin.last_login")}</TableHead>
              <TableHead className="text-end">{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ email, user, permanent }) => {
              const isSelf = me === email.toLowerCase();
              return (
                <TableRow key={email}>
                  <TableCell className="font-medium">
                    {email}
                    {isSelf && (
                      <Badge text={t("admin.operator_you")} type="info" size="tiny" className="ms-2" />
                    )}
                    {permanent && (
                      <Badge text={t("admin.admin_permanent")} type="gray" size="tiny" className="ms-2" />
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
                  <TableCell className="text-end">
                    {!permanent && !isSelf && user ? (
                      <RevokeAdminButton userId={user.id} email={email} />
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
