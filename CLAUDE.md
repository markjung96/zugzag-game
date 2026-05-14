@AGENTS.md

# CLAUDE.md — zugzag-game

> 새 agent가 들어왔을 때 **30초 컨텍스트 흡수**가 목표. 이 파일은 인덱스 + 핵심 결정 highlight + 코딩 규칙만. 세부는 `docs/`에 위임. Next.js 16 specific 가이드는 `AGENTS.md` (자동 import).

---

## 1. 정체성 (한 줄)

클라이밍 크루용 **실시간 볼더링 랭크전** Next.js 앱. zugzag 본체와 **같은 Supabase 프로젝트 DB**를 공유하되 `games.*` schema 분리. URL `games.zugzag.com`. 현 단계: **Phase 0 완료, Phase 1 진입 준비**.

---

## 2. 진실 source (이 순서대로)

| #   | 파일                                                                         | 역할                                                |
| --- | ---------------------------------------------------------------------------- | --------------------------------------------------- |
| 0   | **`PLAN.md`**                                                                | **실행 SSOT — Phase 0.4→1 task ID/의존/검증 한 곳** |
| 1   | `docs/PRINCIPLES.md`                                                         | 5원칙 + 비-목표 (최상위)                            |
| 2   | `docs/FEATURE_SPEC.md`                                                       | 화면/API/DB/규칙 SSOT (v0.2 Full Pivot)             |
| 3   | `docs/ROADMAP.md` + `docs/phases/phase-{0..3}.md`                            | Phase별 체크리스트                                  |
| 4   | `docs/DB_SHARING.md`                                                         | DB 공유 계약 (publication, RLS, append-only)        |
| 5   | `docs/DESIGN_PROMPT.md`                                                      | UI 톤 + 9개 화면 시안                               |
| 6   | `docs/TODOS.md`                                                              | MAJOR/Missing/인프라/Skeptic 우려                   |
| 7   | `docs/RUNBOOK.md`                                                            | 운영 시나리오 3종                                   |
| 8   | `~/.gstack/projects/zugzag-game/ceo-plans/2026-05-13-zugzag-game-phase-1.md` | 25개 결정 + Full Pivot archive                      |

**의사결정 우선순위**: `PRINCIPLES > FEATURE_SPEC > ROADMAP > DB_SHARING`.

---

## 3. 핵심 결정 highlight

### 모델 — Full Pivot (D19~D25)

- `sessions.kind = 'ranked' | 'casual_open'` (LoL 일반/랭크 분리)
- `sends.session_id NOT NULL` + `sends.session_kind` denormalized
- **시즌 점수 = ranked sends만 합산** (`PARTIAL UNIQUE (user, problem, season) WHERE cancelled_at IS NULL AND session_kind='ranked'`)
- **casual_open = 1 per crew per day** (`UNIQUE INDEX ON (crew_id, starts_at::date) WHERE kind='casual_open' AND status!='closed'` + `INSERT ... ON CONFLICT DO NOTHING`)
- **ranked = 무제한**

### 차별화 + 구현

- 1순위 = **P1 라이브 보드 즉시성** (완등 → 보드 p95 5초)
- 별도 Next.js 앱 + 같은 Supabase 프로젝트 + `games.*` schema 분리 (**`public.*` ALTER 절대 금지**)
- TV 모드 (E5) = `games.display_tokens` + **SSE Proxy** (Vercel Edge streaming, p99 1-2초)
- 인증 = NextAuth `.zugzag.com` 쿠키 공유 (zugzag 본체 패턴 follow, D14)

### Phase 1 Cherry-picks

- ✅ E1(자동선택) E2(점수 프리뷰) E3(누적 카운터) E4(시즌 OG) E5(TV 토큰+SSE) E7(sparkline+CSV) E8(의식 카드)
- ❌ **E6 PWA 오프라인 큐 = DEFERRED** (D12 reversal, Phase 2 재검토)

### Realtime publication

- ✅ `games.sends`, `games.send_revisions`, `games.sessions`, `games.seasons`
- ❌ `games.display_tokens`, `games.problems`, `games.scoring_policies`, `public.*` 전체

### send_revisions append-only

