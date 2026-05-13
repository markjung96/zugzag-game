import { describe, it, expect } from "vitest";
import { CreateTokenSchema } from "@/lib/validation";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("CreateTokenSchema", () => {
  it("accepts season-scoped token", () => {
    const result = CreateTokenSchema.safeParse({
      crewId: VALID_UUID,
      expiresAt: "2026-12-31T23:59:59+09:00",
      scope: "season",
      seasonId: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("accepts session-scoped token", () => {
    const result = CreateTokenSchema.safeParse({
      crewId: VALID_UUID,
      expiresAt: "2026-12-31T23:59:59+09:00",
      scope: "session",
      sessionId: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid scope", () => {
    const result = CreateTokenSchema.safeParse({
      crewId: VALID_UUID,
      expiresAt: "2026-12-31T23:59:59+09:00",
      scope: "invalid",
      seasonId: VALID_UUID,
    });
    expect(result.success).toBe(false);
  });

  it("rejects season scope without seasonId", () => {
    const result = CreateTokenSchema.safeParse({
      crewId: VALID_UUID,
      expiresAt: "2026-12-31T23:59:59+09:00",
      scope: "season",
    });
    expect(result.success).toBe(false);
  });
});
