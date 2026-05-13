/**
 * MIRROR of zugzag.public.crew_members (READ-ONLY)
 * Source: zugzag 본체 레포의 crew_members 테이블 정의
 * 변경 금지.
 *
 * role: 'leader' | 'admin' | 'member' — RLS 헬퍼 games.is_crew_member / is_crew_admin 이 이 컬럼을 평가.
 */

import { pgTable, uuid, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { crews } from "./crews";

export const crewMembers = pgTable(
  "crew_members",
  {
    crewId: uuid("crew_id")
      .notNull()
      .references(() => crews.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role").notNull(), // 'leader' | 'admin' | 'member'
    joinedAt: timestamp("joined_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.crewId, t.userId] })],
);

export type CrewMember = typeof crewMembers.$inferSelect;
