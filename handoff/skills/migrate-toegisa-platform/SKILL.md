---
name: migrate-toegisa-platform
description: Migrate, rebuild, or hand off the Korean 퇴.기.사 content platform from OpenAI Sites to Cloudflare, Vercel, a VPS, Docker, or another host while preserving reusable React content, database data, editorial agents, schedules, approval gates, automatic draft generation, SEO maintenance, backups, and rollback. Use when Claude, Gemini, Codex, or another coding agent must reproduce the current site on a different server, audit migration parity, restore from a handoff bundle, or replace Sites/D1-specific infrastructure without losing operating rules.
---

# Migrate 퇴.기.사 Platform

Rebuild the product and its operating system, not only the visible pages. Preserve user-facing behavior, data, roles, schedules, review evidence, failure history, and approval boundaries.

## Start here

1. Locate the extracted project root. Never assume the original absolute path exists.
2. Read `TOEGISA_AGENT_CONTEXT.md`, `HANDOFF.md`, `COMPANY_RULES.md`, `RELEASE_POLICY.md`, `CENTRAL_CONTROL_ROOM.md`, and `HOURLY_EDITORIAL_ASSIGNMENTS.md` when present.
3. Read [current-stack.md](references/current-stack.md) and run `node scripts/inventory-project.mjs <project-root>`.
4. Read [migration-runbook.md](references/migration-runbook.md). Choose one target path and record the decision before editing.
5. Read [data-and-interfaces.md](references/data-and-interfaces.md) before changing storage, authentication, scheduling, or APIs.
6. Read [operations-and-agents.md](references/operations-and-agents.md) and [schedules-and-maintenance.md](references/schedules-and-maintenance.md) before recreating agents or jobs.
7. Read [known-gaps.md](references/known-gaps.md). Do not reproduce a known safety defect as a required feature.
8. Generate the target provider's root instruction file with `node <skill-dir>/scripts/bootstrap-provider.mjs <project-root> <claude|gemini|generic>`. Do not copy a template without resolving its skill path.

## Preserve these invariants

- Keep the public brand, Korean content, routes, responsive design, structured data, official-source links, tools, and accessible link/embed behavior unless the user approves a change.
- Keep `AI draft -> review -> approval evidence -> scheduled -> published`. Never replace it with unreviewed automatic publication.
- Keep site publication, external social posting, paid advertising, remote database changes, DNS changes, and production deployment as separate approvals.
- Preserve failed, blocked, deferred, and review work with reason, timestamp, owner, and retry state.
- Keep political topics excluded from the hourly editorial candidate workflow.
- Research seven section candidates per hour but advance at most one full draft per hour. Do not mass-publish search-result rewrites.
- Keep internal agent rosters, operating prompts, secrets, and approval rules out of public pages.
- Keep one writer responsible for each shared file or migration component. Parallelize read-only research and review only.
- Distinguish implemented, locally verified, remotely applied, deployed, and production-verified states.

## Choose the target

Prefer the smallest compatible move:

- **Standalone Cloudflare Workers + D1:** retain vinext, React, Drizzle SQLite schema, D1-style repository, and Worker-compatible output. Replace Sites metadata and deployment control only.
- **Node/VPS/Docker:** retain React pages, domain modules, CSS, content, and tests. Replace vinext/Worker runtime, `cloudflare:workers`, D1 access, scheduled triggers, secrets, and deployment packaging. Prefer PostgreSQL for multi-writer production or SQLite for a single-node controlled deployment.
- **Vercel or another Next.js host:** retain most routes and components. Replace D1 with Postgres or a supported SQLite service, adapt runtime APIs, and use the host scheduler for due jobs.
- **Unknown target:** produce a compatibility matrix first. Do not edit until runtime, database, scheduler, file storage, authentication, secret management, logs, backup, and rollback choices are explicit.

Use [current-stack.md](references/current-stack.md) for the reuse/replace matrix.

## Execute the migration

### 1. Freeze and inventory

