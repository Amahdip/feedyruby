import "server-only";
import { prisma } from "@feedyruby/database";

/**
 * Cross-tenant read queries for the operator panel. These deliberately are NOT
 * scoped by organization (unlike the rest of the app) — they run only behind the
 * super-admin gate (see modules/admin/lib/auth + app/(admin)/layout).
 */

export const ADMIN_PAGE_SIZE = 25;

const dayKey = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

export interface InstanceOverview {
  totals: { users: number; organizations: number; surveys: number; responses: number };
  verifiedUsers: number;
  activeUsers30d: number;
  newUsers30d: number;
  signups: { date: string; count: number }[]; // last 90 days, gap-filled
}

export async function getInstanceOverview(): Promise<InstanceOverview> {
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 864e5);
  const since90 = new Date(now.getTime() - 90 * 864e5);

  const [users, organizations, surveys, responses, verifiedUsers, activeUsers30d, recent] = await Promise.all(
    [
      prisma.user.count(),
      prisma.organization.count(),
      prisma.survey.count(),
      prisma.response.count(),
      prisma.user.count({ where: { emailVerified: { not: null } } }),
      prisma.user.count({ where: { lastLoginAt: { gte: since30 } } }),
      prisma.user.findMany({ where: { createdAt: { gte: since90 } }, select: { createdAt: true } }),
    ]
  );

  // Bucket signups by day, gap-filled across the 90-day window. Seed 91 buckets
  // (0..90) so the oldest bucket (now-90d) covers the full `>= since90` fetch —
  // otherwise a signup in [now-90d, now-89d) would pass the query but have no
  // bucket and be silently dropped from the chart.
  const buckets = new Map<string, number>();
  for (let i = 0; i <= 90; i++) {
    buckets.set(dayKey(new Date(now.getTime() - i * 864e5)), 0);
  }
  let newUsers30d = 0;
  for (const u of recent) {
    const k = dayKey(u.createdAt);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
    if (u.createdAt >= since30) newUsers30d++;
  }
  const signups = [...buckets.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totals: { users, organizations, surveys, responses },
    verifiedUsers,
    activeUsers30d,
    newUsers30d,
    signups,
  };
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  emailVerified: Date | null;
  lastLoginAt: Date | null;
  isActive: boolean;
  org: { id: string; name: string } | null;
}

export async function getUsersPage(opts: { search?: string; page?: number; pageSize?: number }): Promise<{
  rows: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? ADMIN_PAGE_SIZE;
  const q = opts.search?.trim();
  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { name: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
        lastLoginAt: true,
        isActive: true,
        memberships: {
          select: { role: true, organization: { select: { id: true, name: true } } },
          orderBy: { organization: { createdAt: "asc" } },
        },
      },
    }),
  ]);

  const rows: AdminUserRow[] = users.map((u) => {
    // Prefer the org this user owns (their own self-serve org), else the first.
    const owner = u.memberships.find((m) => m.role === "owner") ?? u.memberships[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt,
      emailVerified: u.emailVerified,
      lastLoginAt: u.lastLoginAt,
      isActive: u.isActive,
      org: owner?.organization ?? null,
    };
  });

  return { rows, total, page, pageSize };
}

export interface AdminOrgRow {
  id: string;
  name: string;
  createdAt: Date;
  ownerEmail: string | null;
  members: number;
  workspaces: number;
  surveys: number;
  responses: number;
}

export async function getOrganizationsPage(opts: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  rows: AdminOrgRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? ADMIN_PAGE_SIZE;
  const q = opts.search?.trim();
  const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {};

  const [total, orgs] = await Promise.all([
    prisma.organization.count({ where }),
    prisma.organization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { memberships: true, workspaces: true } },
        memberships: {
          where: { role: "owner" },
          take: 1,
          select: { user: { select: { email: true } } },
        },
        workspaces: { select: { id: true } },
      },
    }),
  ]);

  // Batched survey/response counts for just this page's orgs (no N+1).
  const wsToOrg = new Map<string, string>();
  for (const o of orgs) for (const w of o.workspaces) wsToOrg.set(w.id, o.id);
  const workspaceIds = [...wsToOrg.keys()];

  const surveysPerOrg = new Map<string, number>();
  const responsesPerOrg = new Map<string, number>();
  const surveyToOrg = new Map<string, string>();

  if (workspaceIds.length) {
    const surveys = await prisma.survey.findMany({
      where: { workspaceId: { in: workspaceIds } },
      select: { id: true, workspaceId: true },
    });
    for (const s of surveys) {
      const orgId = wsToOrg.get(s.workspaceId);
      if (!orgId) continue;
      surveyToOrg.set(s.id, orgId);
      surveysPerOrg.set(orgId, (surveysPerOrg.get(orgId) ?? 0) + 1);
    }
    if (surveys.length) {
      const grouped = await prisma.response.groupBy({
        by: ["surveyId"],
        where: { surveyId: { in: surveys.map((s) => s.id) } },
        _count: { _all: true },
      });
      for (const g of grouped) {
        const orgId = surveyToOrg.get(g.surveyId);
        if (!orgId) continue;
        responsesPerOrg.set(orgId, (responsesPerOrg.get(orgId) ?? 0) + g._count._all);
      }
    }
  }

  const rows: AdminOrgRow[] = orgs.map((o) => ({
    id: o.id,
    name: o.name,
    createdAt: o.createdAt,
    ownerEmail: o.memberships[0]?.user.email ?? null,
    members: o._count.memberships,
    workspaces: o._count.workspaces,
    surveys: surveysPerOrg.get(o.id) ?? 0,
    responses: responsesPerOrg.get(o.id) ?? 0,
  }));

  return { rows, total, page, pageSize };
}

