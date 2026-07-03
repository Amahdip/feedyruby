import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberActions } from "@/app/(admin)/components/member-actions";
import { OrgDangerZone } from "@/app/(admin)/components/org-danger-zone";
import { fmtDate } from "@/app/(admin)/components/table-controls";
import { getTranslate } from "@/lingodotdev/server";
import { getSuperAdminSession, requireSuperAdmin } from "@/modules/admin/lib/auth";
import { getOrganizationDetail } from "@/modules/admin/lib/queries";
import { Badge } from "@/modules/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/modules/ui/components/table";

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("en-US");
const roleType = (r: string) =>
  r === "owner" ? "info" : r === "manager" ? "success" : r === "billing" ? "warning" : "gray";
const surveyType = (s: string) =>
  s === "inProgress" ? "success" : s === "paused" ? "warning" : s === "completed" ? "info" : "gray";

export default async function OrgDetailPage({ params }: { params: Promise<{ orgId: string }> }) {
  await requireSuperAdmin();
  const t = await getTranslate();
  const session = await getSuperAdminSession();
  const { orgId } = await params;
  const org = await getOrganizationDetail(orgId);
  if (!org) notFound();

  const actorEmail = session?.user?.email?.toLowerCase();
  const isOwnOrg = !!actorEmail && org.members.some((m) => m.email.toLowerCase() === actorEmail);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link
          href="/admin/organizations"
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4 rtl:rotate-180" /> {t("admin.organizations")}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
          {org.suspended && <Badge text={t("admin.status_suspended")} type="error" size="tiny" />}
        </div>
        <p className="text-sm text-slate-500">
          {t("admin.org_meta", {
            date: fmtDate(org.createdAt),
            members: org.members.length,
            workspaces: org.workspaces.length,
          })}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t("admin.members_access")}
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.email")}</TableHead>
                <TableHead>{t("admin.name")}</TableHead>
                <TableHead>{t("admin.role")}</TableHead>
                <TableHead>{t("admin.status")}</TableHead>
                <TableHead>{t("admin.last_login")}</TableHead>
                <TableHead className="text-end">{t("admin.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {org.members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/users/${m.id}`}
                      className="text-slate-800 hover:text-slate-900 hover:underline">
                      {m.email}
                    </Link>
                    {!m.isActive && (
                      <Badge text={t("admin.status_blocked")} type="error" size="tiny" className="ms-2" />
                    )}
                  </TableCell>
                  <TableCell>{m.name || "—"}</TableCell>
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
                  <TableCell className="text-slate-500">{fmtDate(m.lastLoginAt)}</TableCell>
                  <TableCell>
                    <MemberActions orgId={org.id} userId={m.id} email={m.email} role={m.role} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {t("admin.workspaces_surveys")}
        </h2>
        {org.workspaces.length === 0 ? (
          <p className="text-sm text-slate-400">{t("admin.no_workspaces")}</p>
        ) : (
          <div className="space-y-6">
            {org.workspaces.map((w) => (
              <div key={w.id}>
                <p className="mb-2 text-sm font-medium">
                  {w.name}{" "}
                  <span className="text-slate-400">
                    · {t("admin.n_surveys", { count: w.surveys.length })}
                  </span>
                </p>
                {w.surveys.length > 0 && (
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("admin.survey")}</TableHead>
                          <TableHead>{t("admin.status")}</TableHead>
                          <TableHead className="text-right">{t("admin.responses")}</TableHead>
                          <TableHead>{t("admin.created")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {w.surveys.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.name || t("admin.untitled")}</TableCell>
                            <TableCell>
                              <Badge
                                text={t(`admin.status_${s.status}`)}
                                type={surveyType(s.status)}
                                size="tiny"
                              />
                            </TableCell>
                            <TableCell className="text-right">{nf.format(s.responses)}</TableCell>
                            <TableCell className="text-slate-500">{fmtDate(s.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <OrgDangerZone orgId={org.id} orgName={org.name} suspended={org.suspended} isOwnOrg={isOwnOrg} />
    </div>
  );
}
