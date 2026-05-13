import { z } from "zod";

export const CreateCycleSchema = z.object({
  gymId: z.uuid(),
  name: z.string().min(1).max(100),
  startedAt: z.iso.datetime({ offset: true }).transform((s) => new Date(s)),
});

export const CloseCycleSchema = z.object({
  endedAt: z.iso.datetime({ offset: true }).transform((s) => new Date(s)),
});
