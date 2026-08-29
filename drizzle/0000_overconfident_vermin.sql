CREATE TABLE "global_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"doc_id" text DEFAULT 'main' NOT NULL,
	"total_rolls" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_cosmetics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"cosmetic_id" text NOT NULL,
	"acquired_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"rarity_counts" text,
	"last_roll_at" timestamp,
	"last_sell_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");