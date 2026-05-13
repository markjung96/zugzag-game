import { createClient } from "@supabase/supabase-js";

/**
 * 브라우저 전용 Supabase client.
 * Realtime 구독 등 클라이언트 사이드에서만 사용.
 */
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