- service-role only INSERT (앱 `zugzag_game` 롤은 INSERT 권한 없음)
- RLS UPDATE/DELETE `USING (false)` — 이력 보존 강제

### Phase 0 setup

- Supabase 대시보드 수동 SQL + repo `db/setup/*.sql` 고정 (D17)
- `pnpm` + Next.js 16 App Router + Drizzle (`schemaFilter: ['games']`)

---

## 4. 코딩 규칙 (CEO Plan §5)

1. **Route Handlers 패턴** — `app/api/*/route.ts`. Server Actions는 form-only.
2. **zod 통일** — 모든 API 입력은 zod schema. 공유 스키마는 `src/lib/schemas/`.
3. **Custom GameError 계층** — `GameError` 베이스 + `RLSError`/`PolicyError`/`RateLimitError`. Route Handler에서 status code 매핑.
4. **jsonb branded type** — `scoring_policies.color_scores`는 `type ColorScores = Brand<jsonb, 'ColorScores'>`. zod parse 통과해야만 cast.
5. **MIME server-side double check** — 사진 업로드는 client MIME 신뢰 X. Buffer magic bytes 확인 (T9).
6. **ESLint complexity 8** 임계.
7. **Asia/Seoul timezone 일관** — `now() AT TIME ZONE 'Asia/Seoul'` (casual_open 자정 cutover, T-M1).

---

## 5. 작업 체크리스트

기능 추가 요청을 받으면:

1. `PRINCIPLES` 5원칙 + Non-Goals 위배 없는지
2. `FEATURE_SPEC`의 기존 모델/API 충돌 없는지
3. `ROADMAP`의 현 Phase 정의에 부합하는지
4. `DB_SHARING`의 schema/RLS/publication을 깨지 않는지
5. `TODOS.md`에 이미 deferred 된 항목인지 (E6, AR, 룰 카드 등)

코드 작성 전 STOP 조건:

- `public.*` ALTER 시도 → zugzag 본체 레포로
- `games.sends` INSERT에 `session_id` 누락 → 모든 send는 session에 묶임
- `send_revisions` 직접 INSERT를 일반 role로 → service-role client만
- Realtime 구독 추가 시 publication 표 미확인

---

## 6. 비-목표

❌ 클라이밍 외 종목 / IFSC 룰 / 운영자 심사·영상 인증 / 결제 / 네이티브 앱 / AI 영상 인식·AR (Phase 3+ 검토)

---

## 7. 하위 CLAUDE.md 인덱스

각 폴더의 `CLAUDE.md`는 해당 디렉토리의 역할·패턴·주의사항을 담는다. 에이전트는 루트 → 하위 순서로 컨텍스트를 로딩한다.

| 경로                       | 역할                                                 |
| -------------------------- | ---------------------------------------------------- |
| `src/app/CLAUDE.md`        | 라우트 그룹 구조, layout 계층, API route 규칙        |
| `src/components/CLAUDE.md` | primitives/screens/ui 분류 기준, 네이밍 컨벤션       |
| `src/lib/CLAUDE.md`        | db/auth/supabase/validation/errors 역할, import 규칙 |
| `src/hooks/CLAUDE.md`      | hook 네이밍, realtime 구독 패턴                      |
| `src/types/CLAUDE.md`      | branded type, ColorScores, 공유 타입 규칙            |
| `tests/CLAUDE.md`          | Vitest/Playwright 구분, 테스트 네이밍, fixture 규칙  |
| `db/CLAUDE.md`             | SQL 파일 순서, Supabase 수동 실행 절차               |
| `design-handoff/CLAUDE.md` | read-only 참조, JSX→React+TS 포팅 규칙 요약          |

---

## 8. 다음 단계

현재 Phase: **Phase 1.4 코드 완료 → KPI 측정 + Phase 1.3/1.2 진입 준비** — 상세 task는 `PLAN.md` §15-16 참조.

Phase 0.4 완료 산출물:

- Prettier + Husky + lint-staged + GitHub Actions CI
- tokens.css → globals.css + Tailwind 4 @theme 이식
- NextAuth v5 + middleware + Supabase client (anon/service)
- GameError 계층 (6 class) + Vitest 테스트 8개 pass
- 폴더 scaffold + 8개 폴더별 CLAUDE.md

