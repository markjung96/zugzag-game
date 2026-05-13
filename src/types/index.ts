/**
 * Branded type utility — jsonb 필드 등에 사용.
 * zod parse를 통과해야만 cast 가능.
 */
declare const __brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

/**
 * scoring_policies.color_scores — games.ts의 3-필드 객체가 SSOT.
 * zod parse 통과 후 cast.
 */
export type { ColorScores } from "@/lib/db/schema/games";

/**
 * Session kind — ranked | casual_open
 */
export type SessionKind = "ranked" | "casual_open";

/**
 * Hold colors — DB enum과 동기화
 */
export type HoldColor =
  | "white"
  | "yellow"
  | "orange"
  | "green"
  | "blue"
  | "red"
  | "purple"
  | "black";
