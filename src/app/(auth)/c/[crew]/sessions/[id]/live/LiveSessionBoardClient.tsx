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

function formatRemaining(remaining: number): string {
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function formatCountdown(sessionEndsAt: string | null, status: string): string {
  if (status === "closed") return "종료됨";
  if (!sessionEndsAt) return "";
  return formatRemaining(Math.max(0, Date.parse(sessionEndsAt) - Date.now()));
}

interface LiveSessionBoardClientProps {
  sessionId: string;
  sessionName: string;
  sessionStatus: string;
  sessionEndsAt: string | null;
  sessionKind: string;
  seasonId: string;
  accessToken: string;
  initialRankings: RankingRow[];
}

export function LiveSessionBoardClient({
  sessionId,
  sessionName,
  sessionStatus: initialStatus,
  sessionEndsAt,
  sessionKind,
  seasonId,
  accessToken,
  initialRankings,
}: LiveSessionBoardClientProps) {
  const [rankings, setRankings] = useState<RankingRow[]>(initialRankings);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [status, setStatus] = useState(initialStatus);
  const [countdown, setCountdown] = useState(() => formatCountdown(sessionEndsAt, initialStatus));

  // Countdown timer (L6) — interval만 effect에서 관리. 첫 표시는 useState 초기값.
  useEffect(() => {
    if (!sessionEndsAt || status === "closed") return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Date.parse(sessionEndsAt) - Date.now());
      if (remaining <= 0) {
        setStatus("closed");
        setCountdown("종료됨");
        return;
      }
      setCountdown(formatRemaining(remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionEndsAt, status]);

  const onInsert = useCallback((row: SendRow) => {
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

    setToasts((prev) => [...prev, { id: row.id, row, createdAt: Date.now() }]);
  }, []);

  // Toast auto-remove
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => Date.now() - t.createdAt < 3000));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts]);

  // Realtime subscription filtered by session_id
  const { connected } = useRealtimeSends({
    seasonId,
    accessToken,
    onInsert,
    enabled: status === "live",
  });

  // Fallback polling
  useEffect(() => {
    const controller = new AbortController();
    const interval = setInterval(() => {
      fetch(`/api/sessions/${sessionId}/rankings`, { signal: controller.signal })
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
    }, 60_000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [sessionId]);

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
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {sessionName}
            </h1>
            <KindBadge kind={sessionKind as "ranked" | "casual_open"} />
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
            {connected ? "LIVE" : status === "closed" ? "종료됨" : "연결 중..."}
          </div>
        </div>
        {countdown && (
          <div
            style={{
              marginTop: 6,
              fontSize: 24,
              fontWeight: 800,
              fontFamily: "var(--font-num)",
              color: status === "closed" ? "var(--text-tertiary)" : "var(--accent-ranked)",
              textAlign: "center",
            }}
          >
            {countdown}
          </div>
        )}
      </header>

      {/* Toast container */}
      <div
        style={{
          position: "fixed",
          top: 80,
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

      <BottomNav active="live" rankedLive={status === "live"} />
    </div>
  );
}
