CREATE TABLE `originality_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer,
	`editor_name` text NOT NULL,
	`title` text NOT NULL,
	`source_url` text,
	`status` text NOT NULL,
	`overlap_ratio` integer DEFAULT 0 NOT NULL,
	`longest_match_chars` integer DEFAULT 0 NOT NULL,
	`message` text NOT NULL,
	`checked_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_originality_checks_status_checked` ON `originality_checks` (`status`,`checked_at`);
--> statement-breakpoint
PRAGMA optimize;
