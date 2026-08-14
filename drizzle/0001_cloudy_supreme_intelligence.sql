CREATE TABLE `content_agents` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`mission` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`cadence_hours` integer DEFAULT 168 NOT NULL,
	`sources_json` text DEFAULT '[]' NOT NULL,
	`topics_json` text DEFAULT '[]' NOT NULL,
	`video_json` text,
	`next_run_at` text,
	`last_run_at` text,
	`topic_cursor` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_content_agents_status_next` ON `content_agents` (`status`,`next_run_at`);--> statement-breakpoint
CREATE TABLE `agent_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` text NOT NULL,
	`status` text NOT NULL,
	`topic` text NOT NULL,
	`post_id` integer,
	`message` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`agent_id`) REFERENCES `content_agents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_agent_runs_agent_created` ON `agent_runs` (`agent_id`,`created_at`);
