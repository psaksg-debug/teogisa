CREATE TABLE `member_activity_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`member_name` text NOT NULL,
	`team_id` text NOT NULL,
	`team_name` text NOT NULL,
	`role` text NOT NULL,
	`frequency` text NOT NULL,
	`interval_hours` integer,
	`daily_hour_kst` integer,
	`minute_offset` integer DEFAULT 0 NOT NULL,
	`action` text NOT NULL,
	`task_title` text NOT NULL,
	`instruction` text NOT NULL,
	`safe_output` text NOT NULL,
	`requires_approval` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`next_run_at` text,
	`last_run_at` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_member_activity_plans_member` ON `member_activity_plans` (`member_id`);--> statement-breakpoint
CREATE INDEX `idx_member_activity_plans_status_next` ON `member_activity_plans` (`status`,`next_run_at`);--> statement-breakpoint
CREATE TABLE `member_activity_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` text NOT NULL,
	`member_name` text NOT NULL,
	`team_name` text NOT NULL,
	`action` text NOT NULL,
	`status` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`plan_id`) REFERENCES `member_activity_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_member_activity_runs_plan_started` ON `member_activity_runs` (`plan_id`,`started_at`);
--> statement-breakpoint
PRAGMA optimize;
