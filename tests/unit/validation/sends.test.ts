import { describe, it, expect } from "vitest";
import { CreateSendSchema, UpdateSendSchema } from "@/lib/validation";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("CreateSendSchema", () => {
  it("accepts valid send", () => {
    const result = CreateSendSchema.safeParse({
      problemId: VALID_UUID,
      sessionId: VALID_UUID,
      attemptCount: 1,
      comment: "좋은 문제!",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal send (problemId only)", () => {
    const result = CreateSendSchema.safeParse({
      problemId: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("rejects comment over 200 chars", () => {
    const result = CreateSendSchema.safeParse({
      problemId: VALID_UUID,
      comment: "가".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateSendSchema", () => {
  it("accepts comment update", () => {
    const result = UpdateSendSchema.safeParse({ comment: "수정된 코멘트" });
    expect(result.success).toBe(true);
  });

  it("accepts null comment (clear)", () => {
    const result = UpdateSendSchema.safeParse({ comment: null });
    expect(result.success).toBe(true);
  });
});
