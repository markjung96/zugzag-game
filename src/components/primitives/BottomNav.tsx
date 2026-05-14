"use client";

interface BottomNavProps {
  active?: "home" | "board" | "live" | "me";
  rankedLive?: boolean;
}

const TABS = [
  {
    id: "home" as const,
    label: "홈",
    icon: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  },
  {
    id: "board" as const,
    label: "보드",
    icon: "M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v7H4zM13 14h7v7h-7z",
  },
  { id: "live" as const, label: "라이브", icon: "M5 5h14v10H5zM9 19h6M12 15v4" },
  {
    id: "me" as const,
    label: "내 기록",
    icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 1 1 16 0",
  },
];

export function BottomNav({ active = "home", rankedLive = false }: BottomNavProps) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: "rgba(10,10,11,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border-default)",
        display: "flex",
        alignItems: "flex-start",
        paddingTop: 8,
        zIndex: 100,
      }}
    >
      {TABS.map((t) => (
        <button
          key={t.id}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            color: active === t.id ? "var(--text-primary)" : "var(--text-tertiary)",
            padding: "6px 0",
            position: "relative",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={t.icon} />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{t.label}</span>
          {t.id === "live" && rankedLive && (
            <span
              style={{
                position: "absolute",
                top: 6,
                right: "32%",
                width: 8,
                height: 8,
                borderRadius: 9999,
                background: "var(--accent-ranked)",
                boxShadow: "0 0 12px var(--accent-ranked)",
              }}
            />
          )}
        </button>
      ))}
    </nav>
  );
}
