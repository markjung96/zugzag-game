import { z } from "zod";

const baseFields = {
  crewId: z.uuid(),
  expiresAt: z.iso.datetime({ offset: true }).transform((s) => new Date(s)),
};

export const CreateTokenSchema = z.discriminatedUnion("scope", [
  z.object({
    ...baseFields,
    scope: z.literal("season"),
    seasonId: z.uuid(),
  }),
  z.object({
    ...baseFields,
    scope: z.literal("session"),
    sessionId: z.uuid(),
  }),
]);
