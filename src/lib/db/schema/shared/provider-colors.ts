/**
 * MIRROR of zugzag.public.provider_colors (READ-ONLY)
 * Source: zugzag 본체 레포의 provider_colors 테이블 정의
 * 변경 금지.
 *
 * 점수 정책의 키(scoring_policies.color_scores: {color_id → 점수}) 도메인이 됨.
 */

import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";
import { passProviders } from "./pass-providers";

export const providerColors = pgTable("provider_colors", {
  id: uuid("id").primaryKey(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => passProviders.id),
  label: text("label").notNull(),
  colorHex: text("color_hex"), // "#RRGGBB"
  sortOrder: integer("sort_order"),
});

export type ProviderColor = typeof providerColors.$inferSelect;
