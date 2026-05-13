/**
 * MIRROR of zugzag.public.users (READ-ONLY)
 * Source: zugzag 본체 레포의 users 테이블 정의
 * 변경 금지. zugzag에서 컬럼 추가 시 이 파일도 동기화하되, ALTER 마이그레이션은 zugzag에서만.
 *
 * drizzle.config.ts의 schemaFilter: ['games']가 이 파일들이 migrate 대상에 잡히지 않게 보장.
 */

import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  nickname: text("nickname"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }),
});

export type User = typeof users.$inferSelect;
