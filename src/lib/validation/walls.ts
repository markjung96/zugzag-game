import { z } from "zod";

export const CreateWallSchema = z.object({
  gymId: z.uuid(),
  name: z.string().min(1).max(50),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const UpdateWallSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});
