/**
 * games.* schema (zugzag-game 자체 소유).
 *
 * 진실 source: docs/FEATURE_SPEC.md §11.1.
 * RLS 정책: db/setup/03-rls-policies.sql.
 * Realtime publication 대상: sends, send_revisions, sessions, seasons (db/setup/02-publication.sql).
 *
 * Full Pivot (D19~D25) 반영:
 *   - sessions.kind enum('ranked', 'casual_open')
 *   - sends.session_id NOT NULL, sends.session_kind denormalized (C-A fix)
 *   - PARTIAL UNIQUE (user, problem, season) WHERE cancelled_at IS NULL AND session_kind='ranked'
 *   - casual_open_one_per_day UNIQUE INDEX (C-B fix)
 *   - send_revisions append-only (D16, RLS + REVOKE in 03-rls-policies.sql)
 *
 * ⚠️ Cross-schema FK 정책:
 *   - 이 파일은 games.* 테이블만 정의 + games 내부 FK만 references() 사용.
 *   - public.* (users/crews/gyms/...) 를 가리키는 cross-schema FK는 별도 raw SQL로:
 *     db/setup/04-cross-schema-fks.sql 에서 ALTER TABLE ... ADD CONSTRAINT 로 추가.
 *   - 이유: schema/index.ts가 미러 schema를 export하면 drizzle-kit이 generate 시
 *     public.* CREATE TABLE 까지 만들어 zugzag 본체 테이블과 충돌 (P4 위반). 회피 패턴.
 *   - App 코드에서는 src/lib/db/schema/shared/ 의 미러 정의를 import해서 join 수행.
 */

import {
  pgSchema,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const games = pgSchema("games");

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const seasonStatusEnum = games.enum("season_status", ["draft", "active", "closed"]);

export const settingCycleStatusEnum = games.enum("setting_cycle_status", ["active", "closed"]);

export const problemStatusEnum = games.enum("problem_status", ["active", "archived"]);

export const sessionKindEnum = games.enum("session_kind", ["ranked", "casual_open"]);

export const sessionStatusEnum = games.enum("session_status", ["scheduled", "live", "closed"]);

export const teamModeEnum = games.enum("team_mode", ["individual", "team", "crew_vs_crew"]);

export const sendRevisionActionEnum = games.enum("send_revision_action", [
  "create",
  "update",
  "cancel",
  "restore",
]);

// ---------------------------------------------------------------------------
// Branded jsonb type — color_scores
// ---------------------------------------------------------------------------

export type ColorScores = {
  first_send_only: boolean;
  team_top_n: number | null;
  color_scores: Record<string, number>; // provider_color_id (uuid) → 점수
};

// ---------------------------------------------------------------------------
// 1. games.seasons
//    cross-schema FK: crew_id → public.crews(id), created_by → public.users(id)
//    → 04-cross-schema-fks.sql 에서 추가
// ---------------------------------------------------------------------------

export const seasons = games.table(
  "seasons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    crewId: uuid("crew_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    scoringPolicyId: uuid("scoring_policy_id")
      .notNull()
      .references((): AnyPgColumn => scoringPolicies.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    status: seasonStatusEnum("status").notNull().default("draft"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("seasons_crew_status_idx").on(t.crewId, t.status),
    uniqueIndex("seasons_one_active_per_crew")
      .on(t.crewId)
      .where(sql`${t.status} = 'active'`),
  ],
);

// ---------------------------------------------------------------------------
// 2. games.scoring_policies
//    cross-schema FK: crew_id → public.crews(id), created_by → public.users(id)
// ---------------------------------------------------------------------------

export const scoringPolicies = games.table(
  "scoring_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    crewId: uuid("crew_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    colorScores: jsonb("color_scores").$type<ColorScores>().notNull(),
    isLocked: boolean("is_locked").notNull().default(false),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("scoring_policies_crew_name_unique").on(t.crewId, t.name)],
);

// ---------------------------------------------------------------------------
// 3. games.setting_cycles
//    cross-schema FK: gym_id → public.gyms(id)
// ---------------------------------------------------------------------------

export const settingCycles = games.table(
  "setting_cycles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    status: settingCycleStatusEnum("status").notNull().default("active"),
  },
  (t) => [
    uniqueIndex("setting_cycles_one_active_per_gym")
      .on(t.gymId)
      .where(sql`${t.status} = 'active'`),
  ],
);

// ---------------------------------------------------------------------------
// 4. games.walls
//    cross-schema FK: gym_id → public.gyms(id)
// ---------------------------------------------------------------------------

export const walls = games.table(
  "walls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gymId: uuid("gym_id").notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("walls_gym_name_unique").on(t.gymId, t.name)],
);

// ---------------------------------------------------------------------------
// 5. games.problems
//    cross-schema FK: provider_color_id → public.provider_colors(id), created_by → public.users(id)
// ---------------------------------------------------------------------------

export const problems = games.table(
  "problems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    settingCycleId: uuid("setting_cycle_id")
      .notNull()
      .references(() => settingCycles.id, { onDelete: "cascade" }),
    wallId: uuid("wall_id")
      .notNull()
      .references(() => walls.id, { onDelete: "restrict" }),
    providerColorId: uuid("provider_color_id").notNull(),
    number: integer("number").notNull(),
    positionMemo: text("position_memo"),
    photoUrl: text("photo_url"),
    status: problemStatusEnum("status").notNull().default("active"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("problems_cycle_wall_color_number_unique").on(
      t.settingCycleId,
      t.wallId,
      t.providerColorId,
      t.number,
    ),
  ],
);

