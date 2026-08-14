CREATE TABLE `audit_findings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`audit_run_id` integer NOT NULL,
	`domain` text NOT NULL,
	`severity` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`title` text NOT NULL,
	`details` text NOT NULL,
	`action_owner` text NOT NULL,
	`due_at` text,
	`resolution` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`resolved_at` text,
	FOREIGN KEY (`audit_run_id`) REFERENCES `audit_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_findings_run_status` ON `audit_findings` (`audit_run_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_audit_findings_status_due` ON `audit_findings` (`status`,`due_at`);--> statement-breakpoint
CREATE TABLE `audit_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scope` text NOT NULL,
	`lead_auditor` text NOT NULL,
	`status` text NOT NULL,
	`overall_opinion` text NOT NULL,
	`total_items` integer DEFAULT 0 NOT NULL,
	`passed_items` integer DEFAULT 0 NOT NULL,
	`finding_count` integer DEFAULT 0 NOT NULL,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_audit_runs_completed` ON `audit_runs` (`completed_at`);--> statement-breakpoint
PRAGMA optimize;
