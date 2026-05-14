import { z } from "zod";

/**
 * Realtime payload schema for games.sends INSERT events.
 * Supabase postgres_changes delivers `payload.new` as a JSON object
 * with snake_case column names matching the DB schema.
 *
 * Timestamps arrive as RFC3339 strings (to_jsonb(now())::text pattern — R3-H1).
 */
export const SendRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  problem_id: z.string().uuid(),
  season_id: z.string().uuid(),
  session_id: z.string().uuid(),
  session_kind: z.enum(["ranked", "casual_open"]),
  score_snapshot: z.number().int(),
  attempt_count: z.number().int().nullable(),
  comment: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }),
  cancelled_at: z.string().datetime({ offset: true }).nullable(),
});

export type SendRow = z.infer<typeof SendRowSchema>;

/**
 * Phase 1.6 forward (R1-H4):
 * Before REPLICA IDENTITY FULL is set, UPDATE payloads may only contain
 * primary key + changed columns. This partial schema handles that case.
 */
export const SendRowPartialSchema = SendRowSchema.partial({
  user_id: true,
  problem_id: true,
  season_id: true,
  session_id: true,
  session_kind: true,
  score_snapshot: true,
  attempt_count: true,
  comment: true,
  created_at: true,
});

export type SendRowPartial = z.infer<typeof SendRowPartialSchema>;