- Record source commit, working-tree changes, build status, data export timestamp, active schedules, secrets by name only, and production URL.
- Treat untracked files as user assets. Do not delete or automatically add them.
- Do not copy `.env*`, `.dev.vars`, cookies, tokens, local databases, logs, build caches, or credentials into the handoff.
- Run `node scripts/validate-handoff.mjs <project-root>` before packaging.

### 2. Establish a replaceable platform boundary

- Preserve UI and domain logic first.
- Introduce explicit adapters for database, authentication/session, scheduler, object storage, analytics, and deployment.
- Keep route handlers thin. Put data access behind repository functions.
- Keep dates in UTC in storage and convert schedules from Asia/Seoul deliberately.
- Make scheduled jobs idempotent with a run key, lock, retry count, and durable result.

### 3. Recreate data safely

- Export the source through the authenticated export route or an approved database dump.
- Apply schema migrations to an empty target database before importing data.
- Migrate posts, categories, queue, settings, agents, runs, promotions, issues, audit evidence, and activity plans.
- Compare row counts, unique slugs, statuses, timestamps, and foreign-key relationships.
- Keep the source read-only until target verification and rollback evidence are complete.

### 4. Recreate agents and schedules

- Load `assets/config/organization.json`, `member-activity-policy.json`, `agents.json`, `content-agents.json`, `team-permissions.json`, `schedules.json`, and `approval-policy.json` as the portable source of intent.
- Map each role to the target provider's subagent or worker mechanism. If subagents are unavailable, execute the roles sequentially and keep their reports separate.
- Put recurring execution in the host scheduler and database queue, not in chat memory.
- Require the same status report: objective, evidence, changed files, validation, blockers, next owner, and required approval.

### 5. Validate parity

- Run the original build and regression suite, then target-specific tests.
- Verify routes, metadata, canonical URLs, robots, sitemap, RSS, JSON-LD, images, text links, embeds, calculators, search, admin login, draft creation, review queue, scheduling, failure retention, audit, export, and rollback.
- Test 375px mobile and desktop. Confirm no horizontal overflow and that keyboard focus is controlled.
- Run one scheduler cycle against test data. Prove that an unapproved draft cannot become public.
- Compare source and target data and representative rendered HTML before cutover.

### 6. Cut over only with approval

- Request separate approval for target database write, target deployment, DNS switch, and external promotion.
- Deploy a versioned candidate, verify its private or staging URL, then switch traffic atomically.
- Keep the previous production version and database backup recoverable.
- Verify the public domain after cutover. Record the exact version, time, checks, and rollback point.

## Provider-neutral agent behavior

- Claude: run `node <skill-dir>/scripts/bootstrap-provider.mjs <project-root> claude`, then load the generated `CLAUDE.md`, this skill, and only the required references.
- Gemini: run `node <skill-dir>/scripts/bootstrap-provider.mjs <project-root> gemini`, then load the generated `GEMINI.md` and the same portable JSON definitions.
- Codex/OpenAI: use this skill directly; `agents/openai.yaml` is optional UI metadata only.
- Other systems: run the bootstrap with `generic` to create `AGENTS.md`, or translate the same resolved instruction file into the provider's supported format.

The bootstrap refuses to overwrite an existing provider instruction file. Use `--force` only after reviewing and preserving any existing instructions.

Do not claim that a provider-specific chat task, approval state, or local automation migrated merely because its prompt was copied. Recreate it in durable target infrastructure and verify one real run.

## Packaging

After the user approves creation of a transfer archive, run this from any directory, replacing `<skill-dir>` with the directory containing this `SKILL.md`:

```bash
bash <skill-dir>/scripts/package-handoff.sh <project-root> <output.tar.gz>
```

The command refuses to overwrite an existing archive unless `--force` is supplied. The archive intentionally excludes secrets, Git internals, caches, build output, local databases, logs, and nested archives, audits its own file list, and prints its SHA-256 checksum. Send credentials through the target host's secret manager, never through the archive.

## Completion report

Report:

1. Target architecture and changed platform boundaries
2. Reused and replaced components
3. Data migration counts and exceptions
4. Agent and schedule parity
5. Validation evidence
6. Implemented, deployed, and production-verified status separately
7. Remaining blockers and approvals
8. Rollback location and procedure
