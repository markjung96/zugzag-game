import { z } from "zod";

export const CreateSessionSchema = z
  .object({
    seasonId: z.uuid(),
    kind: z.enum(["ranked", "casual_open"]).default("ranked"),
    gymId: z.uuid(),
    name: z.string().min(1).max(100),
    startsAt: z.iso.datetime({ offset: true }).transform((s) => new Date(s)),
    endsAt: z.iso
      .datetime({ offset: true })
      .transform((s) => new Date(s))
      .optional(),
    teamMode: z.enum(["individual", "team", "crew_vs_crew"]).default("individual"),
  })
  .refine((val) => !val.endsAt || val.startsAt.getTime() < val.endsAt.getTime(), {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  });

export const JoinSessionSchema = z.object({
  sessionId: z.uuid(),
  teamId: z.uuid().optional(),
});
