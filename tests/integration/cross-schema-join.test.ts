/**
 * Cross-schema 조인 동작 확인.
 *
 * games.sends ↔ public.users LEFT JOIN이 Drizzle query builder에서 타입 통과 + 실행 통과.
 * fixture 정책: public.* INSERT 절대 안함. 기존 dev row SELECT만 사용.
 */

import { describe, it, expect } from "vitest";
import { sql } from "./setup";

describe("cross-schema join", () => {
  it("games.sends ↔ public.users LEFT JOIN 실행 성공", async () => {
    const result = await sql`
      SELECT
        s.id AS send_id,
        u.id AS user_id,
        u.name AS user_name
      FROM games.sends s
      LEFT JOIN public.users u ON u.id = s.user_id
      LIMIT 5
    `;

    // sends가 비어있을 수 있으나 쿼리 자체가 실행되면 성공
    expect(Array.isArray(result)).toBe(true);
  });

  it("games.sessions ↔ public.crews LEFT JOIN 실행 성공", async () => {
    const result = await sql`
      SELECT
        sess.id AS session_id,
        c.id AS crew_id,
        c.name AS crew_name
      FROM games.sessions sess
      LEFT JOIN public.crews c ON c.id = sess.crew_id
      LIMIT 5
    `;

    expect(Array.isArray(result)).toBe(true);
  });
});
