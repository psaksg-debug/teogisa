CREATE TABLE `management_issues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_key` text NOT NULL,
	`auditor_id` text NOT NULL,
	`severity` text NOT NULL,
	`scope` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`title` text NOT NULL,
	`details` text NOT NULL,
	`action_taken` text,
	`post_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`resolved_at` text,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_management_issues_key` ON `management_issues` (`issue_key`);--> statement-breakpoint
CREATE INDEX `idx_management_issues_status_severity` ON `management_issues` (`status`,`severity`,`updated_at`);--> statement-breakpoint
CREATE TABLE `management_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text NOT NULL,
	`checked_count` integer DEFAULT 0 NOT NULL,
	`issue_count` integer DEFAULT 0 NOT NULL,
	`action_count` integer DEFAULT 0 NOT NULL,
	`summary` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_management_runs_created` ON `management_runs` (`created_at`);
--> statement-breakpoint
PRAGMA optimize;
