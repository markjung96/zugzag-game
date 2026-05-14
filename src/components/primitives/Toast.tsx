"use client";

import type { ReactNode } from "react";

interface ToastProps {
  children: ReactNode;
}

export function Toast({ children }: ToastProps) {
  return (
    <div
      className="animate-slidein"
      style={{
        background: "var(--bg-surface-2)",
        color: "var(--text-primary)",
        borderRadius: "var(--r-lg)",
        padding: "12px 14px",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--el-toast)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 260,
      }}
    >
      {children}
    </div>
  );
}
