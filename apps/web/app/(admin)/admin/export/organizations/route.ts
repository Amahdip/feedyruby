import type { NextRequest } from "next/server";
import { getSuperAdminSession } from "@/modules/admin/lib/auth";
import { getOrganizationsPage } from "@/modules/admin/lib/queries";

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
  const { rows } = await getOrganizationsPage({ search: q, page: 1, pageSize: 5000 });

  const header = ["organization", "owner_email", "members", "workspaces", "surveys", "responses", "created"];
  const body = rows.map((o) =>
    [o.name, o.ownerEmail ?? "", o.members, o.workspaces, o.surveys, o.responses, d(o.createdAt)]
      .map(esc)
      .join(",")
  );
  const csv = "﻿" + [header.join(","), ...body].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="feedyruby-organizations.csv"',
    },
  });
}
