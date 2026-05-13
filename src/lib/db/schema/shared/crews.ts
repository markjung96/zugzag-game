/**
 * MIRROR of zugzag.public.crews (READ-ONLY)
 * Source: zugzag 본체 레포의 crews 테이블 정의
 * 변경 금지.
 */

import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const crews = pgTable("crews", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  leaderId: uuid("leader_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }),
});

export type Crew = typeof crews.$inferSelect;
