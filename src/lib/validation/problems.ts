import { z } from "zod";

export const CreateProblemSchema = z.object({
  settingCycleId: z.uuid(),
  wallId: z.uuid(),
  providerColorId: z.uuid(),
  number: z.number().int().positive(),
  positionMemo: z.string().max(500).optional(),
});

export const UpdateProblemSchema = z.object({
  wallId: z.uuid().optional(),
  providerColorId: z.uuid().optional(),
  number: z.number().int().positive().optional(),
  positionMemo: z.string().max(500).nullable().optional(),
});
