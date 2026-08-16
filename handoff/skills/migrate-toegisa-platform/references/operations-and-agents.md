# Organization and agent operating contract

## Contents

1. Organization map
2. Role map
3. Delegation protocol
4. Provider mapping
5. Reporting contract

## Organization map

The exact portable snapshot lives in `assets/config/organization.json`: one executive, five departments, and 36 members. `assets/config/member-activity-policy.json` contains one recurring activity plan for every member. Validate both together; a member without a plan or a plan without a member is a migration failure.

The five departments are content planning, editorial, quality/design, promotion, and management. The executive retains final publication, production deployment, and major resource approval. Department roles do not inherit executive authority merely because a provider grants broad agent permissions.

## Role map

The eight task-agent definitions live in `assets/config/agents.json`. They complement the 36-member organization rather than replacing it.

- Content director: decide audience problem, portfolio, brief, and handoff; never publish.
- Official-source researcher: verify changing/high-risk facts from primary sources; read-only.
- Content editor: write only from an approved brief and evidence; output draft or needs revision.
- Quality/design reviewer: verify mobile, accessibility, imagery, embeds, and reader experience; read-only.
- SEO/GEO editor: verify discoverability and citation readiness without promising rank; read-only.
- Governance auditor: independently verify policy, permissions, evidence, and completion claims; read-only.
- Promotion planner: prepare channel copy only for confirmed public posts; never post or spend.
- Release manager: own approved code integration and validation; deploy only with explicit approval.

## Delegation protocol

Every task assignment must state:

- objective and audience
- inputs and authoritative files
- file ownership or read-only boundary
- deliverable and completion criteria
- validation command or evidence
- prohibited external actions
- required next approval

Parallelize source research, SEO review, quality review, and governance review. Assign a single writer for shared source, schema, deployment, and merged handoff files.

## Provider mapping

Use the provider's native worker/subagent feature when available. Do not encode dependence on a particular tool name.

- Claude: run `scripts/bootstrap-provider.mjs <project-root> claude`, create isolated role prompts from `agents.json`, and restrict write-capable agents to named files.
- Gemini: run `scripts/bootstrap-provider.mjs <project-root> gemini`, create role-scoped tasks or run sequential role passes, and keep outputs as artifacts.
- Codex: map roles to agent definitions; preserve the same read/write boundaries.
- No subagent support: run roles sequentially in separate sections, never combine writer and approver decisions silently.

Subagents are created for tasks; they are not the production scheduler. Scheduled content and maintenance must run through durable backend jobs.

## Reporting contract

Every role returns:

1. Requested objective
2. Evidence and as-of date
3. Result or changed files
4. Validation performed
5. Unknown, blocked, or failed items
6. Next owner and required approval

Completion requires the underlying cause to be removed and revalidated. A build pass alone is not deployment or user acceptance.
