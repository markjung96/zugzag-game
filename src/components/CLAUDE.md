# src/components/ — UI 컴포넌트

## 분류

- `primitives/` — design-handoff에서 포팅한 6개 핵심 컴포넌트 (KindBadge, FAB, HoldChip, BottomNav, Avatar, Toast).
- `screens/` — 화면 단위 컴포넌트. Page 컴포넌트(`app/`)에서 호출.
- `ui/` — 범용 (Button, Input, Card, Modal 등). primitives 외 공통 UI.

## 네이밍

- PascalCase 파일명 (`KindBadge.tsx`).
- Props는 `{ComponentName}Props` 타입으로 export.
- `"use client"` 지시자는 인터랙션 필요 시에만.
