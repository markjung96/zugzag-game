/**
 * MIRROR of zugzag.public.gyms (READ-ONLY)
 * Source: zugzag 본체 레포의 gyms 테이블 정의
 * 변경 금지.
 */

import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { passProviders } from "./pass-providers";

export const gyms = pgTable("gyms", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  providerId: uuid("provider_id").references(() => passProviders.id),
});

export type Gym = typeof gyms.$inferSelect;
