"use client";

import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const fmtTick = (d: string) => d.slice(5); // MM-DD

export function SignupsChart({ data }: { data: { date: string; count: number }[] }) {
  const { t } = useTranslation();
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <div className="h-64 w-full" role="img" aria-label={t("admin.signups_aria", { count: total })}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} accessibilityLayer margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="fr-signups" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtTick}
            minTickGap={40}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            allowDecimals={false}
            width={34}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            labelFormatter={(l) => String(l)}
            formatter={(v: number) => [v, t("admin.signups")]}
          />
          <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} fill="url(#fr-signups)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
