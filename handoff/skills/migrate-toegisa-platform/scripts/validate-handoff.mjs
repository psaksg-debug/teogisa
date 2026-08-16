#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(process.argv[2] || process.cwd());
const skill = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredProject = [
  "package.json",
  "app/page.tsx",
  "lib/repository.ts",
  "db/schema.ts",
  "TOEGISA_AGENT_CONTEXT.md",
  "COMPANY_RULES.md",
  "RELEASE_POLICY.md",
];
const requiredSkill = [
  "SKILL.md",
  "agents/openai.yaml",
  "references/current-stack.md",
  "references/data-and-interfaces.md",
  "references/operations-and-agents.md",
  "references/schedules-and-maintenance.md",
  "references/migration-runbook.md",
  "references/known-gaps.md",
  "assets/CLAUDE.md.template",
  "assets/GEMINI.md.template",
  "assets/AGENTS.md.template",
  "assets/config/agents.json",
  "assets/config/content-agents.json",
  "assets/config/organization.json",
  "assets/config/member-activity-policy.json",
  "assets/config/team-permissions.json",
  "assets/config/schedules.json",
  "assets/config/approval-policy.json",
  "assets/config/handoff-manifest.template.json",
  "scripts/bootstrap-provider.mjs",
  "scripts/inventory-project.mjs",
  "scripts/package-handoff.sh",
];
const jsonFiles = [
  "agents.json",
  "content-agents.json",
  "organization.json",
  "member-activity-policy.json",
  "team-permissions.json",
  "schedules.json",
  "approval-policy.json",
  "handoff-manifest.template.json",
];
const failures = [];
const configs = {};

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

for (const file of requiredProject) {
  if (!(await exists(path.join(root, file)))) failures.push(`missing project file: ${file}`);
}
for (const file of requiredSkill) {
  if (!(await exists(path.join(skill, file)))) failures.push(`missing skill file: ${file}`);
}
for (const file of jsonFiles) {
  try {
    configs[file] = JSON.parse(await fs.readFile(path.join(skill, "assets/config", file), "utf8"));
  } catch (error) {
    failures.push(`invalid JSON ${file}: ${error.message}`);
  }
}

const organization = configs["organization.json"];
const activity = configs["member-activity-policy.json"];
const agents = configs["agents.json"];
const contentAgents = configs["content-agents.json"];
const permissions = configs["team-permissions.json"];
const schedules = configs["schedules.json"];
const approvals = configs["approval-policy.json"];

if (organization && activity) {
  const departments = organization.departments ?? [];
  const members = departments.flatMap((department) =>
    (department.members ?? []).map((member) => `${department.id}:${member.id}`),
  );
  const memberSet = new Set(members);
  const planIds = (activity.plans ?? []).map((plan) => plan.id);
  const planSet = new Set(planIds);
  if (departments.length !== 5) failures.push(`organization department count must be 5, got ${departments.length}`);
  if (members.length !== 36 || organization.summary?.employees !== 36) failures.push(`organization employee count must be 36, got ${members.length}`);
  if (memberSet.size !== members.length) failures.push("duplicate organization member id");
  if (planIds.length !== 36 || activity.planCount !== 36) failures.push(`member activity plan count must be 36, got ${planIds.length}`);
  if (planSet.size !== planIds.length) failures.push("duplicate member activity plan id");
  for (const id of memberSet) if (!planSet.has(id)) failures.push(`missing member activity plan: ${id}`);
  for (const id of planSet) if (!memberSet.has(id)) failures.push(`activity plan has no organization member: ${id}`);
  const actionIds = new Set(Object.keys(activity.actions ?? {}));
  for (const plan of activity.plans ?? []) {
    if (!actionIds.has(plan.action)) failures.push(`unknown activity action for ${plan.id}: ${plan.action}`);
    if (!["interval-hours", "daily-kst"].includes(plan.schedule?.type)) failures.push(`invalid schedule type for ${plan.id}`);
  }
}

if (agents && (agents.roles?.length !== 8 || new Set(agents.roles?.map((role) => role.id)).size !== 8)) {
  failures.push("portable role configuration must contain 8 unique roles");
}
if (contentAgents && (contentAgents.agents?.length !== 6 || contentAgents.defaultCadenceHours !== 16)) {
  failures.push("content agent configuration must contain 6 agents with a 16-hour default cadence");
}
if (permissions && (permissions.teams?.length !== 6 || permissions.productionDeployAuthority !== "owner")) {
  failures.push("team permissions must contain 6 profiles and owner-only production deployment authority");
}
const hourlyEditorial = schedules?.jobs?.find((job) => job.id === "hourly-editorial");
if (!hourlyEditorial || hourlyEditorial.sections?.length !== 7 || hourlyEditorial.maxDraftsPerRun !== 1 || hourlyEditorial.excludePolitics !== true || hourlyEditorial.initialState !== "draft-review") {
  failures.push("hourly editorial job must keep 7 sections, politics exclusion, one-draft limit, and draft-review output");
}
for (const action of ["publish-site-content", "production-deploy", "remote-database-write", "dns-change", "external-social-post", "paid-advertising"]) {
  if (!approvals?.separateExplicitApprovalRequired?.includes(action)) failures.push(`approval policy missing protected action: ${action}`);
}

for (const file of ["CLAUDE.md.template", "GEMINI.md.template", "AGENTS.md.template"]) {
  try {
    const text = await fs.readFile(path.join(skill, "assets", file), "utf8");
    if (!text.includes("{{TOEGISA_SKILL_PATH}}") || !text.includes("{{TOEGISA_SKILL_DIR}}")) failures.push(`provider template missing portable placeholders: ${file}`);
    if (text.includes("handoff/skills/migrate-toegisa-platform/SKILL.md")) failures.push(`provider template contains a hard-coded project-relative skill path: ${file}`);
  } catch {
    // Missing files are already reported above.
  }
}

const forbidden = [];
const absolutePathLeaks = [];
const textExtensions = new Set([".md", ".json", ".mjs", ".sh", ".yaml", ".yml"]);
async function scan(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(skill, absolute);
    if (entry.isSymbolicLink()) {
      forbidden.push(`${relative} (symbolic link)`);
    } else if (entry.isDirectory()) {
      await scan(absolute);
    } else if (entry.isFile()) {
      if (/^\.DS_Store$|^\.env(?:\.|$)|^\.dev\.vars$|^\.npmrc$|^\.pypirc$|^\.netrc$|^(?:credentials|secrets?)(?:[._-].*)?$|^service-account.*\.json$|\.(?:pem|key|p12|pfx|sqlite|sqlite3|db|log)$/i.test(entry.name)) forbidden.push(relative);
      if (textExtensions.has(path.extname(entry.name).toLowerCase())) {
        const text = await fs.readFile(absolute, "utf8");
        if (/\/Users\/[^/]+\/|[A-Za-z]:\\Users\\/.test(text)) absolutePathLeaks.push(relative);
      }
    }
  }
}
await scan(skill);
if (forbidden.length) failures.push(`forbidden files in skill: ${forbidden.join(", ")}`);
if (absolutePathLeaks.length) failures.push(`local absolute paths leaked in skill: ${absolutePathLeaks.join(", ")}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`handoff validation passed: ${requiredProject.length} project files, ${requiredSkill.length} skill files, 36 member plans`);