export interface AdminOrgDetail {
  id: string;
  name: string;
  createdAt: Date;
  members: {
    id: string;
    email: string;
    name: string;
    role: string;
    accepted: boolean;
    isActive: boolean;
    lastLoginAt: Date | null;
  }[];
  /** Derived: org counts as suspended when it has members and all of them are blocked. */
  suspended: boolean;
  workspaces: {
    id: string;
    name: string;
    surveys: { id: string; name: string; status: string; createdAt: Date; responses: number }[];
  }[];
}

export async function getOrganizationDetail(orgId: string): Promise<AdminOrgDetail | null> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      memberships: {
        select: {
          role: true,
          accepted: true,
          user: { select: { id: true, email: true, name: true, lastLoginAt: true, isActive: true } },
        },
      },
      workspaces: { select: { id: true, name: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!org) return null;

  const workspaceIds = org.workspaces.map((w) => w.id);
  const surveys = workspaceIds.length
    ? await prisma.survey.findMany({
        where: { workspaceId: { in: workspaceIds } },
        orderBy: { createdAt: "desc" },
        take: 500, // bound fan-out for an outlier org with thousands of surveys
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          workspaceId: true,
          _count: { select: { responses: true } },
        },
      })
    : [];

  const members = org.memberships.map((m) => ({
    id: m.user.id,
    email: m.user.email,
    name: m.user.name,
    role: m.role,
    accepted: m.accepted,
    isActive: m.user.isActive,
    lastLoginAt: m.user.lastLoginAt,
  }));

  return {
    id: org.id,
    name: org.name,
    createdAt: org.createdAt,
    members,
    suspended: members.length > 0 && members.every((m) => !m.isActive),
    workspaces: org.workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      surveys: surveys
        .filter((s) => s.workspaceId === w.id)
        .map((s) => ({
          id: s.id,
          name: s.name,
          status: String(s.status),
          createdAt: s.createdAt,
          responses: s._count.responses,
        })),
    })),
  };
}

export interface AdminUserDetail {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  emailVerified: Date | null;
  lastLoginAt: Date | null;
  isActive: boolean;
  twoFactorEnabled: boolean;
  identityProvider: string;
  locale: string;
  memberships: { orgId: string; orgName: string; role: string; accepted: boolean }[];
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      emailVerified: true,
      lastLoginAt: true,
      isActive: true,
      twoFactorEnabled: true,
      identityProvider: true,
      locale: true,
      memberships: {
        select: {
          role: true,
          accepted: true,
          organization: { select: { id: true, name: true } },
        },
        orderBy: { organization: { createdAt: "asc" } },
      },
    },
  });
  if (!u) return null;

  return {
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
    emailVerified: u.emailVerified,
    lastLoginAt: u.lastLoginAt,
    isActive: u.isActive,
    twoFactorEnabled: u.twoFactorEnabled,
    identityProvider: String(u.identityProvider),
    locale: u.locale,
    memberships: u.memberships.map((m) => ({
      orgId: m.organization.id,
      orgName: m.organization.name,
      role: m.role,
      accepted: m.accepted,
    })),
  };
}

export interface AdminAuditRow {
  id: string;
  createdAt: Date;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string | null;
  targetLabel: string | null;
  meta: Record<string, unknown>;
}

export async function getAuditPage(opts: { page?: number; pageSize?: number }): Promise<{
  rows: AdminAuditRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? ADMIN_PAGE_SIZE;

  const [total, rows] = await Promise.all([
    prisma.adminAuditLog.count(),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    rows: rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      actorEmail: r.actorEmail,
      action: r.action,
      targetType: r.targetType,
      targetId: r.targetId,
      targetLabel: r.targetLabel,
      meta: (r.meta ?? {}) as Record<string, unknown>,
    })),
    total,
    page,
    pageSize,
  };
}
