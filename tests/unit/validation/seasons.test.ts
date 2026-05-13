import { describe, it, expect } from "vitest";
import { CreateSeasonSchema } from "@/lib/validation";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("CreateSeasonSchema", () => {
  it("accepts valid season with endsAt after startsAt", () => {
    const result = CreateSeasonSchema.safeParse({
      crewId: VALID_UUID,
      name: "시즌 1",
      scoringPolicyId: VALID_UUID,
      startsAt: "2026-01-01T00:00:00+09:00",
      endsAt: "2026-02-01T00:00:00+09:00",
    });
    expect(result.success).toBe(true);
  });

  it("accepts season without endsAt", () => {
    const result = CreateSeasonSchema.safeParse({
      crewId: VALID_UUID,
      name: "시즌 1",
      scoringPolicyId: VALID_UUID,
      startsAt: "2026-01-01T00:00:00+09:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejects startsAt >= endsAt", () => {
    const result = CreateSeasonSchema.safeParse({
      crewId: VALID_UUID,
      name: "시즌 1",
      scoringPolicyId: VALID_UUID,
      startsAt: "2026-02-01T00:00:00+09:00",
      endsAt: "2026-01-01T00:00:00+09:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects startsAt == endsAt", () => {
    const result = CreateSeasonSchema.safeParse({
      crewId: VALID_UUID,
      name: "시즌 1",
      scoringPolicyId: VALID_UUID,
      startsAt: "2026-01-01T00:00:00+09:00",
      endsAt: "2026-01-01T00:00:00+09:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = CreateSeasonSchema.safeParse({
      crewId: VALID_UUID,
      name: "",
      scoringPolicyId: VALID_UUID,
      startsAt: "2026-01-01T00:00:00+09:00",
    });
    expect(result.success).toBe(false);
  });
});
