CREATE TABLE `children` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text DEFAULT '' NOT NULL,
	`avatar_emoji` text DEFAULT '🙂' NOT NULL,
	`sex_at_birth` text NOT NULL,
	`birth_date` text NOT NULL,
	`mother_height_cm` real,
	`father_height_cm` real,
	`parent_heights_self_reported` integer DEFAULT true NOT NULL,
	`parent_height_estimated` text,
	`sleep_band` text,
	`puberty_signs` text DEFAULT '[]' NOT NULL,
	`primary_goal` text,
	`bedtime` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `habit_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`day` text NOT NULL,
	`habit_key` text NOT NULL,
	`done` integer DEFAULT true NOT NULL,
	`is_rest_day` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `habit_checks_unique` ON `habit_checks` (`child_id`,`day`,`habit_key`);--> statement-breakpoint
CREATE INDEX `habit_checks_child_day` ON `habit_checks` (`child_id`,`day`);--> statement-breakpoint
CREATE TABLE `measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`date` text NOT NULL,
	`height_cm` real NOT NULL,
	`weight_kg` real,
	`note` text,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `measurements_child_date` ON `measurements` (`child_id`,`date`);