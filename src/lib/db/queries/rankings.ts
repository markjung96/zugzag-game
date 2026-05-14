import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface RankingRow {
  user_id: string;
  total: number;
  sends_count: number;
}

function aggregateRankings(
  rows: Array<{ user_id: string; score_snapshot: number }>,
  limit: number,
): RankingRow[] {
  const aggregated = new Map<string, { total: number; sends_count: number }>();
  for (const row of rows) {
    const existing = aggregated.get(row.user_id);
    if (existing) {
      existing.total += row.score_snapshot;
      existing.sends_count += 1;
    } else {
      aggregated.set(row.user_id, { total: row.score_snapshot, sends_count: 1 });
    }
  }
  return Array.from(aggregated.entries())
    .map(([user_id, { total, sends_count }]) => ({ user_id, total, sends_count }))
    .sort((a, b) => b.total - a.total || b.sends_count - a.sends_count)
    .slice(0, limit);
}

/**
 * Season individual rankings — ranked session sends only.
 * Relies on RLS via the authenticated Supabase client (T0 broker).
 */
export async function getSeasonRankings(
  supa: SupabaseClient,
  seasonId: string,
  opts?: { limit?: number },
): Promise<RankingRow[]> {
  const limit = opts?.limit ?? 100;

  const { data, error } = await supa.rpc("get_season_rankings", {
    p_season_id: seasonId,
    p_limit: limit,
  });

  if (!error) return (data as RankingRow[]) ?? [];

  const { data: rawData, error: rawError } = await supa
    .from("sends")
    .select("user_id, score_snapshot")
    .eq("season_id", seasonId)
    .is("cancelled_at", null)
    .eq("session_kind", "ranked");

  if (rawError) throw rawError;

  return aggregateRankings(rawData ?? [], limit);
}

/**
 * Session-scoped rankings (for LiveSessionBoard T7).
 */
export async function getSessionRankings(
  supa: SupabaseClient,
  sessionId: string,
  opts?: { limit?: number },
): Promise<RankingRow[]> {
  const limit = opts?.limit ?? 100;

  const { data, error } = await supa
    .from("sends")
    .select("user_id, score_snapshot")
    .eq("session_id", sessionId)
    .is("cancelled_at", null);

  if (error) throw error;

  return aggregateRankings(data ?? [], limit);
}
