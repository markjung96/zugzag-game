/**
 * Supabase server-side clients.
 *
 * - createServerClient: 사용자 세션 컨텍스트로 동작. RLS 적용.
 * - createServiceRoleClient: RLS bypass. 다음 케이스에만 사용:
 *     1) games.send_revisions INSERT (append-only, 일반 role은 INSERT 권한 없음)
 *     2) SSE Proxy /tv/{token} — display token 검증 후 Realtime fanout
 *     3) OG 이미지 비인증 access (시즌 종료 후만)
 *
 * 진실 source: docs/DB_SHARING.md §"인증 공유" + CEO Plan §1 (D14 본체 패턴 follow)
 */

import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
if (!anonKey) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");

/**
 * 사용자 세션 컨텍스트. RLS 적용.
 * 호출 측에서 NextAuth 세션 → access_token을 setSession()으로 주입해야 함 (T-I8 패턴 확정 후).
 */
export function createServerClient() {
  return createClient(url!, anonKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * service-role. RLS bypass. 절대 클라이언트 노출 금지.
 * server-only import로 client bundle 진입 차단.
 */
export function createServiceRoleClient() {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(url!, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
