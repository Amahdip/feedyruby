# FeedyRuby Operator Admin Panel — Implementation Review

> Read-only, gated cross-tenant "operator" dashboard for a Formbricks fork
> (Next.js 16 App Router, Prisma/Postgres, NextAuth). **Uncommitted / not deployed.**

## 1. Context
- FeedyRuby = multi-tenant survey SaaS with **open public signup**. Each signup creates its **own isolated organization** (owner = the new user). Data is scoped by `organizationId`; no cross-org access anywhere in the app.
- Formbricks ships **no super-admin / instance-operator view**. This adds one at `/admin`, visible only to a small allowlist of operator emails.

## 2. Scope
**v1 (this change, read-only):** Overview (totals + 90-day signups chart), Users list (search/paginate + CSV), Organizations list w/ usage (members/workspaces/surveys/responses + CSV), Org detail (members & roles + surveys with response counts).
**Deferred to v2 (not built):** destructive actions (suspend/delete/verify), impersonation/login-as, viewing response *content*, audit log, billing/revenue (service is currently free).

## 3. Files
| File | Purpose |
|---|---|
| `lib/env.ts`, `lib/constants.ts` | Add `SUPER_ADMIN_EMAILS` (comma-separated env → lowercased string[]) |
| `modules/admin/lib/auth.ts` | `isSuperAdminEmail()`, `getSuperAdminSession()` (route handlers), `requireSuperAdmin()` (pages) |
| `modules/admin/lib/queries.ts` | Cross-org read queries: overview, users page, orgs page, org detail |
| `app/(admin)/layout.tsx` | Session + super-admin gate; renders sidebar + main |
| `app/(admin)/components/*` | `admin-nav` (client, active links), `signups-chart` (client, recharts area), `table-controls` (server: SearchBar/Pagination/fmtDate) |
| `app/(admin)/admin/page.tsx` | Overview |
| `app/(admin)/admin/users/page.tsx` | Users table |
| `app/(admin)/admin/organizations/page.tsx` | Orgs table |
| `app/(admin)/admin/organizations/[orgId]/page.tsx` | Org detail |
| `app/(admin)/admin/export/{users,organizations}/route.ts` | CSV (self-gated, 403 if not super-admin) |

## 4. Security gate — the critical part
- **Allowlist:** `SUPER_ADMIN_EMAILS` (env, comma-separated, lowercased). Empty ⇒ nobody can access.
- **Sessions are DATABASE-backed** (`authOptions.session.strategy === "database"`). Therefore edge middleware + `getToken` (JWT) **cannot** read the session — the *only* reliable gate is `getServerSession(authOptions)` in server components. (We considered middleware and rejected it for this reason.)
- **Concurrent-render leak (found & fixed):** Next renders `layout` and `page` **concurrently**, so a redirect in the *layout alone* does **not** stop the page from running its query and streaming tenant data. Verified: with only the layout gate, an unauthenticated `GET /admin` streamed the overview page (and its data) in the SSR HTML.
  **Fix:** `await requireSuperAdmin()` is called at the **top of every page**, before any query. It `redirect()`s unauthorized users so the query never runs and no JSX is returned. Re-verified: unauthenticated responses contain **no** overview data / user emails; they redirect to `/auth/login`.
- Route handlers (CSV) don't get a layout, so they self-gate via `getSuperAdminSession()` → `403`.
- `layout.tsx` sets `robots: noindex`.

## 5. Data / performance
- **No N+1:** org-usage (surveys/responses per org) uses batched queries per page — collect workspace ids → one `survey.findMany` → one `response.groupBy({by:['surveyId']})` → aggregate in JS by `workspace→org`.
- `getInstanceOverview` = parallel `count()`s + a single `findMany` of last-90-day signups bucketed by day in JS (gap-filled).
- All pages are `force-dynamic` (no cache; every load hits DB — acceptable for a low-traffic operator tool).
- CSV export capped at 5000 rows (logged/known limit).

## 6. Privacy
- Operator sees user emails/names, org names, membership roles, survey titles + **counts**. Deliberately **not** shown: actual response content (what respondents submitted) — deferred to v2.

## 7. Areas worth a reviewer's scrutiny
1. **Prod redirect behavior:** confirm `redirect()` at the top of a Server Component reliably prevents child render/stream in a production build (verified in dev; prod is stricter — expected fine).
2. **Scale:** `response.count()` (full-table) and the `groupBy` on responses; `contains`/ILIKE search on `email`/`name` (no dedicated index). Fine now; may want indexes/caching later.
3. **Isolation:** confirm no query accidentally exposes response *content*; confirm the allowlist is the single source of truth.
4. **Route group nesting:** `app/(admin)` sits under the root `app/layout.tsx` (global providers). Confirm no global provider assumes an org context.

## 8. How to test locally
1. Add to `apps/web/.env` (or `.env.local`): `SUPER_ADMIN_EMAILS=your-local-account@example.com`
2. Restart the dev server (env is read at process start).
3. Log into FeedyRuby locally with that email → visit `/admin`.
4. Check: a non-listed account is redirected away; users/orgs/overview render correct data; search + pagination; CSV downloads; org detail shows members/roles + survey counts.