// ---------------------------------------------------------------------------
// 6. games.sessions
//    cross-schema FK: crew_id → public.crews(id), gym_id → public.gyms(id), created_by → public.users(id)
// ---------------------------------------------------------------------------

export const sessions = games.table(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seasonId: uuid("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "restrict" }),
    // crew_id 정규화 — seasons.crew_id와 동일하지만 RLS / UNIQUE에 쓰이므로 denormalized.
    crewId: uuid("crew_id").notNull(),
    gymId: uuid("gym_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    kind: sessionKindEnum("kind").notNull().default("ranked"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }), // casual_open은 null
    status: sessionStatusEnum("status").notNull().default("scheduled"),
    teamMode: teamModeEnum("team_mode").notNull().default("individual"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("sessions_season_status_idx").on(t.seasonId, t.status),
    // C-B fix (D24): casual_open은 크루당 1일 1개. T-M1: Asia/Seoul 고정으로 IMMUTABLE 보장.
    // (timestamp::date 단독은 timezone-dependent → not IMMUTABLE → index 불가)
    uniqueIndex("casual_open_one_per_day")
      .on(t.crewId, sql`((${t.startsAt} AT TIME ZONE 'Asia/Seoul')::date)`)
      .where(sql`${t.kind} = 'casual_open' AND ${t.status} != 'closed'`),
  ],
);

// ---------------------------------------------------------------------------
// 7. games.session_teams
// ---------------------------------------------------------------------------

export const sessionTeams = games.table("session_teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(), // #RRGGBB
});

// ---------------------------------------------------------------------------
// 8. games.session_participants
//    cross-schema FK: user_id → public.users(id)
// ---------------------------------------------------------------------------

export const sessionParticipants = games.table(
  "session_participants",
  {
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    teamId: uuid("team_id").references(() => sessionTeams.id, {
      onDelete: "set null",
    }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.sessionId, t.userId] })],
);

// ---------------------------------------------------------------------------
// 9. games.sends — 핵심
//    cross-schema FK: user_id → public.users(id)
// ---------------------------------------------------------------------------

export const sends = games.table(
  "sends",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "restrict" }),
    seasonId: uuid("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "restrict" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "restrict" }),
    // C-A fix (D23): denormalized from sessions.kind. INSERT 시 채움.
    sessionKind: sessionKindEnum("session_kind").notNull(),
    scoreSnapshot: integer("score_snapshot").notNull(),
    attemptCount: integer("attempt_count"),
    comment: varchar("comment", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (t) => [
    index("sends_season_user_idx").on(t.seasonId, t.userId),
    index("sends_session_idx").on(t.sessionId),
    index("sends_problem_user_idx").on(t.problemId, t.userId),
    // C-A fix: ranked에만 first_send_only 적용.
    uniqueIndex("sends_ranked_first_send_only")
      .on(t.userId, t.problemId, t.seasonId)
      .where(sql`${t.cancelledAt} IS NULL AND ${t.sessionKind} = 'ranked'`),
  ],
);

// ---------------------------------------------------------------------------
// 10. games.send_revisions — append-only (D16)
//     cross-schema FK: by_user_id → public.users(id)
// ---------------------------------------------------------------------------

export const sendRevisions = games.table("send_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sendId: uuid("send_id")
    .notNull()
    .references(() => sends.id, { onDelete: "cascade" }),
  action: sendRevisionActionEnum("action").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  reason: varchar("reason", { length: 200 }),
  byUserId: uuid("by_user_id"),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// 11. games.display_tokens — E5 TV 모드
//     cross-schema FK: crew_id → public.crews(id), created_by → public.users(id)
// ---------------------------------------------------------------------------

export const displayTokens = games.table(
  "display_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: varchar("token", { length: 64 }).notNull().unique(),
    seasonId: uuid("season_id").references(() => seasons.id, {
      onDelete: "cascade",
    }),
    sessionId: uuid("session_id").references(() => sessions.id, {
      onDelete: "cascade",
    }),
    crewId: uuid("crew_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("display_tokens_token_idx").on(t.token),
    index("display_tokens_crew_expires_idx").on(t.crewId, t.expiresAt),
  ],
);

// ---------------------------------------------------------------------------
// 타입 추론 헬퍼
// ---------------------------------------------------------------------------

export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;
export type ScoringPolicy = typeof scoringPolicies.$inferSelect;
export type NewScoringPolicy = typeof scoringPolicies.$inferInsert;
export type SettingCycle = typeof settingCycles.$inferSelect;
export type Wall = typeof walls.$inferSelect;
export type Problem = typeof problems.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type SessionTeam = typeof sessionTeams.$inferSelect;
export type SessionParticipant = typeof sessionParticipants.$inferSelect;
export type Send = typeof sends.$inferSelect;
export type NewSend = typeof sends.$inferInsert;
export type SendRevision = typeof sendRevisions.$inferSelect;
export type DisplayToken = typeof displayTokens.$inferSelect;
