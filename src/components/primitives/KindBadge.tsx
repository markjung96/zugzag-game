interface KindBadgeProps {
  kind?: "ranked" | "casual_open";
}

export function KindBadge({ kind = "ranked" }: KindBadgeProps) {
  const isRanked = kind === "ranked";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "var(--r-full)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        background: isRanked ? "rgba(255,59,92,0.15)" : "rgba(113,113,122,0.15)",
        color: isRanked ? "var(--accent-ranked)" : "var(--accent-casual)",
        border: `1px solid ${isRanked ? "rgba(255,59,92,0.3)" : "rgba(113,113,122,0.3)"}`,
      }}
    >
      {isRanked ? "RANKED" : "CASUAL"}
    </span>
  );
}
