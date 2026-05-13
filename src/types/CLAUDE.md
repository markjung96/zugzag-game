# src/types/ — 공유 타입 정의

## Branded Type

- `Brand<T, B>` 유틸리티로 jsonb 필드에 타입 안전성 부여.
- `ColorScores` — games.ts의 3-필드 객체(`{ first_send_only, team_top_n, color_scores }`)가 SSOT. zod parse 통과 후 cast. `src/types/index.ts`에서 re-export.

## 규칙

- DB enum과 동기화되는 타입은 여기서 정의 (SessionKind, HoldColor 등).
- Drizzle schema에서 추론 가능한 타입은 `$inferSelect` / `$inferInsert` 사용, 여기서 중복 정의 X.
