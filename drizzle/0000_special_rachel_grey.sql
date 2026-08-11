CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_categories_name` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_categories_slug` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `posting_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`source_url` text,
	`scheduled_at` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_queue_status_scheduled` ON `posting_queue` (`status`,`scheduled_at`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`category` text NOT NULL,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`scheduled_at` text,
	`reading_minutes` integer DEFAULT 5 NOT NULL,
	`visual` text DEFAULT 'NEW' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_posts_slug` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_posts_status_published` ON `posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_posts_category` ON `posts` (`category`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
