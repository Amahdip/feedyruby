import type { NextRequest } from "next/server";
import { getSuperAdminSession } from "@/modules/admin/lib/auth";
import { getUsersPage } from "@/modules/admin/lib/queries";

export const dynamic = "force-dynamic";

const d = (x?: Date | null) => (x ? new Date(x).toISOString().slice(0, 10) : "");
const esc = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: NextRequest) {
  const session = await getSuperAdminSession();
  if (!session) return new Response("Forbidden", { status: 403 });

  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const { rows } = await getUsersPage({ search: q, page: 1, pageSize: 5000 });

  const header = ["email", "name", "organization", "verified", "last_login", "joined", "active"];
  const body = rows.map((u) =>
    [
      u.email,
      u.name,
      u.org?.name ?? "",
      u.emailVerified ? "yes" : "no",
      d(u.lastLoginAt),
      d(u.createdAt),
      u.isActive ? "yes" : "no",
    ]
      .map(esc)
      .join(",")
  );
  const csv = "﻿" + [header.join(","), ...body].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="feedyruby-users.csv"',
    },
  });
}
