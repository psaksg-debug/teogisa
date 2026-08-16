# Data and interface contract

## Contents

1. Durable entities
2. Repository boundary
3. Migration rules
4. Required upgrades

## Durable entities

Migrate these logical entities and their history:

- `categories`
- `posts`
- `posting_queue`
- `site_settings`
- `content_agents`, `agent_runs`
- `promotion_campaigns`
- `management_issues`, `management_runs`
- `originality_checks`
- `audit_runs`, `audit_findings`
- `member_activity_plans`, `member_activity_runs`
- administrator/session tables created by migrations

Preserve IDs when practical. Always preserve unique slugs, created/updated timestamps, status, source URL, scheduled time, failure messages, and audit evidence.

## Repository boundary

Keep route handlers dependent on repository functions rather than a provider SDK. Split the current repository into:

```text
domain/                 pure rules and types
repositories/           interfaces
repositories/sqlite/    D1 or SQLite implementation
repositories/postgres/  optional PostgreSQL implementation
services/               publishing, scheduling, audit, export
```

Minimum interfaces:

- posts: list/get/create/update/schedule/publish/unpublish
- queue: enqueue/list/claim/complete/fail/retry
- agents: list/update/run/record result
- approvals: request/approve/reject/verify scope
- audits: run/list findings/resolve with evidence
- promotions: prepare/approve/record channel execution
- backup: export/import/verify counts

## Migration rules

1. Create and test a backup before target writes.
2. Apply target schema in a transaction when supported.
3. Import parents before children.
4. Record source count, target count, rejected rows, and checksum per entity.
5. Validate foreign keys and unique slugs.
6. Compare at least five representative posts and all non-published statuses.
7. Freeze source writes during final delta transfer.
8. Keep target private until application and data parity pass.

Never transfer secret values in JSON export. Transfer only secret names and re-enter values in the target secret manager.

## Required upgrades

Add these before declaring safe parity:

- A durable approval entity with approver, scope, artifact/version, decision, timestamp, evidence, and revocation.
- Explicit post state or joined workflow that distinguishes `draft`, `review`, `needs_revision`, `approved`, `scheduled`, `published`, and `unpublished`.
- A publish-time transaction that revalidates approval, policy, originality, and schedule.
- A global hourly content limit and idempotency key.
- Channel-specific promotion states separating prepared, approved, posted, failed, and paid-ad execution.
- Resolution evidence and revalidation for management/audit findings.

