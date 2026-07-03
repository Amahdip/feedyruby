import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { fmtDate } from "@/app/(admin)/components/table-controls";
import { UserDetailActions } from "@/app/(admin)/components/user-detail-actions";
import { getTranslate } from "@/lingodotdev/server";
import { getSuperAdminSession, requireSuperAdmin } from "@/modules/admin/lib/auth";
import { getUserDetail } from "@/modules/admin/lib/queries";
import { Badge } from "@/modules/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/modules/ui/components/table";

export const dynamic = "force-dynamic";

const roleType = (r: string) =>
  r === "owner" ? "info" : r === "manager" ? "success" : r === "billing" ? "warning" : "gray";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const t = await getTranslate();
  const session = await getSuperAdminSession();
  const { id } = await params;
  const user = await getUserDetail(id);
  if (!user) notFound();

  const isSelf = session?.user?.email?.toLowerCase() === user.email.toLowerCase();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link
          href="/admin/users"
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4 rtl:rotate-180" /> {t("admin.users")}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{user.name || user.email}</h1>
          <Badge
            text={user.isActive ? t("admin.status_active") : t("admin.status_blocked")}
            type={user.isActive ? "success" : "error"}
            size="tiny"
          />
        </div>
        <p className="text-sm text-slate-500">{user.email}</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t("admin.actions")}
        </h2>
        <UserDetailActions
          userId={user.id}
          email={user.email}
          isActive={user.isActive}
          emailVerified={!!user.emailVerified}
          isSelf={isSelf}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t("admin.details")}
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <Row label={t("admin.verified")}>
            <Badge
              text={user.emailVerified ? t("admin.verified") : t("admin.unverified")}
              type={user.emailVerified ? "success" : "gray"}
              size="tiny"
            />
          </Row>
          <Row label={t("admin.two_factor")}>
            <Badge
              text={user.twoFactorEnabled ? t("admin.enabled") : t("admin.disabled")}
              type={user.twoFactorEnabled ? "success" : "gray"}
              size="tiny"
            />
          </Row>
          <Row label={t("admin.provider")}>{user.identityProvider}</Row>
          <Row label={t("admin.locale")}>{user.locale}</Row>
          <Row label={t("admin.last_login")}>{fmtDate(user.lastLoginAt)}</Row>
          <Row label={t("admin.joined")}>{fmtDate(user.createdAt)}</Row>
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t("admin.memberships")}
        </h2>
        {user.memberships.length === 0 ? (
          <p className="text-sm text-slate-400">{t("admin.no_memberships")}</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.organization")}</TableHead>
                  <TableHead>{t("admin.role")}</TableHead>
                  <TableHead>{t("admin.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.memberships.map((m) => (
                  <TableRow key={m.orgId}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/organizations/${m.orgId}`}
                        className="text-slate-600 hover:text-slate-900 hover:underline">
                        {m.orgName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge text={t(`admin.role_${m.role}`)} type={roleType(m.role)} size="tiny" />
                    </TableCell>
                    <TableCell>
                      <Badge
                        text={m.accepted ? t("admin.accepted") : t("admin.pending")}
                        type={m.accepted ? "success" : "warning"}
                        size="tiny"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-800">{children}</dd>
    </div>
  );
}
