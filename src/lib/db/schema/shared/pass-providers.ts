/**
 * MIRROR of zugzag.public.pass_providers (READ-ONLY)
 * Source: zugzag 본체 레포의 pass_providers 테이블 정의
 * 변경 금지.
 */

import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const passProviders = pgTable("pass_providers", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
});

export type PassProvider = typeof passProviders.$inferSelect;
