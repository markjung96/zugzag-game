import { z } from "zod";

export const CreateSendSchema = z.object({
  problemId: z.uuid(),
  sessionId: z.uuid().optional(),
  attemptCount: z.number().int().positive().optional(),
  comment: z.string().max(200).optional(),
});

export const UpdateSendSchema = z.object({
  comment: z.string().max(200).nullable().optional(),
});
