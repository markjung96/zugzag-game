# tests/ — 테스트

## 구분

- `unit/` — Vitest. 순수 함수, 유틸리티, 에러 계층, zod 스키마 등.
- `integration/` — Vitest + postgres.js. 실 DB 의존 (partial UNIQUE 23505, cross-schema 조인 등). `POSTGRES_URL_ADMIN` 필수, BEGIN/ROLLBACK 격리.
- `e2e/` — Playwright. 전체 사용자 플로우, 화면 단위 테스트.

## 네이밍

- `{module}.test.ts` (unit + integration), `{flow}.spec.ts` (e2e).

## 실행

- `pnpm test` — unit only (vitest projects=unit).
- `pnpm test:integration` — integration only (POSTGRES_URL_ADMIN 필요. CI 미포함, dev/staging 로컬 전용).
- `pnpm test:all` — unit + integration 동시.
- `pnpm test:e2e` — Playwright (dev server 자동 시작).
