"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase/client";
import { SendRowSchema, type SendRow } from "./schemas";

interface UseRealtimeSendsOpts {
  seasonId: string;
  accessToken: string;
  onInsert: (row: SendRow) => void;
  onUpdate?: (row: SendRow) => void;
  enabled?: boolean;
}

/**
 * Subscribe to Realtime INSERT events on games.sends filtered by season_id.
 * Requires a valid Supabase JWT (from T0 broker) for RLS-authenticated channel.
 */
export function useRealtimeSends(opts: UseRealtimeSendsOpts): {
  connected: boolean;
  error: Error | null;
} {
  const { seasonId, accessToken, onInsert, onUpdate, enabled = true } = opts;
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
  });

  useEffect(() => {
    if (!enabled || !accessToken || !seasonId) {
      return;
    }

    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      try {
        const client = createBrowserClient(async () => accessToken);
        await client.realtime.setAuth(accessToken);
        if (cancelled) return;

        channel = client
          .channel(`realtime:games:sends:season:${seasonId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "games",
              table: "sends",
              filter: `season_id=eq.${seasonId}`,
            },
            (payload) => {
              const parsed = SendRowSchema.safeParse(payload.new);
              if (!parsed.success) {
                console.error("[realtime] schema mismatch", payload);
                return;
              }
              onInsertRef.current(parsed.data);
            },
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "games",
              table: "sends",
              filter: `season_id=eq.${seasonId}`,
            },
            (payload) => {
              if (!onUpdateRef.current) return;
              const parsed = SendRowSchema.safeParse(payload.new);
              if (!parsed.success) {
                console.error("[realtime] update schema mismatch", payload);
                return;
              }
              onUpdateRef.current(parsed.data);
            },
          )
          .subscribe((status) => {
            if (cancelled) return;
            setConnected(status === "SUBSCRIBED");
            if (status === "CHANNEL_ERROR") {
              setError(new Error("Realtime channel error"));
            }
          });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      }
    })();

    return () => {
      cancelled = true;
      channel?.unsubscribe();
      setConnected(false);
    };
  }, [seasonId, accessToken, enabled]);

  return { connected, error };
}
