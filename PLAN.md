# IMPLEMENTATION PLAN — zugzag-game Phase 0.4 → Phase 1 완료

> **Single Source of Truth for execution.** 모든 향후 task는 이 문서의 ID/검증/의존성을 인용한다.
> 최종 갱신: 2026-05-13 | 기반: Phase 0.1-0.3 완료 상태 (commit ddf71d6)

---

## 목차

1. [개요 + 의사결정 우선순위](#1-개요--의사결정-우선순위)
2. [현재 상태 인벤토리](#2-현재-상태-인벤토리)
3. [기술 스택 lock-in](#3-기술-스택-lock-in)
4. [권장 폴더 구조](#4-권장-폴더-구조)
5. [harness 결정 + 액션](#5-harness-결정--액션)
6. [환경 변수 매트릭스](#6-환경-변수-매트릭스)
7. [DB 작업 계약](#7-db-작업-계약)
8. [Realtime publication 매트릭스](#8-realtime-publication-매트릭스)
9. [RLS 권한 매트릭스](#9-rls-권한-매트릭스)
10. [CRITICAL 5결정](#10-critical-5결정)
11. [디자인 토큰 이식 매핑](#11-디자인-토큰-이식-매핑)
12. [Primitives 6개 인터페이스 표](#12-primitives-6개-인터페이스-표)
13. [화면 12개 매핑 표](#13-화면-12개-매핑-표)
14. [API endpoint 표](#14-api-endpoint-표)
15. [Phase 0.4 잔여 task 체크리스트](#15-phase-04-잔여-task-체크리스트)
16. [Phase 1 task 체크리스트](#16-phase-1-task-체크리스트)
17. [권장 implementation 순서](#17-권장-implementation-순서)
18. [각 task verification 방법](#18-각-task-verification-방법)
19. [CI/CD 파이프라인](#19-cicd-파이프라인)
20. [Risk 표 + 완화](#20-risk-표--완화)
21. [부록 A: SQL 검증 쿼리 박제](#21-부록-a-sql-검증-쿼리-박제)
22. [부록 B: design-handoff JSX → React+TS 포팅 규칙](#22-부록-b-design-handoff-jsx--reactts-포팅-규칙)
23. [부록 C: 비-목표 재확인](#23-부록-c-비-목표-재확인)

---

## 1. 개요 + 의사결정 우선순위

**의사결정 우선순위**: `PRINCIPLES > FEATURE_SPEC > ROADMAP > DB_SHARING`

**가치 우선순위**: 라이브 > 정확성 > 운영 > 화려함

이 문서는 "Phase 0.4 잔여 + Phase 1 MVP 완료"까지의 **단일 실행 문서**이다. 기존 `docs/phases/phase-{0,1}.md`는 체크리스트로서 여전히 유효하나, 구체적 파일 위치·검증 방법·의존성 그래프는 이 plan이 SSOT.

---

## 2. 현재 상태 인벤토리

### Phase 0.1-0.3 완료 산출물 (commit별)

| Commit  | Phase   | 산출물                                                                            |
| ------- | ------- | --------------------------------------------------------------------------------- |
| b9d16cc | 기획    | docs/ 6개 + CLAUDE.md + AGENTS.md + .env.example                                  |
| 936c172 | 0.1-0.2 | Next.js 16.2.6 + pnpm + Drizzle setup + src/lib/db/client.ts                      |
| ad394e5 | 0.3     | games.ts (11 테이블, 7 enum, partial UNIQUE) + shared/ 미러 6개 + db/setup/ 4 SQL |
| ddf71d6 | 0.3     | Supabase Cloud 호환 (01-sql 수정) + Asia/Seoul timezone index (migration 0001)    |

### 코드 현황

| 영역          | 파일                                                 | 상태                         |
| ------------- | ---------------------------------------------------- | ---------------------------- |
| DB Schema     | `src/lib/db/schema/games.ts` (396줄)                 | 완료 — 11 테이블, 7 enum     |
| Mirror Schema | `src/lib/db/schema/shared/` (6 파일)                 | 완료 — read-only 헤더        |
| DB Client     | `src/lib/db/client.ts`                               | 완료 — Asia/Seoul timezone   |
| Supabase      | `src/lib/supabase/server.ts`                         | skeleton만 (실구현 대기)     |
| SQL Setup     | `db/setup/01~04.sql`                                 | 완료 — 사용자 수동 실행 대기 |
| Migrations    | `drizzle/0000_*.sql` (153줄), `0001_*.sql`           | 완료                         |
| Config        | `drizzle.config.ts`, `tsconfig.json`, `.env.example` | 완료                         |

### 미완료 (Phase 0.4 + Phase 1 대상)

| 카테고리    | 항목                                                       |
| ----------- | ---------------------------------------------------------- |
| 인증        | NextAuth .zugzag.com 쿠키 공유 (D14, T-I8) — 패키지 미설치 |
| Supabase    | client 실구현 (anon/service-role 분리 + RLS 헬퍼)          |
| API         | Route Handlers (POST /api/sends 외 전체)                   |
| Primitives  | 6개 React+TS 포팅                                          |
| 화면        | 12개 (P1-P12) React 포팅                                   |
| Realtime    | client + SSE proxy (E5)                                    |
| OG          | @vercel/og endpoints (E4)                                  |
| DB 적용     | db/setup/\*.sql Supabase Cloud 실행 (사용자 수동)          |
| Harness     | Prettier / Husky / lint-staged / GitHub Actions CI         |
| 테스트      | Vitest + Playwright                                        |
| 디자인 토큰 | tokens.css → globals.css + @theme 이식                     |

---

## 3. 기술 스택 lock-in

| 영역        | 선택                      | 버전               | 정당화                                                                                                                              |
| ----------- | ------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Framework   | Next.js (App Router)      | 16.2.6             | zugzag 본체 동일 생태계, SSR/RSC 활용                                                                                               |
| React       | React                     | 19.2.4             | Next.js 16 peer dependency                                                                                                          |
| Language    | TypeScript (strict)       | 5.9.3              | 타입 안전, Drizzle 추론                                                                                                             |
| Styling     | Tailwind CSS              | 4.3                | @theme 직접 var 참조, design token 호환                                                                                             |
| Linter      | ESLint                    | 9.39 (flat config) | 기존 설정 유지                                                                                                                      |
| Formatter   | Prettier                  | latest             | ESLint와 분리, pre-commit에서 실행                                                                                                  |
| ORM         | Drizzle ORM + drizzle-kit | 0.41.x / 0.31.10   | schemaFilter, pgSchema 지원                                                                                                         |
| DB Driver   | postgres.js               | 3.4.9              | Drizzle 공식 권장                                                                                                                   |
| Validation  | zod                       | 4.4.3              | API 입력 검증 통일                                                                                                                  |
| Auth        | NextAuth (Auth.js 5)      | 5.x                | 권장: Auth.js v5. 이유: zugzag 본체가 NextAuth v4이지만 쿠키 호환(.zugzag.com domain)은 secret 동일 시 가능. 신규 앱이므로 v5 채택. |
| Supabase    | @supabase/supabase-js     | 2.105.4            | Realtime + Storage + RLS                                                                                                            |
| Test (unit) | Vitest                    | latest             | Next.js 호환, fast                                                                                                                  |
| Test (e2e)  | Playwright                | latest             | 크로스 브라우저                                                                                                                     |
| Pre-commit  | Husky + lint-staged       | latest             | format + lint 강제                                                                                                                  |
| CI          | GitHub Actions            | -                  | type-check → lint → test → drizzle-kit check                                                                                        |
| Deploy      | Vercel                    | -                  | Edge Functions (SSE Proxy), @vercel/og                                                                                              |

### 결정 근거 (비교 검토 후 기각된 것)

| 비교 대상                    | 기각 이유                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Biome (ESLint+Prettier 대체) | ESLint flat config 이미 구성됨. 플러그인 생태계(next, tailwind) 아직 Biome 미지원. |
| Prisma (Drizzle 대체)        | pgSchema + schemaFilter 미지원. cross-schema FK 패턴 불가.                         |
| tRPC (Route Handlers 대체)   | 앱 간 공유 없음. zod + Route Handlers 충분.                                        |
| NextAuth v4 (v5 대신)        | 신규 앱에서 deprecated 스택 채택 불합리. 쿠키 호환은 secret 공유로 해결.           |

---

## 4. 권장 폴더 구조

### 4-A. CLAUDE.md 인덱싱 계층

에이전트가 프로젝트를 탐색할 때 **루트 `CLAUDE.md`가 폴더별 `CLAUDE.md`를 참조**하는 계층 구조를 따른다. 각 폴더의 `CLAUDE.md`는 해당 디렉토리의 코드 컨텍스트(역할, 핵심 패턴, 주의사항)를 담는다.

```
zugzag-game/
├── CLAUDE.md                ← 루트 인덱스 (진실 source 표 + 코딩 규칙 + 하위 CLAUDE 참조)
├── AGENTS.md                ← Next.js 16 specific 가이드
├── PLAN.md                  ← 실행 SSOT (이 문서)
├── src/
│   ├── app/
│   │   └── CLAUDE.md        ← 라우트 그룹 구조, layout 계층, API route 규칙
│   ├── components/
│   │   └── CLAUDE.md        ← primitives/screens/ui 분류 기준, 네이밍 컨벤션
│   ├── lib/
│   │   └── CLAUDE.md        ← db/auth/supabase/validation/errors 역할, import 규칙
│   ├── hooks/
│   │   └── CLAUDE.md        ← hook 네이밍, realtime 구독 패턴
│   └── types/
│       └── CLAUDE.md        ← branded type, ColorScores, 공유 타입 규칙
├── tests/
│   └── CLAUDE.md            ← Vitest/Playwright 구분, 테스트 네이밍, fixture 규칙
├── db/
│   └── CLAUDE.md            ← SQL 파일 순서, Supabase 수동 실행 절차
└── design-handoff/
    └── CLAUDE.md            ← read-only, 포팅 규칙 요약 (부록 B 참조)
```

> 루트 `CLAUDE.md` §7에 하위 CLAUDE 경로 표를 추가하여 자동 인덱싱.

### 4-B. 전체 소스 구조

```
src/
├── app/
│   ├── CLAUDE.md
│   ├── (auth)/              # 인증 필요 라우트 그룹
│   │   ├── c/[crew]/        # 크루 scope
│   │   │   ├── live/        # P1 LiveBoardPage
│   │   │   ├── seasons/     # P6 SeasonListPage, P9 SeasonDetailPage
│   │   │   ├── sessions/    # P10 SessionListPage, P11 SessionDetailPage
│   │   │   ├── problems/    # P2 ProblemBoardPage
│   │   │   ├── me/          # P4 MyRecordsPage
│   │   │   ├── timeline/    # P5 TimelinePage
│   │   │   └── admin/       # P6-P8 운영자 화면
│   │   └── layout.tsx       # auth guard + crew context
│   ├── (public)/            # 비인증 라우트
│   │   └── tv/[token]/      # E5 TV 모드
│   ├── api/
│   │   ├── sends/           # POST, [id]/PATCH, [id]/DELETE
│   │   ├── seasons/         # CRUD + close + display-tokens
│   │   ├── sessions/        # CRUD + start/close/join
│   │   ├── scoring-policies/
│   │   ├── setting-cycles/
│   │   ├── walls/
│   │   ├── problems/        # CRUD + photo
│   │   ├── rankings/
│   │   ├── og/              # E4 OG 이미지
│   │   ├── sse/             # E5 SSE proxy
│   │   └── admin/           # E7 stats/CSV
│   ├── globals.css          # tokens.css 이식 대상
│   └── layout.tsx           # root layout
├── components/
│   ├── CLAUDE.md
│   ├── primitives/          # KindBadge, FAB, HoldChip, BottomNav, Avatar, Toast
│   ├── screens/             # 화면 단위 컴포넌트 (Page 컴포넌트에서 호출)
│   └── ui/                  # 범용 (Button, Input, Card, Modal...)
├── lib/
│   ├── CLAUDE.md
│   ├── db/
│   │   ├── schema/          # games.ts + shared/
│   │   ├── client.ts        # Drizzle client (Asia/Seoul)
│   │   └── queries/         # 도메인별 쿼리 함수
│   ├── auth/                # NextAuth config + helpers
│   ├── supabase/            # client (anon/service-role)
│   ├── realtime/            # Supabase Realtime hooks
│   ├── sse/                 # SSE Proxy server-side
│   ├── og/                  # @vercel/og 헬퍼
│   ├── validation/          # zod schemas (API 입력)
│   └── errors/              # GameError 계층
├── hooks/
│   ├── CLAUDE.md
│   └── ...                  # 커스텀 React hooks
└── types/
    ├── CLAUDE.md
    └── ...                  # 공유 타입 (branded jsonb 등)

tests/
├── CLAUDE.md
├── unit/                    # Vitest
└── e2e/                     # Playwright

db/
├── CLAUDE.md
└── setup/                   # 01~04.sql (Supabase 수동 실행)

design-handoff/              # read-only reference
└── CLAUDE.md
```

---

## 5. harness 결정 + 액션

| 항목            | 결정                                           | 액션 (Phase 0.4)                                  |
| --------------- | ---------------------------------------------- | ------------------------------------------------- |
| Formatter       | Prettier (ESLint 분리)                         | `pnpm add -D prettier eslint-config-prettier`     |
| Pre-commit      | Husky + lint-staged                            | `pnpm add -D husky lint-staged && npx husky init` |
| lint-staged     | `*.{ts,tsx}` → prettier --write + eslint --fix | `.lintstagedrc.json` 작성                         |
| commitlint      | 도입하지 않음                                  | 커밋 메시지는 task ID 인용만 권장, 강제 X         |
| Vitest          | unit test runner                               | `pnpm add -D vitest @vitejs/plugin-react`         |
| Playwright      | e2e test runner                                | `pnpm add -D @playwright/test`                    |
| CI              | GitHub Actions                                 | `.github/workflows/ci.yml` 작성                   |
| tokens.css 이식 | Phase 0.4에 포함                               | `src/app/globals.css` + Tailwind 4 @theme 연동    |

### Husky pre-commit hook 내용

```sh
#!/bin/sh
npx lint-staged
```

### lint-staged 설정

```json
{
  "*.{ts,tsx}": ["prettier --write", "eslint --fix --max-warnings 0"],
  "*.{json,md,css}": ["prettier --write"]
}
```

---

## 6. 환경 변수 매트릭스

| 변수                            | 용도                                        | dev (localhost)         | staging                            | prod                       |
| ------------------------------- | ------------------------------------------- | ----------------------- | ---------------------------------- | -------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase 프로젝트 URL                       | 같은 값                 | 같은 값                            | 같은 값                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 RLS 접근                         | 같은 값                 | 같은 값                            | 같은 값                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | send_revisions INSERT, SSE Proxy RLS bypass | 같은 값                 | 같은 값                            | 같은 값                    |
| `POSTGRES_URL`                  | Drizzle migration + 직접 쿼리               | pooler 또는 direct      | pooler                             | pooler                     |
| `NEXTAUTH_URL`                  | 앱 base URL                                 | `http://localhost:3000` | `https://staging.games.zugzag.com` | `https://games.zugzag.com` |
| `NEXTAUTH_COOKIE_DOMAIN`        | 쿠키 공유 도메인                            | 미설정 (localhost)      | `.zugzag.com`                      | `.zugzag.com`              |
| `NEXTAUTH_SECRET`               | 세션 암호화 (본체와 동일)                   | 본체 값 복사            | 본체 값 복사                       | 본체 값 복사               |
| `UPSTASH_REDIS_URL`             | Rate limit (Phase 2)                        | 미설정                  | 미설정                             | Phase 2                    |
| `UPSTASH_REDIS_TOKEN`           | Rate limit (Phase 2)                        | 미설정                  | 미설정                             | Phase 2                    |

> **보안**: `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET`, `POSTGRES_URL`은 Vercel Environment Variables에 저장. 절대 `.env.local` 커밋 금지.

---

## 7. DB 작업 계약

### 적용 순서

| #   | 파일                                        | 사전 조건                       | 실행 주체                           |
| --- | ------------------------------------------- | ------------------------------- | ----------------------------------- |
| 1   | `db/setup/01-schema-and-role.sql`           | zugzag 본체 운영 중             | 사용자 (Supabase SQL Editor, SUPER) |
| 2   | Drizzle migration (`pnpm drizzle-kit push`) | 01 실행 완료                    | 개발자 CLI                          |
| 3   | `db/setup/02-publication.sql`               | migration 완료 (테이블 존재)    | 사용자 (SQL Editor)                 |
| 4   | `db/setup/03-rls-policies.sql`              | migration 완료                  | 사용자 (SQL Editor)                 |
| 5   | `db/setup/04-cross-schema-fks.sql`          | migration 완료 + public.\* 존재 | 사용자 (SQL Editor)                 |

### 사용자 수동 실행 절차

1. Supabase 대시보드 → SQL Editor 진입
2. `01-schema-and-role.sql` 내 `CHANGE_ME_BEFORE_RUN`을 안전한 비밀번호로 교체 후 실행
3. 로컬에서 `pnpm drizzle-kit push` (또는 `drizzle-kit migrate`) 실행
4. 02 → 03 → 04 순서대로 SQL Editor에서 실행
5. 각 단계 후 부록 A의 검증 쿼리 실행

### 검증 쿼리 (요약, 상세는 부록 A)

```sql
-- publication 확인
SELECT schemaname, tablename FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime' AND schemaname = 'games';
-- 기대: 4행 (seasons, send_revisions, sends, sessions)

-- RLS 활성 확인
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'games';
-- 기대: 모든 행 rowsecurity = true

-- cross-schema FK 확인
SELECT tc.constraint_name FROM information_schema.table_constraints tc
  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'games';
-- 기대: 15개
```

---

## 8. Realtime publication 매트릭스

| 테이블                   | publication 포함 | 클라이언트 구독     | 필터 정책                                        |
| ------------------------ | :--------------: | ------------------- | ------------------------------------------------ |
| `games.sends`            |        ✅        | `crew_id` 기반 채널 | 없음 (전체 수신)                                 |
| `games.send_revisions`   |        ✅        | `send_id` 기반      | cancel 이벤트 → E3 카운터 decrement              |
| `games.sessions`         |        ✅        | `crew_id` 기반      | 클라이언트에서 `kind='ranked'`만 표시 (C-C, D25) |
| `games.seasons`          |        ✅        | `crew_id` 기반      | E8 의식 카드 — status 전환 감지                  |
| `games.display_tokens`   |        ❌        | -                   | auth artifact, 노출 금지                         |
| `games.problems`         |        ❌        | -                   | React Query fetch                                |
| `games.scoring_policies` |        ❌        | -                   | 시즌 단위 안정                                   |
| `public.*` 전체          |        ❌        | -                   | Realtime 노출 금지                               |

---

## 9. RLS 권한 매트릭스

| 테이블                 | SELECT                       | INSERT                | UPDATE              | DELETE           |
| ---------------------- | ---------------------------- | --------------------- | ------------------- | ---------------- |
| `seasons`              | crew member                  | crew admin            | crew admin          | crew admin       |
| `scoring_policies`     | crew member                  | crew admin            | crew admin          | crew admin       |
| `sessions`             | crew member (via season)     | crew admin            | crew admin          | crew admin       |
| `session_teams`        | crew member                  | crew admin            | crew admin          | crew admin       |
| `session_participants` | crew member                  | 본인 or admin         | 본인 or admin       | 본인 or admin    |
| `setting_cycles`       | authenticated (Phase 0 임시) | authenticated         | authenticated       | authenticated    |
| `walls`                | authenticated (Phase 0 임시) | authenticated         | authenticated       | authenticated    |
| `problems`             | authenticated (Phase 0 임시) | authenticated         | authenticated       | authenticated    |
| `sends`                | crew member (via season)     | 본인 + crew member    | 본인                | 본인             |
| `send_revisions`       | send SELECT 가능자           | **service_role only** | ❌ (USING false)    | ❌ (USING false) |
| `display_tokens`       | crew admin                   | crew admin            | crew admin (revoke) | crew admin       |

> **헬퍼 함수**: `games.is_crew_member(crew_id, user_id)`, `games.is_crew_admin(crew_id, user_id)`, `games.session_crew_id(session_id)`

---

## 10. CRITICAL 5결정

| ID      | 결정                                                    | 코드 위치                                                      | 보장 방법                                        |
| ------- | ------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| D14     | NextAuth `.zugzag.com` 쿠키 공유                        | `src/lib/auth/config.ts` — cookies.sessionToken.options.domain | e2e 테스트: 본체 로그인 → games 진입 확인        |
| D17     | Supabase 대시보드 수동 SQL                              | `db/setup/01~04.sql` repo 고정                                 | CI에서 drizzle-kit check 통과                    |
| D19-D20 | Full Pivot (ranked/casual_open)                         | `src/lib/db/schema/games.ts` sessions.kind, sends.sessionKind  | partial UNIQUE index 존재 확인                   |
| D23-D25 | C-A/B/C fixes (denormalized kind, 1/day, client filter) | games.ts sends_ranked_first_send_only, casual_open_one_per_day | migration에 index 포함                           |
| E5      | SSE Proxy (display_tokens + Vercel Edge)                | `src/app/api/sse/route.ts` + `src/lib/sse/proxy.ts`            | service-role Realtime 구독 → SSE push, p99 1-2초 |

---

## 11. 디자인 토큰 이식 매핑

**Source**: `design-handoff/zugzag-game/project/tokens.css` (39 CSS 변수)
**Target**: `src/app/globals.css` `:root {}` + Tailwind 4 `@theme` 직접 var 참조

| tokens.css 변수                 | globals.css :root   | Tailwind 사용                  |
| ------------------------------- | ------------------- | ------------------------------ |
| `--bg-canvas` (#0A0A0B)         | `--bg-canvas`       | `bg-[var(--bg-canvas)]`        |
| `--bg-canvas-2` (#1A1A1F)       | `--bg-canvas-2`     | `bg-[var(--bg-canvas-2)]`      |
| `--bg-surface` (#16161A)        | `--bg-surface`      | `bg-[var(--bg-surface)]`       |
| `--bg-surface-2` (#1E1E24)      | `--bg-surface-2`    | `bg-[var(--bg-surface-2)]`     |
| `--bg-overlay`                  | `--bg-overlay`      | `bg-[var(--bg-overlay)]`       |
| `--text-primary` (#F4F4F5)      | `--text-primary`    | `text-[var(--text-primary)]`   |
| `--text-secondary` (#A1A1AA)    | `--text-secondary`  | `text-[var(--text-secondary)]` |
| `--text-tertiary` (#71717A)     | `--text-tertiary`   | `text-[var(--text-tertiary)]`  |
| `--text-disabled` (#52525B)     | `--text-disabled`   | `text-[var(--text-disabled)]`  |
| `--text-on-accent` (#FFFFFF)    | `--text-on-accent`  | `text-[var(--text-on-accent)]` |
| `--accent-ranked` (#FF3B5C)     | `--accent-ranked`   | `bg-[var(--accent-ranked)]`    |
| `--accent-ranked-2` (#FF5876)   | `--accent-ranked-2` | hover states                   |
| `--accent-casual` (#71717A)     | `--accent-casual`   | badge border                   |
| `--accent-win` (#FFD24A)        | `--accent-win`      | 1위 glow                       |
| `--accent-silver/bronze`        | 그대로              | 2위/3위                        |
| `--accent-alert/success`        | 그대로              | 에러/성공                      |
| `--hold-*` (8색)                | 그대로              | HoldChip                       |
| `--border-default/strong/focus` | 그대로              | borders                        |
| `--r-sm/md/lg/xl/full`          | 그대로              | `rounded-[var(--r-md)]`        |
| `--el-card/modal/toast/glow-*`  | 그대로              | shadows                        |
| `--font-kr/num`                 | 그대로              | `font-[var(--font-kr)]`        |

### Tailwind 4 @theme 연동 방식

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-canvas: var(--bg-canvas);
  --color-surface: var(--bg-surface);
  --color-ranked: var(--accent-ranked);
  /* ... 필요한 것만 semantic alias */
}

:root {
  /* tokens.css 전체 복사 (값만) */
}
```

> **규칙**: Tailwind 3식 `theme.extend` 금지. Tailwind 4는 CSS 변수를 `@theme`에서 직접 참조.

---

## 12. Primitives 6개 인터페이스 표

| #   | Component   | Props                                                                            | Variants                                  | 토큰                                         | 사용 화면               | a11y                             |
| --- | ----------- | -------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------- | ----------------------- | -------------------------------- |
| 1   | `KindBadge` | `kind: 'ranked' \| 'casual'`                                                     | ranked (빨강 pill), casual (outline pill) | `--accent-ranked`, `--text-secondary`        | P1, P5, P10, P11        | `role="status"`, aria-label      |
| 2   | `FAB`       | `label: string`, `onClick`                                                       | default (ranked accent)                   | `--accent-ranked`, glow shadow               | P1, P2, P4, P5          | `aria-label="완등 기록"`         |
| 3   | `HoldChip`  | `color: HoldColor`, `number: number`, `size?`, `done?`, `attempted?`, `onClick?` | 8 color, done=체크, attempted=dashed      | `--hold-*`                                   | P2, P3, P1(toast)       | 색맹 대비 — number 항상 표시     |
| 4   | `BottomNav` | `active: TabId`, `rankedLive?: boolean`                                          | 4 tabs, live dot indicator                | `--text-primary/tertiary`, `--accent-ranked` | 모든 (auth) 화면        | nav landmark, aria-current       |
| 5   | `Avatar`    | `name: string`, `size?`, `color?`, `src?`                                        | size variants (24/32/40/56)               | `--bg-surface-2`, `--border-default`         | P1, P5, P9, P10         | alt text                         |
| 6   | `Toast`     | `children`, `kind?: 'send' \| 'info' \| 'error'`                                 | send/info/error                           | `--bg-surface-2`, `--el-toast`               | P1(라이브 토스트), 전역 | role="alert", aria-live="polite" |

---

## 13. 화면 12개 매핑 표

| ID  | 화면명                 | design-handoff JSX             | 라우트 경로                    | API 의존                  | Realtime 구독     |
| --- | ---------------------- | ------------------------------ | ------------------------------ | ------------------------- | ----------------- |
| P1  | LiveBoardPage          | `screens/01-live-board.jsx`    | `/c/[crew]/live`               | GET rankings              | sends (INSERT)    |
| P2  | ProblemBoardPage       | `screens/02-problem-board.jsx` | `/c/[crew]/problems`           | GET problems, GET sends   | -                 |
| P3  | SendRecordModal        | `screens/03-send-modal.jsx`    | modal (overlay)                | POST /api/sends           | -                 |
| P4  | MyRecordsPage          | `screens/04-my-records.jsx`    | `/c/[crew]/me`                 | GET sends?userId=         | -                 |
| P5  | GameHomePage           | `screens/05-game-home.jsx`     | `/c/[crew]`                    | GET seasons, GET sessions | sessions (status) |
| P6  | SeasonManagePage       | `screens/06-season-manage.jsx` | `/c/[crew]/admin/seasons`      | seasons CRUD              | -                 |
| P7  | QuickRankedSessionPage | `screens/07-quick-ranked.jsx`  | `/c/[crew]/admin/sessions/new` | POST sessions             | -                 |
| P8  | TVTokenGeneratePage    | `screens/08-tv-token.jsx`      | `/c/[crew]/admin/tv`           | POST display-tokens       | -                 |
| P9  | SeasonDetailPage       | -                              | `/c/[crew]/seasons/[id]`       | GET rankings              | sends             |
| P10 | SessionListPage        | -                              | `/c/[crew]/sessions`           | GET sessions              | sessions          |
| P11 | SessionDetailPage      | -                              | `/c/[crew]/sessions/[id]`      | GET session, rankings     | sends             |
| P12 | LiveSessionBoardPage   | -                              | `/c/[crew]/sessions/[id]/live` | GET rankings              | sends             |

---

## 14. API endpoint 표

| Method   | Path                                   | zod schema                             | RLS check              | Error class                           | Rate limit   |
| -------- | -------------------------------------- | -------------------------------------- | ---------------------- | ------------------------------------- | ------------ |
| GET      | `/api/crews/[crewId]/seasons`          | query: {status?}                       | crew member            | -                                     | -            |
| POST     | `/api/crews/[crewId]/seasons`          | body: CreateSeason                     | crew admin             | PolicyError                           | -            |
| GET      | `/api/seasons/[id]`                    | -                                      | crew member            | -                                     | -            |
| PATCH    | `/api/seasons/[id]`                    | body: UpdateSeason                     | crew admin             | -                                     | -            |
| POST     | `/api/seasons/[id]/close`              | -                                      | crew admin             | PolicyError                           | -            |
| POST     | `/api/seasons/[id]/display-tokens`     | body: CreateToken                      | crew admin             | -                                     | -            |
| DELETE   | `/api/display-tokens/[id]`             | -                                      | crew admin             | -                                     | -            |
| GET      | `/api/crews/[crewId]/scoring-policies` | -                                      | crew member            | -                                     | -            |
| POST     | `/api/crews/[crewId]/scoring-policies` | body: CreatePolicy                     | crew admin             | -                                     | -            |
| PATCH    | `/api/scoring-policies/[id]`           | body: UpdatePolicy                     | crew admin             | PolicyError (locked)                  | -            |
| GET      | `/api/gyms/[gymId]/setting-cycles`     | -                                      | authenticated          | -                                     | -            |
| POST     | `/api/gyms/[gymId]/setting-cycles`     | body: CreateCycle                      | crew admin             | -                                     | -            |
| PATCH    | `/api/setting-cycles/[id]/close`       | -                                      | crew admin             | -                                     | -            |
| GET      | `/api/gyms/[gymId]/walls`              | -                                      | authenticated          | -                                     | -            |
| POST     | `/api/gyms/[gymId]/walls`              | body: CreateWall                       | crew admin             | -                                     | -            |
| GET      | `/api/setting-cycles/[id]/problems`    | -                                      | authenticated          | -                                     | -            |
| POST     | `/api/setting-cycles/[id]/problems`    | body: CreateProblem                    | crew admin             | -                                     | -            |
| POST     | `/api/problems/[id]/photo`             | multipart (MIME check)                 | crew admin             | -                                     | -            |
| GET      | `/api/sends`                           | query: {seasonId, userId?, problemId?} | crew member            | -                                     | -            |
| **POST** | **`/api/sends`**                       | body: CreateSend                       | user + crew member     | RLSError, PolicyError, RateLimitError | **60s/30회** |
| PATCH    | `/api/sends/[id]`                      | body: {comment}                        | owner                  | -                                     | -            |
| DELETE   | `/api/sends/[id]`                      | -                                      | owner                  | -                                     | -            |
| GET      | `/api/sends/[id]/revisions`            | -                                      | crew member            | -                                     | -            |
| GET      | `/api/seasons/[id]/sessions`           | -                                      | crew member            | -                                     | -            |
| POST     | `/api/seasons/[id]/sessions`           | body: CreateSession                    | crew admin             | -                                     | -            |
| GET      | `/api/sessions/[id]`                   | -                                      | crew member            | -                                     | -            |
| POST     | `/api/sessions/[id]/join`              | body: {teamId?}                        | crew member            | -                                     | -            |
| POST     | `/api/sessions/[id]/start`             | -                                      | crew admin             | -                                     | -            |
| POST     | `/api/sessions/[id]/close`             | -                                      | crew admin             | -                                     | -            |
| GET      | `/api/seasons/[id]/rankings`           | query: {type}                          | crew member            | -                                     | -            |
| GET      | `/api/sessions/[id]/rankings`          | query: {type}                          | crew member            | -                                     | -            |
| GET      | `/api/og/season/[id]/champion`         | -                                      | 비인증 (시즌 closed만) | -                                     | -            |
| GET      | `/api/og/season/[id]/user/[userId]`    | query: {token}                         | owner_token            | -                                     | -            |
| GET      | `/api/sse/[token]`                     | -                                      | display_token 검증     | -                                     | -            |
| GET      | `/api/admin/stats`                     | query: {seasonId}                      | crew admin             | -                                     | -            |

---

## 15. Phase 0.4 잔여 task 체크리스트

| Task ID         | 무엇                                        | 파일                                                     | 상태         |
| --------------- | ------------------------------------------- | -------------------------------------------------------- | ------------ |
| P0.4-Prettier   | Prettier + eslint-config-prettier           | `.prettierrc.json`, `eslint.config.mjs`                  | ✅ 완료      |
| P0.4-Husky      | Husky + lint-staged                         | `.husky/pre-commit`, `package.json` lint-staged          | ✅ 완료      |
| P0.4-Tokens     | tokens.css → globals.css + @theme           | `src/app/globals.css` (42 CSS vars + @theme inline)      | ✅ 완료      |
| P0.4-Vitest     | Vitest 설치 + 설정                          | `vitest.config.ts`, `tests/unit/errors.test.ts` (8 pass) | ✅ 완료      |
| P0.4-Playwright | Playwright 설치 + 설정                      | `playwright.config.ts`, `tests/e2e/`                     | ✅ 완료      |
| P0.4-CI         | GitHub Actions                              | `.github/workflows/ci.yml` (type-check→lint→format→test) | ✅ 완료      |
| P0.4-NextAuth   | NextAuth v5 + .zugzag.com 쿠키              | `src/lib/auth/{config,index}.ts`                         | ✅ 완료      |
| P0.4-Supabase   | Supabase client (anon/service)              | `src/lib/supabase/{server,client}.ts`                    | ✅ 완료      |
| P0.4-Middleware | 미인증 리다이렉트 미들웨어                  | `src/middleware.ts`                                      | ✅ 완료      |
| P0.4-TM1        | Asia/Seoul timezone                         | DB schema + client.ts `TimeZone` 설정                    | ✅ 기존 완료 |
| P0.4-TM2        | Ranked close race 핸들링                    | Phase 1 sends API 구현 시 포함                           | ⏳ Phase 1   |
| P0.4-TMS1       | casual_open lazy close                      | Phase 1 sends API 구현 시 포함                           | ⏳ Phase 1   |
| P0.4-Errors     | GameError 계층                              | `src/lib/errors/index.ts` (6 class + handler)            | ✅ 완료      |
| P0.4-Folder     | 폴더 scaffold + CLAUDE.md 인덱스            | 8개 폴더별 CLAUDE.md 생성                                | ✅ 완료      |
| P0.4-Types      | 공유 타입 (Brand, ColorScores, SessionKind) | `src/types/index.ts`                                     | ✅ 완료      |

---

## 16. Phase 1 task 체크리스트

### §1.1 도메인 모델 + 검증 박제 ✅ 완료

> **컨셉 변경 (2026-05-13)**: 초기 plan의 `P1.1-Seed`는 폐기. scoring policy는 시스템 invariant가 아니라 운영자 자율 룰북 — DB seed에 박는 게 아니라 **P1.2-PolicyCRUD admin UI에서 생성**. 기본값(10/20/35/...)은 `src/lib/policies/default-template.ts` 상수로 보관해 UI "기본값 불러오기" 버튼에서 import.

| Task ID             | 무엇                                                                                                              | 파일                                                                 | 의존               | 검증                                                                                    | 상태                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------- | ------------------------ |
| P1.1-Validation     | zod 스키마 공유 모듈 (color-scores/seasons/policies/cycles/walls/problems/sessions/sends/display-tokens + barrel) | `src/lib/validation/*.ts` (9 + index)                                | 없음               | 27 unit tests pass (color-scores 5 / seasons 5 / sends 5 / display-tokens 4 / errors 8) | ✅ 완료                  |
| P1.1-PolicyTemplate | scoring policy 기본 템플릿 상수 (점수 권장값 + 라벨 aliases)                                                      | `src/lib/policies/default-template.ts`                               | 없음               | type-check + lint pass. P1.2-PolicyCRUD에서 import 예정.                                | ✅ 완료                  |
| P1.1-Migration0002  | `scoring_policies (crew_id, name)` UNIQUE (race-safe)                                                             | `db/migrations/0002_sharp_proemial_gods.sql` + games.ts schema       | 없음               | Supabase SQL Editor 적용 완료 (사용자 확인)                                             | ✅ 완료                  |
| P1.1-Integration    | partial UNIQUE + cross-schema 조인 통합 테스트                                                                    | `tests/integration/{setup,partial-unique,cross-schema-join}.test.ts` | POSTGRES_URL_ADMIN | 사용자 실행 필요: `pnpm test:integration`                                               | ✅ 코드 / ⏳ 사용자 실행 |
| P1.1-AdminGuard     | POSTGRES_URL_ADMIN ESLint guard (dot/bracket/destructure 3종)                                                     | `eslint.config.mjs`, `.env.example`                                  | 없음               | lint pass + tests/integration/setup.ts만 ignores                                        | ✅ 완료                  |
| ~~P1.1-Seed~~       | ~~기본 점수 정책 시드~~ → 폐기, P1.2-PolicyCRUD로 이관                                                            | ~~`src/lib/db/seed.ts`~~ → `src/lib/policies/default-template.ts`    | -                  | -                                                                                       | ❌ 폐기                  |

### §1.2 운영자 화면

| Task ID          | 무엇                                                                                                           | 파일                                                             | 의존                           | 검증                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------ | ----------------------------------------- |
| P1.2-SeasonCRUD  | 시즌 CRUD 화면 + API                                                                                           | `src/app/(auth)/c/[crew]/admin/seasons/`, `src/app/api/seasons/` | P0.4-NextAuth, P1.1-Validation | 시즌 생성→조회→수정→close 흐름            |
| P1.2-PolicyCRUD  | 정책 CRUD ("기본값 불러오기" 버튼 → `src/lib/policies/default-template.ts` import + provider_colors 자동 매핑) | api + 화면                                                       | P1.2-SeasonCRUD                | 정책 연결 시즌 확인 + 기본값 prefill 동작 |
| P1.2-CycleMgmt   | 세팅 회차 관리                                                                                                 | api + 화면                                                       | 없음                           | active 1개 제약 확인                      |
| P1.2-WallMgmt    | 벽 관리                                                                                                        | api + 화면                                                       | 없음                           | UNIQUE (gym, name) 확인                   |
| P1.2-ProblemAdd  | 30초 문제 등록 UX                                                                                              | api + 화면 + photo upload                                        | P1.2-CycleMgmt                 | MIME double check + 30초 이내 등록        |
| P1.2-QuickRanked | 즉석 랭크전 열기                                                                                               | P7 화면 + POST sessions                                          | P1.2-SeasonCRUD                | ranked 세션 생성 확인                     |
| P1.2-TVToken     | TV 토큰 발급                                                                                                   | P8 화면 + POST display-tokens                                    | 없음                           | 토큰 생성 + QR 표시                       |

### §1.3 멤버 화면

| Task ID            | 무엇                               | 파일                   | 의존               | 검증                              |
| ------------------ | ---------------------------------- | ---------------------- | ------------------ | --------------------------------- |
| P1.3-Home          | GameHomePage (P5)                  | 화면                   | P1.2-SeasonCRUD    | 시즌 요약 + 세션 카드 표시        |
| P1.3-ProblemBoard  | ProblemBoardPage (P2)              | 화면                   | P1.2-ProblemAdd    | 벽×색 그리드 표시                 |
| P1.3-SendModal     | SendRecordModal (P3) + E1 자동선택 | 화면 + POST /api/sends | P1.3-ProblemBoard  | 3탭 위저드 + LocalStorage prefill |
| P1.3-MyRecords     | MyRecordsPage (P4)                 | 화면                   | P1.3-SendModal     | 본인 기록 목록                    |
| P1.3-SeasonDetail  | SeasonDetailPage (P9)              | 화면                   | P1.2-SeasonCRUD    | 시즌 랭킹 표시                    |
| P1.3-SessionDetail | SessionDetailPage (P11)            | 화면                   | P1.2-QuickRanked   | 세션 상세 + 랭킹                  |
| P1.3-SessionJoin   | SessionJoinPage                    | 화면 + POST join       | P1.3-SessionDetail | 참가 + 팀 선택                    |

### §1.4 라이브 보드 ✅ 코드 완료 / ⏳ KPI 측정 대기

> NextAuth JWT broker(T0)와 ranking API/query helper는 plan에는 명시되지 않았지만 P1.4 동작에 필수여서 함께 구현했다. 모두 typecheck + lint + unit test green.

| Task ID          | 무엇                                                                  | 파일                                                                                      | 의존                        | 검증                                          | 상태                     |
| ---------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------- | ------------------------ |
| P1.4-JWTBroker   | NextAuth → Supabase JWT broker (HS256, 1h, 5분 전 갱신) + client 주입 | `src/lib/auth/config.ts`, `src/lib/supabase/{client,server}.ts`, `next-auth.d.ts`         | P0.4-NextAuth               | typecheck + 모든 라우트에서 `auth.uid()` 매핑 | ✅ 완료                  |
| P1.4-Realtime    | Supabase Realtime 클라이언트 hook + zod payload 검증                  | `src/lib/realtime/{useRealtimeSends,schemas}.ts`                                          | P1.4-JWTBroker              | unit test (realtime-schemas) + INSERT 수신    | ✅ 완료                  |
| P1.4-RankAPI     | 시즌/세션 ranking GET + query helper (RPC + raw fallback)             | `src/app/api/{seasons,sessions}/[id]/rankings/route.ts`, `src/lib/db/queries/rankings.ts` | P1.4-JWTBroker              | typecheck + ranked sends만 합산               | ✅ 완료                  |
| P1.4-LiveBoard   | LiveBoardPage (P1) — SSR 초기 + Realtime patch + race-window refetch  | `src/app/(auth)/c/[crew]/live/`                                                           | P1.4-Realtime, P1.4-RankAPI | e2e live-board + KPI                          | ✅ 코드 / ⏳ KPI 측정    |
| P1.4-LiveSession | LiveSessionBoardPage (P12)                                            | `src/app/(auth)/c/[crew]/sessions/[id]/live/`                                             | P1.4-Realtime, P1.4-RankAPI | 카운트다운 + 실시간                           | ✅ 완료                  |
| P1.4-Toast       | "방금 풀이" 토스트 카드 + primitives (BottomNav/KindBadge/Avatar)     | `src/components/primitives/`                                                              | P1.4-Realtime               | LiveBoard 안에서 3초 페이드                   | ✅ 완료                  |
| P1.4-Fallback    | 60s 1회 fallback polling                                              | LiveBoardClient 내                                                                        | P1.4-LiveBoard              | 네트워크 복구 테스트                          | ✅ 완료                  |
| P1.4-E2E         | live-kpi.spec.ts (100 INSERT, NTP-offset 보정, p95 < 4500ms)          | `tests/e2e/live-kpi.spec.ts`, `live-board.spec.ts`, `tests/helpers/admin-pg.ts`           | P1.4-LiveBoard              | `pnpm test:kpi` p95 통과                      | ✅ 코드 / ⏳ 사용자 실행 |
| P1.4-E2          | 점수 프리뷰 (Step 3)                                                  | SendRecordModal                                                                           | P1.3-SendModal              | ranked에서만 표시, casual 별도 카피           | ⏳ Phase 1.3에서         |
| P1.4-E3          | 누적 카운터                                                           | LiveBoardPage                                                                             | P1.4-Realtime               | ranked sends만 count                          | ⏳ Phase 1.3 후속        |

### §1.5 운영 안전망

| Task ID        | 무엇                               | 파일                                        | 의존          | 검증                        |
| -------------- | ---------------------------------- | ------------------------------------------- | ------------- | --------------------------- |
| P1.5-Revisions | send_revisions 자동 기록 로직      | `src/app/api/sends/` 내 service-role INSERT | P0.4-Supabase | cancel 시 revision row 확인 |
| P1.5-RateLimit | POST /api/sends 60s/30회 in-memory | `src/lib/rate-limit.ts`                     | 없음          | 31번째 요청 429             |
| P1.5-Logging   | structured JSON 로깅               | `src/lib/logger.ts`                         | 없음          | console output 확인         |

### §1.6 Cherry-picks

| Task ID       | 무엇                                    | 파일                              | 의존                         | 검증                             |
| ------------- | --------------------------------------- | --------------------------------- | ---------------------------- | -------------------------------- |
| P1.6-E1       | SendRecordModal 자동선택 (LocalStorage) | P3 화면 내                        | P1.3-SendModal               | prefill + fallback               |
| P1.6-E4       | 시즌 OG 이미지 2종                      | `src/app/api/og/`                 | P1.2-SeasonCRUD              | @vercel/og 렌더링 확인           |
| P1.6-E5-Token | display_tokens API + TV 라우트          | `src/app/(public)/tv/[token]/`    | P1.2-TVToken                 | 비인증 접근 + 토큰 검증          |
| P1.6-E5-SSE   | SSE Proxy (Vercel Edge)                 | `src/app/api/sse/route.ts`        | P1.4-Realtime                | service-role Realtime → SSE push |
| P1.6-E7       | raw 데이터 대시보드 + CSV               | admin 화면 + API                  | P1.2-SeasonCRUD              | sparkline + CSV download         |
| P1.6-E8       | 의식 카드 (TV)                          | `src/app/(public)/tv/[token]/` 내 | P1.6-E5-Token, P1.4-Realtime | seasons status 변경 → overlay    |

---

## 17. 권장 implementation 순서

```
Phase 0.4 (harness + auth + supabase)
  │
  ├─ P0.4-Folder
  ├─ P0.4-Prettier → P0.4-Husky
  ├─ P0.4-Tokens
  ├─ P0.4-Vitest, P0.4-Playwright
  ├─ P0.4-CI
  ├─ P0.4-Errors
  ├─ P0.4-NextAuth → P0.4-Middleware
  ├─ P0.4-Supabase
  ├─ P0.4-TM1 (이미 index 존재, 서버 로직만)
  ├─ P0.4-TM2, P0.4-TMS1 (sends API 내)
  │
  ▼ 사용자 DB 적용 (db/setup/*.sql) ← gate
  │
Phase 1.1 (도메인 모델 + 검증 박제)
  ├─ P1.1-Validation
  ├─ P1.1-PolicyTemplate (default-template.ts 상수)
  ├─ P1.1-Migration0002 (scoring_policies UNIQUE)
  ├─ P1.1-AdminGuard
  └─ P1.1-Integration
  │
  ▼
Phase 1.4 (라이브 보드 핵심 — P1 KPI)
  ├─ P1.4-Realtime
  ├─ P1.4-LiveBoard → P1.4-Toast, P1.4-Fallback
  └─ P1.4-LiveSession
  │
  ▼
Phase 1.3 (멤버 화면)
  ├─ P1.3-ProblemBoard
  ├─ P1.3-SendModal + P1.6-E1
  ├─ P1.4-E2, P1.4-E3
  ├─ P1.3-Home
  ├─ P1.3-MyRecords
  ├─ P1.3-SeasonDetail, P1.3-SessionDetail, P1.3-SessionJoin
  │
  ▼
Phase 1.2 (운영자 화면)
  ├─ P1.2-SeasonCRUD, P1.2-PolicyCRUD
  ├─ P1.2-CycleMgmt, P1.2-WallMgmt, P1.2-ProblemAdd
  ├─ P1.2-QuickRanked
  └─ P1.2-TVToken
  │
  ▼
Phase 1.5 (안전망)
  ├─ P1.5-Revisions
  ├─ P1.5-RateLimit
  └─ P1.5-Logging
  │
  ▼
Phase 1.6 (cherry-picks)
  ├─ P1.6-E4 (OG)
  ├─ P1.6-E5-Token, P1.6-E5-SSE
  ├─ P1.6-E7 (dashboard)
  └─ P1.6-E8 (의식 카드)
```

> **핵심 원칙**: 라이브 보드(P1.4)를 멤버 화면보다 먼저 구현. P1 KPI "5초 반영"을 빨리 검증해야 리스크 조기 발견.

---

## 18. 각 task verification 방법

| 검증 유형         | 적용 대상                                         | 도구                                                  |
| ----------------- | ------------------------------------------------- | ----------------------------------------------------- |
| type-check        | 모든 task                                         | `pnpm tsc --noEmit`                                   |
| lint              | 모든 task                                         | `pnpm lint` (ESLint + Prettier check)                 |
| RLS 통합 테스트   | sends, sessions, send_revisions                   | Vitest + Supabase client (anon role로 forbidden 확인) |
| Realtime smoke    | P1.4-Realtime                                     | 수동: INSERT → 이벤트 수신 console.log                |
| Vitest unit       | 도메인 로직 (점수 계산, session 결정, rate limit) | `pnpm test`                                           |
| Playwright e2e    | 핵심 flow (로그인 → 기록 → 라이브 보드 반영)      | `pnpm e2e`                                            |
| p95 측정          | P1.4-LiveBoard                                    | 클라이언트 performance.now() 로깅                     |
| 수동 dogfooding   | 전체                                              | 크루 멤버 N명 실사용                                  |
| drizzle-kit check | schema 변경 시                                    | CI에서 자동                                           |
| MIME check        | photo upload                                      | unit test (magic bytes)                               |

---

## 19. CI/CD 파이프라인

### GitHub Actions (`ci.yml`)

```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit
      - run: pnpm lint
      - run: pnpm prettier --check .
      - run: pnpm test -- --run
      - run: pnpm drizzle-kit check
```

### Vercel 배포

| 환경       | 트리거     | URL                   |
| ---------- | ---------- | --------------------- |
| Preview    | PR push    | `*.vercel.app` (자동) |
| Production | main merge | `games.zugzag.com`    |

---

## 20. Risk 표 + 완화

| #   | Risk                    | 영향        | 확률 | 완화                                                                                          |
| --- | ----------------------- | ----------- | ---- | --------------------------------------------------------------------------------------------- |
| R1  | Realtime p95 5초 미달   | P1 KPI 실패 | 중   | Phase 1.4 조기 구현으로 빨리 측정. 1분 fallback fetch 보험. Supabase 지역(ap-northeast) 확인. |
| R2  | RLS 우회 (데이터 누설)  | 보안        | 저   | service-role 사용처 최소화 (send_revisions + SSE만). RLS 통합 테스트 CI.                      |
| R3  | Supabase 비용 폭주      | 운영        | 저   | Realtime connections 모니터링. display_tokens 만료 cleanup. Phase 1 N=5이므로 위험 낮음.      |
| R4  | NextAuth 쿠키 공유 실패 | 인증 불가   | 중   | Phase 0.4에서 가장 먼저 검증 (P0.4-NextAuth). v5와 v4 secret 호환 테스트.                     |
| R5  | E5 SSE 연결 누수        | 서버 부하   | 저   | Vercel Edge streaming 자동 종료. token 만료 시 강제 disconnect. AbortController 패턴.         |

---

## 21. 부록 A: SQL 검증 쿼리 박제

### A1. Publication 멤버 확인

```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND schemaname = 'games'
ORDER BY tablename;
-- 기대: seasons, send_revisions, sends, sessions (4행)
```

### A2. RLS 정책 active 확인

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'games'
ORDER BY tablename;
-- 기대: 모든 행 rowsecurity = true (11행)
```

### A3. Cross-schema FK 존재 확인

```sql
SELECT
  tc.constraint_name,
  tc.table_schema || '.' || tc.table_name AS source,
  ccu.table_schema || '.' || ccu.table_name || '(' || ccu.column_name || ')' AS target,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc
  ON rc.constraint_name = tc.constraint_name
  AND rc.constraint_schema = tc.constraint_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.constraint_schema = tc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'games'
  AND ccu.table_schema = 'public'
ORDER BY source, tc.constraint_name;
-- 기대: 15개 FK (RESTRICT 또는 SET NULL)
```

### A4. send_revisions append-only 확인

```sql
SELECT polname, polcmd
FROM pg_policy
JOIN pg_class ON pg_policy.polrelid = pg_class.oid
WHERE relnamespace = 'games'::regnamespace
  AND relname = 'send_revisions'
ORDER BY polname;
-- 기대: send_revisions_no_update (UPDATE), send_revisions_no_delete (DELETE) with USING(false)
```

### A5. Partial UNIQUE indexes 확인

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'games'
  AND indexdef LIKE '%WHERE%'
ORDER BY indexname;
-- 기대: casual_open_one_per_day, seasons_one_active_per_crew, sends_ranked_first_send_only, setting_cycles_one_active_per_gym
```

---

## 22. 부록 B: design-handoff JSX → React+TS 포팅 규칙

| #   | 규칙                                                             | 예시                                                                                         |
| --- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | className 그대로 유지 (tokens.css 클래스 = globals.css로 이식됨) | `className="zz-card"` → 동일                                                                 |
| 2   | inline style의 CSS 변수 참조 그대로                              | `style={{ background: 'var(--accent-ranked)' }}` → 동일                                      |
| 3   | props 타입 추출 → interface로 선언                               | `function Avatar({ name, size })` → `interface AvatarProps { name: string; size?: number; }` |
| 4   | event handler 타입 명시                                          | `onClick` → `onClick?: React.MouseEventHandler<HTMLButtonElement>`                           |
| 5   | useState 패턴 그대로 (hooks 규칙 준수)                           | 동일                                                                                         |
| 6   | window.\* 전역 할당 제거                                         | `Object.assign(window, {...})` → export 변환                                                 |
| 7   | data-\* attribute 유지 (CSS selector 매칭)                       | `data-color={color}` → 동일                                                                  |
| 8   | SVG path는 별도 아이콘 컴포넌트 불필요 (inline 유지)             | BottomNav의 path d → 그대로                                                                  |
| 9   | 파일명 PascalCase                                                | `primitives.jsx` → `KindBadge.tsx`, `FAB.tsx`, ...                                           |
| 10  | 'use client' 디렉티브 추가 (이벤트 핸들러 포함 시)               | 파일 최상단                                                                                  |

---

## 23. 부록 C: 비-목표 재확인

아래는 Phase 1에서 **절대 구현하지 않는** 항목:

| 항목                       | 이유                                    | 재검토 시점 |
| -------------------------- | --------------------------------------- | ----------- |
| 클라이밍 외 종목           | PRINCIPLES 비-목표                      | Phase 3+    |
| IFSC 룰 엔진               | 비-목표                                 | Phase 3+    |
| 운영자 심사·영상 인증      | 양심제 우선 (P2)                        | Phase 3+    |
| 결제                       | 비-목표                                 | 미정        |
| 네이티브 앱                | PWA 우선                                | Phase 3+    |
| AI 영상 인식·AR            | 비-목표                                 | Phase 3+    |
| PWA 오프라인 큐 (E6)       | D12 reversal, dogfooding 데이터 후 결정 | Phase 2     |
| 점수 정책 marketplace      | viral 후보이나 Phase 1 불필요           | Phase 3     |
| 운영자 룰 기반 의심 패턴   | N 커진 후                               | Phase 3     |
| 크루 대항전 (crew_vs_crew) | 모델만 준비, UI 미구현                  | Phase 3     |
| 푸시 알림                  | Phase 2 web-push 인프라 연동            | Phase 2     |

---

> **이 문서의 유지 원칙**: 각 task commit 시 해당 ID를 커밋 메시지에 인용. Phase 완료 시 상태 업데이트는 하지 않음 (phase-{0,1}.md 체크리스트가 그 역할).
