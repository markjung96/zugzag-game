import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Anon client — RLS 적용. Realtime 구독, 일반 쿼리에 사용.
 * 서버 컴포넌트/Route Handler에서 사용.
 */
export function createServerClient() {
  return createClient(url, anonKey);
}

/**
 * Service-role client — RLS bypass.
 * send_revisions INSERT, SSE Proxy 전용.
 * 절대 클라이언트에 노출하지 않는다.
 */
export function createServiceClient() {
  return createClient(url, serviceKey);
}
