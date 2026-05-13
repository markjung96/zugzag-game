/**
 * Drizzle + postgres.js 클라이언트.
 *
 * 두 가지 모드:
 *   - 일반 (anon/authenticated): RLS 적용. 사용자 컨텍스트가 auth.uid()로 흐름.
 *   - service-role: RLS bypass. send_revisions INSERT, SSE Proxy 등에서만 사용.
 *
 * 일반 앱 코드는 RLS가 적용된 Supabase client를 통해 접근하는 것이 원칙.
 * Drizzle 직접 사용은 server-side route handler / migration / SSE Proxy 한정.
 *
 * 진실 source: docs/DB_SHARING.md §"DB 권한"
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const url = process.env.POSTGRES_URL;
if (!url) {
  throw new Error("POSTGRES_URL is not set (see .env.example)");
}

// 연결 풀 크기는 Vercel serverless 환경 고려해 보수적으로.
const client = postgres(url, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  // Asia/Seoul 일관 적용 — T-M1 (casual_open 자정 cutover)
  // application_name으로 audit 시 식별
  connection: {
    application_name: "zugzag-game",
    TimeZone: "Asia/Seoul",
  },
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
