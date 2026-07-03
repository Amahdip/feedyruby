import { SignupsChart } from "@/app/(admin)/components/signups-chart";
import { getTranslate } from "@/lingodotdev/server";
import { requireSuperAdmin } from "@/modules/admin/lib/auth";
import { getInstanceOverview } from "@/modules/admin/lib/queries";
import { Card, CardContent } from "@/modules/ui/components/card";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
        {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}

export default async function AdminOverviewPage() {
  await requireSuperAdmin();
  const t = await getTranslate();
  const o = await getInstanceOverview();
  const nf = new Intl.NumberFormat("en-US");
  const verifiedPct = o.totals.users ? Math.round((o.verifiedUsers / o.totals.users) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.overview")}</h1>
        <p className="text-sm text-slate-500">{t("admin.overview_subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat
          label={t("admin.users")}
          value={nf.format(o.totals.users)}
          sub={t("admin.new_in_30d", { count: o.newUsers30d })}
        />
        <Stat label={t("admin.organizations")} value={nf.format(o.totals.organizations)} />
        <Stat label={t("admin.surveys")} value={nf.format(o.totals.surveys)} />
        <Stat label={t("admin.responses")} value={nf.format(o.totals.responses)} />
        <Stat
          label={t("admin.verified")}
          value={`${verifiedPct}%`}
          sub={t("admin.n_users", { count: o.verifiedUsers })}
        />
        <Stat label={t("admin.active_30d")} value={nf.format(o.activeUsers30d)} sub={t("admin.logged_in")} />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t("admin.signups_90d")}</h2>
            <span className="text-xs text-slate-400">{t("admin.n_in_30d", { count: o.newUsers30d })}</span>
          </div>
          <SignupsChart data={o.signups} />
        </CardContent>
      </Card>
    </div>
  );
}
