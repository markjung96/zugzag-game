import { z } from "zod";
import { ColorScoresSchema } from "./color-scores";

export const CreatePolicySchema = z.object({
  crewId: z.uuid(),
  name: z.string().min(1).max(100),
  colorScores: ColorScoresSchema,
});

export const UpdatePolicySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  colorScores: ColorScoresSchema.optional(),
});
