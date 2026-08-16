# Known gaps that must not be copied as guarantees

Treat these as migration acceptance blockers until current code or the target implementation proves them resolved.

- Post status currently exposes `draft`, `scheduled`, and `published`; review is partly represented in a separate queue. `needs_revision` is a documented intent, not a complete post-state contract.
- A durable approval record with approver, time, scope, artifact/version, and evidence is missing.
- A privileged administrator can move a post directly to scheduled or published without the full documented approval chain.
- Due-post publication does not reliably revalidate approval, originality, policy, and quality at execution time.
- A seed fallback can keep a bundled public article reachable when a database record is absent or unpublished. Define explicit not-found/unpublished precedence.
- Duplicate detection focuses on long body-text overlap and does not fully block duplicate title, search intent, or conclusion.
- Agent topic rotation can regenerate equivalent topics; political exclusion, hourly global limit, and interest evidence are not fully code-enforced.
- Promotion state is too coarse to distinguish organic channel posts, paid advertising, approval, failure, and evidence.
- Some management findings can be marked resolved without cause-removal and revalidation evidence.
- Public seed categories, admin choices, agent categories, and the seven editorial sections are not one canonical taxonomy.
- Current lint and mobile/accessibility audits have unresolved items, including menu focus handling and internal agent-roster exposure.
- Local build/test does not prove remote D1 migration, deployment, Search Console/analytics connection, or real-user mobile acceptance.

Preserve content and operations history, but improve these controls on the target. Report each as fixed, accepted risk, or still blocked with evidence.
