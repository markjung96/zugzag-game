import { describe, it, expect } from "vitest";
import { SendRowSchema, SendRowPartialSchema } from "@/lib/realtime/schemas";

const VALID_SEND_ROW = {
  id: "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
  user_id: "11111111-2222-4333-8444-555555555555",
  problem_id: "aaaaaaaa-bbbb-4ccc-9ddd-eeeeeeeeeeee",
  season_id: "99999999-8888-4777-a666-555555555555",
  session_id: "12345678-abcd-4f01-b345-6789abcdef01",
  session_kind: "ranked" as const,
  score_snapshot: 95,
  attempt_count: 2,
  comment: "한 번에 성공!",
  created_at: "2026-05-13T22:00:00.000+09:00",
  cancelled_at: null,
};

describe("SendRowSchema", () => {
  it("parses a valid send row", () => {
    const result = SendRowSchema.safeParse(VALID_SEND_ROW);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(VALID_SEND_ROW.id);
      expect(result.data.score_snapshot).toBe(95);
    }
  });

  it("parses casual_open session_kind", () => {
    const row = { ...VALID_SEND_ROW, session_kind: "casual_open" };
    const result = SendRowSchema.safeParse(row);
    expect(result.success).toBe(true);
  });

  it("parses with null attempt_count and comment", () => {
    const row = { ...VALID_SEND_ROW, attempt_count: null, comment: null };
    const result = SendRowSchema.safeParse(row);
    expect(result.success).toBe(true);
  });

  it("rejects missing required field (user_id)", () => {
    const { user_id: _unused, ...partial } = VALID_SEND_ROW;
    void _unused;
    const result = SendRowSchema.safeParse(partial);
    expect(result.success).toBe(false);
  });

  it("rejects invalid session_kind enum", () => {
    const row = { ...VALID_SEND_ROW, session_kind: "invalid_kind" };
    const result = SendRowSchema.safeParse(row);
    expect(result.success).toBe(false);
  });

  it("rejects non-uuid id", () => {
    const row = { ...VALID_SEND_ROW, id: "not-a-uuid" };
    const result = SendRowSchema.safeParse(row);
    expect(result.success).toBe(false);
  });

  it("rejects non-integer score_snapshot", () => {
    const row = { ...VALID_SEND_ROW, score_snapshot: 95.5 };
    const result = SendRowSchema.safeParse(row);
    expect(result.success).toBe(false);
  });

  it("accepts cancelled_at as valid datetime", () => {
    const row = {
      ...VALID_SEND_ROW,
      cancelled_at: "2026-05-13T22:05:00.000+09:00",
    };
    const result = SendRowSchema.safeParse(row);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cancelled_at).toBe("2026-05-13T22:05:00.000+09:00");
    }
  });
});

describe("SendRowPartialSchema", () => {
  it("accepts row with only id + cancelled_at (UPDATE case)", () => {
    const partial = {
      id: VALID_SEND_ROW.id,
      cancelled_at: "2026-05-13T22:10:00.000+09:00",
    };
    const result = SendRowPartialSchema.safeParse(partial);
    expect(result.success).toBe(true);
    if (!result.success) console.error(result.error.issues);
  });

  it("accepts full row (INSERT-like)", () => {
    const result = SendRowPartialSchema.safeParse(VALID_SEND_ROW);
    expect(result.success).toBe(true);
  });

  it("still requires id (primary key)", () => {
    const { id: _unused, ...noId } = VALID_SEND_ROW;
    void _unused;
    const result = SendRowPartialSchema.safeParse(noId);
    expect(result.success).toBe(false);
  });
});
