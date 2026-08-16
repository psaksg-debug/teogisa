import { sql } from "drizzle-orm";
import { index, integer, pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

export const pgCategories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [
  uniqueIndex("idx_pg_categories_name").on(t.name),
  uniqueIndex("idx_pg_categories_slug").on(t.slug),
]);

export const pgPosts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  category: text("category").notNull(),
  tagsJson: text("tags_json").notNull().default("[]"),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  scheduledAt: text("scheduled_at"),
  readingMinutes: integer("reading_minutes").notNull().default(5),
  visual: text("visual").notNull().default("NEW"),
  authorName: text("author_name").notNull().default("데스크"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => [
  uniqueIndex("idx_pg_posts_slug").on(t.slug),
  index("idx_pg_posts_status_published").on(t.status, t.publishedAt),
  index("idx_pg_posts_category").on(t.category),
]);

export const pgPostingQueue = pgTable("posting_queue", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => pgPosts.id),
  status: text("status").notNull().default("waiting"),
  sourceUrl: text("source_url"),
  scheduledAt: text("scheduled_at"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => [
  index("idx_pg_queue_status_scheduled").on(t.status, t.scheduledAt),
]);

export const pgSiteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  valueJson: text("value_json").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pgContentAgents = pgTable("content_agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  mission: text("mission").notNull(),
  status: text("status").notNull().default("active"),
  cadenceHours: integer("cadence_hours").notNull().default(168),
  sourcesJson: text("sources_json").notNull().default("[]"),
  topicsJson: text("topics_json").notNull().default("[]"),
  videoJson: text("video_json"),
  nextRunAt: text("next_run_at"),
  lastRunAt: text("last_run_at"),
  topicCursor: integer("topic_cursor").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => [
  index("idx_pg_content_agents_status_next").on(t.status, t.nextRunAt),
]);

export const pgAgentRuns = pgTable("agent_runs", {
  id: serial("id").primaryKey(),
  agentId: text("agent_id").notNull().references(() => pgContentAgents.id),
  status: text("status").notNull(),
  topic: text("topic").notNull(),
  postId: integer("post_id").references(() => pgPosts.id),
  message: text("message"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => [
  index("idx_pg_agent_runs_agent_created").on(t.agentId, t.createdAt),
]);

export const pgManagementIssues = pgTable("management_issues", {
  id: serial("id").primaryKey(),
  issueKey: text("issue_key").notNull(),
  auditorId: text("auditor_id").notNull(),
  severity: text("severity").notNull(),
  scope: text("scope").notNull(),
  status: text("status").notNull().default("open"),
  title: text("title").notNull(),
  details: text("details").notNull(),
  actionTaken: text("action_taken"),
  postId: integer("post_id").references(() => pgPosts.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  resolvedAt: text("resolved_at"),
}, (t) => [
  uniqueIndex("idx_pg_management_issues_key").on(t.issueKey),
  index("idx_pg_management_issues_status_severity").on(t.status, t.severity, t.updatedAt),
]);

export const pgManagementRuns = pgTable("management_runs", {
  id: serial("id").primaryKey(),
  status: text("status").notNull(),
  checkedCount: integer("checked_count").notNull().default(0),
  issueCount: integer("issue_count").notNull().default(0),
  actionCount: integer("action_count").notNull().default(0),
  summary: text("summary").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => [
  index("idx_pg_management_runs_created").on(t.createdAt),
]);

export const pgOriginalityChecks = pgTable("originality_checks", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => pgPosts.id),
  editorName: text("editor_name").notNull(),
  title: text("title").notNull(),
  sourceUrl: text("source_url"),
  status: text("status").notNull(),
  overlapRatio: integer("overlap_ratio").notNull().default(0),
  longestMatchChars: integer("longest_match_chars").notNull().default(0),
  message: text("message").notNull(),
  checkedAt: text("checked_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => [
  index("idx_pg_originality_checks_status_checked").on(t.status, t.checkedAt),
]);

export const pgAuditRuns = pgTable("audit_runs", {
  id: serial("id").primaryKey(),
  scope: text("scope").notNull(),
  leadAuditor: text("lead_auditor").notNull(),
  status: text("status").notNull(),
  overallOpinion: text("overall_opinion").notNull(),
  totalItems: integer("total_items").notNull().default(0),
  passedItems: integer("passed_items").notNull().default(0),
  findingCount: integer("finding_count").notNull().default(0),
  startedAt: text("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
}, (t) => [
  index("idx_pg_audit_runs_completed").on(t.completedAt),
]);

export const pgAuditFindings = pgTable("audit_findings", {
  id: serial("id").primaryKey(),
  auditRunId: integer("audit_run_id").notNull().references(() => pgAuditRuns.id),
  domain: text("domain").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("open"),
  title: text("title").notNull(),
  details: text("details").notNull(),
  actionOwner: text("action_owner").notNull(),
  dueAt: text("due_at"),
  resolution: text("resolution"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  resolvedAt: text("resolved_at"),
}, (t) => [
  index("idx_pg_audit_findings_run_status").on(t.auditRunId, t.status),
  index("idx_pg_audit_findings_status_due").on(t.status, t.dueAt),
]);

export const pgMemberActivityPlans = pgTable("member_activity_plans", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull(),
  memberName: text("member_name").notNull(),
  teamId: text("team_id").notNull(),
  teamName: text("team_name").notNull(),
  role: text("role").notNull(),
  frequency: text("frequency").notNull(),
  intervalHours: integer("interval_hours"),
  dailyHourKst: integer("daily_hour_kst"),
  minuteOffset: integer("minute_offset").notNull().default(0),
  action: text("action").notNull(),
  taskTitle: text("task_title").notNull(),
  instruction: text("instruction").notNull(),
  safeOutput: text("safe_output").notNull(),
  requiresApproval: integer("requires_approval").notNull().default(0),
  status: text("status").notNull().default("active"),
  nextRunAt: text("next_run_at"),
  lastRunAt: text("last_run_at"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => [
  uniqueIndex("idx_pg_member_activity_plans_member").on(t.memberId),
  index("idx_pg_member_activity_plans_status_next").on(t.status, t.nextRunAt),
]);

export const pgMemberActivityRuns = pgTable("member_activity_runs", {
  id: serial("id").primaryKey(),
  planId: text("plan_id").notNull().references(() => pgMemberActivityPlans.id),
  memberName: text("member_name").notNull(),
  teamName: text("team_name").notNull(),
  action: text("action").notNull(),
  status: text("status").notNull(),
  summary: text("summary").notNull().default(""),
  startedAt: text("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
}, (t) => [
  index("idx_pg_member_activity_runs_plan_started").on(t.planId, t.startedAt),
]);
