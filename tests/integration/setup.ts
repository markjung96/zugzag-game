/**
 * Integration test setup — admin connection (RLS bypass).
 *
 * POSTGRES_URL_ADMIN 필수. 없으면 테스트 skip.
 */

import postgres from "postgres";
import { beforeAll, afterAll } from "vitest";

const adminUrl = process.env.POSTGRES_URL_ADMIN;
if (!adminUrl) {
  throw new Error("POSTGRES_URL_ADMIN required for integration tests");
}

export const sql = postgres(adminUrl, { max: 2 });

beforeAll(async () => {
  // connection 확인
  await sql`SELECT 1`;
});

afterAll(async () => {
  await sql.end();
});
