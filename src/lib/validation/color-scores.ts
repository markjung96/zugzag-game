import { z } from "zod";
import type { ColorScores } from "@/lib/db/schema/games";

export const ColorScoresSchema = z
  .object({
    first_send_only: z.boolean(),
    team_top_n: z.number().int().positive().nullable(),
    color_scores: z.record(z.uuid(), z.number().int().nonnegative()),
  })
  .refine((val) => Object.keys(val.color_scores).length > 0, {
    message: "color_scores must have at least one entry",
    path: ["color_scores"],
  });

export type ValidatedColorScores = z.output<typeof ColorScoresSchema>;

export function parseColorScores(data: unknown): ColorScores {
  return ColorScoresSchema.parse(data) as ColorScores;
}
