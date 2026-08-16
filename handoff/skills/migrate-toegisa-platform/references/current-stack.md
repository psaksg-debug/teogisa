# Current stack and portability map

## Contents

1. Source architecture
2. Reuse/replace matrix
3. Required source files
4. Runtime contracts

## Source architecture

- Product: Korean retirement action-content site `퇴.기.사`, canonical domain `https://adbles.com`.
- Frontend: React 19, App Router-style routes, TypeScript, shared CSS.
- Build/runtime: vinext beta, Vite, Cloudflare Worker-compatible server output.
- Current hosting control: OpenAI Sites metadata in `.openai/hosting.json`.
- Database: Cloudflare D1 accessed through `cloudflare:workers`, Drizzle SQLite schema, SQL migrations in `drizzle/`.
- Storage: no active R2 binding in current metadata.
- Authentication: app-owned administrator session in `lib/site-admin.ts` and admin API guards.
- Content/API boundary: `lib/repository.ts` plus route handlers in `app/api/`.
- Automation: content agents, member activity plans, posting queue, audit tables, and external Codex heartbeat definitions.
- Verification: `npm test`, `tests/rendered-html.test.mjs`, `tests/mobile-check.mjs`, `scripts/seo-audit.mjs`.

## Reuse/replace matrix

| Surface | Reuse | Replace or adapt |
| --- | --- | --- |
| Public pages and components | `app/` routes and React components | Framework imports only if target is not Next-compatible |
| Design | `app/globals.css`, image assets, responsive rules | Host-specific asset delivery if necessary |
| Content | `lib/content.ts`, data export, D1 rows | Import mechanism and asset URLs |
| Domain rules | content, team, originality, audit, release-policy modules | Fix known safety gaps while preserving intent |
| SEO | metadata, sitemap, RSS, JSON-LD, canonical rules | Base URL/environment injection and target cache behavior |
| Database schema | logical tables and relations | D1/SQLite driver to Postgres/SQLite target driver |
| Repository | public function contract | Raw D1 queries and `D1Database` types |
| Authentication | session behavior and owner-only APIs | Cookie/session storage and secret injection |
| Scheduler | due-job functions and queue concepts | Codex heartbeat/Sites trigger to cron, queue, or workflow service |
| Deployment | versioned build and rollback policy | `.openai/hosting.json`, Sites packaging, deployment connector |

## Required source files

Read before migration:

- `package.json`, lockfile, `next.config.ts`, `.openai/hosting.json`
- `db/index.ts`, `db/schema.ts`, `drizzle/`
- `lib/repository.ts`, `lib/site-admin.ts`, `lib/team-permissions.ts`
- `lib/content-agents.ts`, `lib/member-activity-plans.ts`
- `lib/originality-check.ts`, `lib/internal-audit.ts`, `lib/release-policy.ts`
- `app/api/`, `app/admin/`, `app/posts/[slug]/page.tsx`
- `TOEGISA_AGENT_CONTEXT.md`, `COMPANY_RULES.md`, `RELEASE_POLICY.md`
- `.codex/agents/` and current external automation definitions when accessible

## Runtime contracts

The target must supply:

- SQL transactions, prepared parameters, migrations, and durable timestamps
- secure owner authentication and session cookies
- recurring scheduler with KST-aware configuration
- idempotency/locking for due jobs
- secret manager and audit-safe logs
- build, preview/staging, atomic deploy, rollback, and health checks
- backup/export and tested restore

Do not retain `import { env } from "cloudflare:workers"` on a generic Node target. Replace `db/index.ts` with an injected database adapter and remove D1 types from domain-facing interfaces.

