import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Broker-aware anon client — RLS 적용.
 * accessToken이 있으면 Authorization 헤더에 주입하여 auth.uid() = user_id 매핑.
 * accessToken이 null이면 anon 쿼리 (Phase 1.6 TV 모드 forward).
 */
export function createServerClient(accessToken: string | null) {
  return createClient(url, anonKey, {
    ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client — RLS bypass.
 * send_revisions INSERT, SSE Proxy 전용.
 * 절대 클라이언트에 노출하지 않는다.
 */
export function createServiceClient() {
  return createClient(url, serviceKey);
}
