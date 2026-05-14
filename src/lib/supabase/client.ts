"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client — Realtime accessToken callback 패턴.
 * getToken은 useSession()에서 session.supabaseToken을 반환하는 async 함수.
 * Realtime 토큰 갱신 시 자동 재적용.
 */
export function createBrowserClient(getToken: () => Promise<string | null>): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => (await getToken()) ?? "",
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
