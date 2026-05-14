interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
  src?: string;
}

export function Avatar({ name, size = 40, color = "#FF3B5C", src }: AvatarProps) {
  const initial = (name || "?").slice(0, 1);
  const fontSize = Math.round(size * 0.42);

  return (
    <div
      className="zz-avatar"
      style={{
        width: size,
        height: size,
        fontSize,
        background: src ? "#000" : color,
        color: "#0A0A0B",
        fontWeight: 800,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
