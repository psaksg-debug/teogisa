# Schedules and maintenance contract

## Contents

1. Time rules
2. Editorial job
3. Individual member plans
4. SEO job
5. Governance and operations
6. Scheduler implementation

## Time rules

- Business timezone: `Asia/Seoul`.
- Store run timestamps in UTC and display/report in KST.
- Use a durable run key such as `<job-id>:<scheduled-utc>`.
- Lock, retry with bounded backoff, and retain failed runs.
- Do not catch up by mass publishing after downtime.

## Editorial job

Run hourly at minute 0.

1. Exclude politics, parties, elections, politicians, and political conflict.
2. Research one candidate for each of seven editorial sections.
3. Record primary sources, dates, audience, exceptions, and real interest evidence.
4. Compare public, scheduled, draft, review, and failed history for duplicate intent and conclusions.
5. Advance at most one candidate to a complete draft per hour.
6. Save as draft/review. Never publish without approval evidence.
7. Add useful contextual official links and purposeful embeds with a text fallback.

## Individual member plans

Recreate all 36 plans in `assets/config/member-activity-policy.json`; do not infer only the five team-level jobs.

- The lead of each non-management department runs every 12 hours.
- Other non-management members run daily at the exact KST hour/minute stored in their plan.
- The management policy lead and operations guard run every 6 hours; site safety runs every 24 hours.
- Editorial, quality/design, and promotion outputs require approval and remain review artifacts.
- The six persistent content agents in `assets/config/content-agents.json` keep their separate 16-hour draft cadence. They are not replacements for individual member plans.

## SEO job

Run daily at 09:00 and 18:00 KST.

- Check public availability, robots, sitemap, canonical, noindex, metadata, structured data, author, internal links, official links, content freshness, and AI citation readiness.
- Treat external 401, 403, 429, and timeout as manual-review warnings; cross-check before removal.
- Prepare organic campaign copy and UTM plans only for public posts.
- Do not change Search Console, Naver, Bing, GA4, DNS, or deploy automatically.

## Governance and operations

- Run operational monitoring at least every six hours.
- Run a full governance audit monthly and after material permission/schema changes.
- Audit overdue review items, failed agents, missing sources, publication-policy violations, promotion/publication mismatches, and unresolved critical findings.
- Keep approval-required jobs in review rather than executing externally.

## Scheduler implementation

Map both `assets/config/schedules.json` and `assets/config/member-activity-policy.json` to the target scheduler:

- Cloudflare: Cron Triggers/Queues/Workflows
- Vercel: Cron Jobs plus durable SQL locking
- VPS/Docker: systemd timer or cron invoking an authenticated internal job endpoint
- Managed workflow: provider scheduler plus database idempotency

Do not rely on an AI chat thread staying open. Persist job definition, next run, status, attempts, error, output artifact, and approval requirement in the database.
