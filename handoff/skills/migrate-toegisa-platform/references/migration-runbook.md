# Migration runbook

## Contents

1. Discovery
2. Target design
3. Implementation
4. Data transfer
5. Verification
6. Cutover and rollback

## 1. Discovery

- Run the inventory and handoff validators.
- Bootstrap the selected provider instruction file and verify that its resolved skill path opens from the extracted project.
- Record Git head and untracked files without modifying them.
- Record production URL, current host, database type, schedules, environment variable names, and known blockers.
- Obtain an authenticated content export and a database-native backup if authorized.

## 2. Target design

Write a one-page decision containing:

- runtime and hosting provider
- SQL database and file/object storage
- authentication/session mechanism
- scheduler/queue and idempotency approach
- secret manager
- logging/monitoring
- preview, deployment, DNS, backup, and rollback
- expected code reuse and replacement

If the user has not selected a host, recommend standalone Cloudflare as the lowest-change route, or Node/Postgres for maximum provider portability. Do not choose based only on agent preference.

## 3. Implementation

1. Make the current build pass before changing infrastructure.
2. Introduce platform adapters without rewriting the public UI.
3. Port storage and authentication.
4. Port automation and approval checks.
5. Fix safety gaps listed in `known-gaps.md`.
6. Add target-specific integration tests.
7. Keep the old site serving during all work.

## 4. Data transfer

- Apply schema to an empty target.
- Dry-run import and produce a reconciliation report.
- Repair rejected records explicitly; never drop them silently.
- Freeze writes, export the final delta, and repeat reconciliation.
- Keep the source backup immutable through the rollback period.

## 5. Verification

- Build and automated regression pass.
- Representative public/admin routes render.
- 375px mobile and desktop pass.
- Search, calculators, links, embeds, RSS, sitemap, and JSON-LD pass.
- Admin login and owner-only API denial pass.
- Draft/review/schedule/publish/unpublish transitions pass.
- Unapproved and failed jobs remain non-public.
- One scheduled test job executes exactly once.
- All 36 organization members have exactly one reconstructed activity plan, and all six content agents retain the 16-hour draft cadence.
- Backup restore succeeds in a disposable environment.

## 6. Cutover and rollback

Request explicit approval for target DB write, deployment, DNS, and any external message separately. Lower DNS TTL only with approval. Deploy the target, verify privately, freeze writes, transfer the delta, switch traffic, and verify the custom domain.

Rollback when health, data counts, authentication, publication gating, or core routes fail. Restore traffic to the prior version; do not improvise a destructive database rollback. Record incident, impact, temporary action, cause, recovery, and prevention.