Phase 1.1 완료 산출물:

- zod 스키마 9개 + barrel (`src/lib/validation/*.ts`) — 모든 API 입력 검증 SSOT
- scoring policy 기본 템플릿 상수 (`src/lib/policies/default-template.ts` — 점수 권장값 + 한/영 라벨 aliases; P1.2-PolicyCRUD UI에서 import)
- `scoring_policies (crew_id, name)` UNIQUE migration 0002 (race-safe) — Supabase 적용 완료
- ColorScores SSOT 통일 (`games.ts` 3-필드 객체로 일원화, `src/types/index.ts` re-export)
- Integration 테스트 setup + partial UNIQUE + cross-schema 조인 (`tests/integration/*`)
- POSTGRES_URL_ADMIN 보안 가드 (integration test 전용. ESLint no-restricted-syntax 3종)
- vitest projects 분리 (unit / integration) + design-handoff/ ESLint ignore
- 27 unit tests pass / type-check + lint + format 모두 green

> **컨셉 변경**: 초기 plan의 "기본 점수 정책 seed"는 폐기. Scoring policy는 시스템 invariant가 아니라 운영자 자율 룰북 — P1.2-PolicyCRUD admin UI에서 생성. 기본값은 `src/lib/policies/default-template.ts` 상수 import로 처리.

Phase 1.4 완료 산출물 (코드):

- **NextAuth → Supabase JWT broker** (`src/lib/auth/config.ts` + `src/types/next-auth.d.ts`) — `jose` HS256 서명, 1h 만료, 5분 전 자동 갱신. `SUPABASE_JWT_SECRET` 환경변수 추가.
- **Supabase client 토큰 주입** — server: `createServerClient(accessToken)` Authorization 헤더 주입 / browser: `createBrowserClient(getToken)` accessToken callback + Realtime 자동 갱신.
- **Realtime hook** (`src/lib/realtime/useRealtimeSends.ts` + `schemas.ts`) — `games.sends` INSERT/UPDATE 구독 + zod payload 검증 + 채널 상태 노출.
- **LiveBoardPage / LiveSessionBoardPage** (`src/app/(auth)/c/[crew]/live/`, `src/app/(auth)/c/[crew]/sessions/[id]/live/`) — initial SSR rankings + Realtime patch + connected 시 race-window refetch + 60s fallback polling + "방금 풀이" Toast 3s.
- **Ranking API + query helper** (`src/app/api/{seasons,sessions}/[id]/rankings/route.ts`, `src/lib/db/queries/rankings.ts`) — RPC `get_season_rankings` 우선, 실패 시 raw 쿼리 fallback. ranked sends만 시즌 합산.
- **Primitives**: BottomNav / KindBadge / Avatar / Toast.
- **e2e KPI**: `tests/e2e/live-kpi.spec.ts` (100 INSERT 시퀀셜, NTP offset 보정 후 p95 < 4500ms 단언) + `live-board.spec.ts` + `tests/helpers/admin-pg.ts`. `playwright.config.ts`에 CI 빌드 모드 + globalTeardown 추가.
- `tests/unit/realtime-schemas.test.ts` 추가.
- typecheck + lint + unit test 모두 green.

⏳ 사용자 액션 필요:

1. `.env.local`에 `SUPABASE_JWT_SECRET` 추가 (Supabase Dashboard → API Settings → JWT Secret 복사).
2. e2e fixture row 생성: Supabase SQL Editor 또는 `tests/helpers/admin-pg.ts` 활용. ID들을 `.env.local`의 `SEED_TEST_*`에 복사.
3. `pnpm test:kpi` 실행 → p95 5초 반영 KPI 측정 결과 확인. 통과 못하면 R# 회귀 핸들링.
4. (선택) `pnpm test:integration` — POSTGRES_URL_ADMIN 이미 .env.local에 추가됨.

다음: Phase 1.3 (멤버 화면, SendModal/ProblemBoard) → Phase 1.2 (운영자 + PolicyCRUD가 기본 정책 생성 UI 담당) → Phase 1.5/1.6.
