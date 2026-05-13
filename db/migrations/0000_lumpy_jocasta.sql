CREATE SCHEMA "games";
--> statement-breakpoint
CREATE TYPE "games"."problem_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "games"."season_status" AS ENUM('draft', 'active', 'closed');--> statement-breakpoint
CREATE TYPE "games"."send_revision_action" AS ENUM('create', 'update', 'cancel', 'restore');--> statement-breakpoint
CREATE TYPE "games"."session_kind" AS ENUM('ranked', 'casual_open');--> statement-breakpoint
CREATE TYPE "games"."session_status" AS ENUM('scheduled', 'live', 'closed');--> statement-breakpoint
CREATE TYPE "games"."setting_cycle_status" AS ENUM('active', 'closed');--> statement-breakpoint
CREATE TYPE "games"."team_mode" AS ENUM('individual', 'team', 'crew_vs_crew');--> statement-breakpoint
CREATE TABLE "games"."display_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(64) NOT NULL,
	"season_id" uuid,
	"session_id" uuid,
	"crew_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "display_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "games"."problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setting_cycle_id" uuid NOT NULL,
	"wall_id" uuid NOT NULL,
	"provider_color_id" uuid NOT NULL,
	"number" integer NOT NULL,
	"position_memo" text,
	"photo_url" text,
	"status" "games"."problem_status" DEFAULT 'active' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games"."scoring_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crew_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"color_scores" jsonb NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games"."seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crew_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"scoring_policy_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"status" "games"."season_status" DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games"."send_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"send_id" uuid NOT NULL,
	"action" "games"."send_revision_action" NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"reason" varchar(200),
	"by_user_id" uuid,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games"."sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"problem_id" uuid NOT NULL,
	"season_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"session_kind" "games"."session_kind" NOT NULL,
	"score_snapshot" integer NOT NULL,
	"attempt_count" integer,
	"comment" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "games"."session_participants" (
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_participants_session_id_user_id_pk" PRIMARY KEY("session_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "games"."session_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(7) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"crew_id" uuid NOT NULL,
	"gym_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"kind" "games"."session_kind" DEFAULT 'ranked' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"status" "games"."session_status" DEFAULT 'scheduled' NOT NULL,
	"team_mode" "games"."team_mode" DEFAULT 'individual' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games"."setting_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"status" "games"."setting_cycle_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games"."walls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games"."display_tokens" ADD CONSTRAINT "display_tokens_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "games"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."display_tokens" ADD CONSTRAINT "display_tokens_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "games"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."problems" ADD CONSTRAINT "problems_setting_cycle_id_setting_cycles_id_fk" FOREIGN KEY ("setting_cycle_id") REFERENCES "games"."setting_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."problems" ADD CONSTRAINT "problems_wall_id_walls_id_fk" FOREIGN KEY ("wall_id") REFERENCES "games"."walls"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."seasons" ADD CONSTRAINT "seasons_scoring_policy_id_scoring_policies_id_fk" FOREIGN KEY ("scoring_policy_id") REFERENCES "games"."scoring_policies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."send_revisions" ADD CONSTRAINT "send_revisions_send_id_sends_id_fk" FOREIGN KEY ("send_id") REFERENCES "games"."sends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."sends" ADD CONSTRAINT "sends_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "games"."problems"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."sends" ADD CONSTRAINT "sends_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "games"."seasons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."sends" ADD CONSTRAINT "sends_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "games"."sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."session_participants" ADD CONSTRAINT "session_participants_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "games"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."session_participants" ADD CONSTRAINT "session_participants_team_id_session_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "games"."session_teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."session_teams" ADD CONSTRAINT "session_teams_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "games"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games"."sessions" ADD CONSTRAINT "sessions_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "games"."seasons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "display_tokens_token_idx" ON "games"."display_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "display_tokens_crew_expires_idx" ON "games"."display_tokens" USING btree ("crew_id","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "problems_cycle_wall_color_number_unique" ON "games"."problems" USING btree ("setting_cycle_id","wall_id","provider_color_id","number");--> statement-breakpoint
CREATE INDEX "seasons_crew_status_idx" ON "games"."seasons" USING btree ("crew_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "seasons_one_active_per_crew" ON "games"."seasons" USING btree ("crew_id") WHERE "games"."seasons"."status" = 'active';--> statement-breakpoint
CREATE INDEX "sends_season_user_idx" ON "games"."sends" USING btree ("season_id","user_id");--> statement-breakpoint
CREATE INDEX "sends_session_idx" ON "games"."sends" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "sends_problem_user_idx" ON "games"."sends" USING btree ("problem_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sends_ranked_first_send_only" ON "games"."sends" USING btree ("user_id","problem_id","season_id") WHERE "games"."sends"."cancelled_at" IS NULL AND "games"."sends"."session_kind" = 'ranked';--> statement-breakpoint
CREATE INDEX "sessions_season_status_idx" ON "games"."sessions" USING btree ("season_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "casual_open_one_per_day" ON "games"."sessions" USING btree ("crew_id",("starts_at"::date)) WHERE "games"."sessions"."kind" = 'casual_open' AND "games"."sessions"."status" != 'closed';--> statement-breakpoint
CREATE UNIQUE INDEX "setting_cycles_one_active_per_gym" ON "games"."setting_cycles" USING btree ("gym_id") WHERE "games"."setting_cycles"."status" = 'active';--> statement-breakpoint
CREATE UNIQUE INDEX "walls_gym_name_unique" ON "games"."walls" USING btree ("gym_id","name");