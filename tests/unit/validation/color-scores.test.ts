import { describe, it, expect } from "vitest";
import { ColorScoresSchema } from "@/lib/validation";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

function makeUuids(count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `550e8400-e29b-41d4-a716-44665544${String(i).padStart(4, "0")}`,
  );
}

describe("ColorScoresSchema", () => {
  it("accepts valid 8-color scores", () => {
    const uuids = makeUuids(8);
    const scores = [10, 20, 35, 60, 95, 140, 195, 260];
    const colorScores: Record<string, number> = {};
    uuids.forEach((u, i) => {
      colorScores[u] = scores[i];
    });

    const result = ColorScoresSchema.safeParse({
      first_send_only: true,
      team_top_n: null,
      color_scores: colorScores,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative scores", () => {
    const result = ColorScoresSchema.safeParse({
      first_send_only: true,
      team_top_n: null,
      color_scores: { [VALID_UUID]: -10 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty color_scores", () => {
    const result = ColorScoresSchema.safeParse({
      first_send_only: true,
      team_top_n: null,
      color_scores: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-uuid keys", () => {
    const result = ColorScoresSchema.safeParse({
      first_send_only: true,
      team_top_n: null,
      color_scores: { "not-a-uuid": 10 },
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid team_top_n", () => {
    const result = ColorScoresSchema.safeParse({
      first_send_only: false,
      team_top_n: 3,
      color_scores: { [VALID_UUID]: 10 },
    });
    expect(result.success).toBe(true);
  });
});
