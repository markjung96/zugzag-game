import { z } from "zod";

const baseFields = {
  crewId: z.uuid(),
  name: z.string().min(1).max(100),
  scoringPolicyId: z.uuid(),
  startsAt: z.iso.datetime({ offset: true }).transform((s) => new Date(s)),
};

export const CreateSeasonSchema = z
  .object({
    ...baseFields,
    endsAt: z.iso
      .datetime({ offset: true })
      .transform((s) => new Date(s))
      .optional(),
  })
  .refine((val) => !val.endsAt || val.startsAt.getTime() < val.endsAt.getTime(), {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  });

export const UpdateSeasonSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    scoringPolicyId: z.uuid().optional(),
    startsAt: z.iso
      .datetime({ offset: true })
      .transform((s) => new Date(s))
      .optional(),
    endsAt: z.iso
      .datetime({ offset: true })
      .transform((s) => new Date(s))
      .nullable()
      .optional(),
  })
  .refine((val) => !(val.startsAt && val.endsAt) || val.startsAt.getTime() < val.endsAt.getTime(), {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  });
