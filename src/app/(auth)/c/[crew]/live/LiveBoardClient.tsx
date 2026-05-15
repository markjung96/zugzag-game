"use client";

import { useCallback, useEffect, useState } from "react";
import { useRealtimeSends } from "@/lib/realtime/useRealtimeSends";
import type { SendRow } from "@/lib/realtime/schemas";
import type { RankingRow } from "@/lib/db/queries/rankings";
import { Avatar } from "@/components/primitives/Avatar";
import { KindBadge } from "@/components/primitives/KindBadge";
import { Toast } from "@/components/primitives/Toast";
import { BottomNav } from "@/components/primitives/BottomNav";

interface ToastItem {
  id: string;
  row: SendRow;
  createdAt: number;
}

interface LiveBoardClientProps {
  seasonId: string;
  accessToken: string;
  initialRankings: RankingRow[];
}

const POLLING_INTERVAL_MS = parseInt(process.env.NEXT_PUBLIC_POLLING_INTERVAL_MS ?? "60000", 10);

export function LiveBoardClient({ seasonId, accessToken, initialRankings }: LiveBoardClientProps) {
  const [rankings, setRankings] = useState<RankingRow[]>(initialRankings);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const onInsert = useCallback((row: SendRow) => {
    const clientReceivedAt = new Date().toISOString();

    // KPI queue (R2-H3)
    if (
      typeof window !== "undefined" &&
      (window as unknown as { __liveKpi?: unknown[] }).__liveKpi
    ) {
      (window as unknown as { __liveKpi: unknown[] }).__liveKpi.push({
        sendId: row.id,
        serverCreatedAt: row.created_at,
        clientReceivedAt,
      });
    }
    // dogfooding 텔레메트리 — Phase 2 진입 조건(p95 5초) 자연 누적 측정용. ±1-2초 클럭 드리프트 가능.
    console.info("[kpi-realtime-delta]", {
      sendId: row.id,
      deltaMs: Date.now() - Date.parse(row.created_at),
    });

    // Update rankings
    setRankings((prev) => {
      const next = [...prev];
      const idx = next.findIndex((r) => r.user_id === row.user_id);
      if (idx >= 0) {
        next[idx] = {
          ...next[idx],
          total: next[idx].total + row.score_snapshot,
          sends_count: next[idx].sends_count + 1,
        };
      } else {
        next.push({ user_id: row.user_id, total: row.score_snapshot, sends_count: 1 });
      }
      return next.sort((a, b) => b.total - a.total || b.sends_count - a.sends_count);
    });

    // Toast
    setToasts((prev) => [...prev, { id: row.id, row, createdAt: Date.now() }]);
  }, []);

  // Toast auto-remove (3s)
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => Date.now() - t.createdAt < 3000));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const { connected } = useRealtimeSends({
    seasonId,
    accessToken,
    onInsert,
  });

  // Race window fix (R1-M2): refetch on connected
  useEffect(() => {
    if (!connected) return;
    fetch(`/api/seasons/${seasonId}/rankings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.rankings) {
          setRankings((prev) => {
            const merged = new Map(prev.map((r) => [r.user_id, r]));
            for (const row of data.rankings as RankingRow[]) {
              const existing = merged.get(row.user_id);
              if (!existing || row.total > existing.total) {
                merged.set(row.user_id, row);
              }
            }
            return Array.from(merged.values()).sort(
              (a, b) => b.total - a.total || b.sends_count - a.sends_count,
            );
          });
        }
      })
      .catch(() => {});
  }, [connected, seasonId]);

  // T8 Fallback polling
  useEffect(() => {
    const controller = new AbortController();
    const interval = setInterval(() => {
      fetch(`/api/seasons/${seasonId}/rankings`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          if (data.rankings) {
            setRankings(
              (data.rankings as RankingRow[]).sort(
                (a, b) => b.total - a.total || b.sends_count - a.sends_count,
              ),
            );
          }
        })
        .catch(() => {});
    }, POLLING_INTERVAL_MS);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [seasonId]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-canvas)",
        paddingBottom: 80,
        position: "relative",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            라이브 보드
          </h1>
          <KindBadge kind="ranked" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: connected ? "var(--accent-success)" : "var(--text-tertiary)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "var(--accent-success)" : "var(--text-disabled)",
            }}
          />
          {connected ? "LIVE" : "연결 중..."}
        </div>
      </header>

      {/* Toast container */}
      <div
        style={{
          position: "fixed",
          top: 60,
          left: 16,
          right: 16,
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <Toast key={t.id}>
            <Avatar name={t.row.user_id.slice(0, 2)} size={32} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>+{t.row.score_snapshot}점</span>
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                방금 완등
              </span>
            </div>
          </Toast>
        ))}
      </div>

      {/* Rankings list */}
      <div style={{ padding: "12px 16px" }}>
        {rankings.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-tertiary)",
              padding: 40,
            }}
          >
            아직 완등 기록이 없습니다.
          </p>
        ) : (
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {rankings.map((row, idx) => (
              <li
                key={row.user_id}
                data-testid={`rank-${idx}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border-default)",
                }}
              >
                <span
                  style={{
                    width: 28,
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    fontFamily: "var(--font-num)",
                    color:
                      idx === 0
                        ? "var(--accent-win)"
                        : idx === 1
                          ? "var(--accent-silver)"
                          : idx === 2
                            ? "var(--accent-bronze)"
                            : "var(--text-tertiary)",
                  }}
                >
                  {idx + 1}
                </span>
                <Avatar name={row.user_id.slice(0, 2)} size={36} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {row.user_id.slice(0, 8)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {row.sends_count}회 완등
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    fontFamily: "var(--font-num)",
                    color: "var(--text-primary)",
                  }}
                >
                  {row.total.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <BottomNav active="live" rankedLive />
    </div>
  );
}
