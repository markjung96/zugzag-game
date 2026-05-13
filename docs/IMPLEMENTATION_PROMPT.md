# zugzag-game Implementation Kickoff Prompt

> **사용법**: 새 Claude Code 세션의 첫 메시지로 이 파일 전체를 붙여넣는다.
> `cat /Users/jeonghyeongseob/Desktop/MARK/zugzag-game/docs/IMPLEMENTATION_PROMPT.md` 후 복사.
>
> 이전 세션에서 완료된 것: CEO plan + 7-pass design review + Claude Design handoff bundle 검증.
> 이 프롬프트는 그 위에서 implementation을 시작한다.

---

# 0. 한 문장 요약 (모델 첫 인상)

**Korean climbing crew의 실시간 볼더링 랭크전 PWA를 zero에서 implement한다. 기획/디자인 이미 lock-in 완료 — 너는 (1) implementation 계획 → (2) 폴더 구조 + harness → (3) 설정 → (4) Phase별 구현 순서로 진행한다. 각 단계는 사용자 confirm 후 다음 단계로.**

---

# 1. 프로젝트 위치 + 핵심 파일

## 작업 디렉토리

```
/Users/jeonghyeongseob/Desktop/MARK/zugzag-game
```

현재 상태:

- git **미초기화** (Phase 0 첫 번째 작업 = `git init`)
- 코드 0줄
- `docs/` 6개 + 디자인 핸드오프만 존재

## 필수 read 파일 (시작 전 모두 read)

### 기획 SSOT (우선순위: 위 → 아래)

```
docs/PRINCIPLES.md         # 5개 원칙, Non-Goals, 의사결정 우선순위 (모든 결정의 기준)
docs/FEATURE_SPEC.md       # 기능/화면/API/DB 모델 (구현 SSOT)
docs/ROADMAP.md            # Phase 0~3 단계별 진행 + 완료 조건 + KPI (high-level)
docs/phases/phase-0.md     # ⭐ Phase 0 작업 단위 체크리스트 (2-2.5주 detail)
docs/phases/phase-1.md     # ⭐ Phase 1 MVP 체크리스트 (4-6주 detail, 1.1-1.6 + cherry-picks)
docs/phases/phase-2.md     # Phase 2 정기 대회/팀전 (4주)
docs/phases/phase-3.md     # Phase 3 멀티 크루 확장
docs/DB_SHARING.md         # zugzag(본체) ↔ games schema 공유 계약, RLS, Realtime publication
docs/DESIGN.md             # 디자인 토큰 SSOT (color/type/spacing/radius/motion/z-index)
docs/DESIGN_PROMPT.md      # 9 화면 텍스트 명세 (P1-P9, P10/P11/P12는 CLAUDE_DESIGN_PROMPT.md에)
docs/TODOS.md              # Phase 0/1 진입 전 명확화 항목 + 인프라 부채 + Skeptic 우려
docs/RUNBOOK.md            # ⭐ 운영 사고 시나리오 (T-I5 해결) — Phase 1 dogfooding 시 참조
docs/CLAUDE_DESIGN_PROMPT.md  # Claude Design용 입력 프롬프트 + 12 화면 spec + 17개 셀프체크
docs/README.md             # docs 인덱스 + 의사결정 우선순위
```

**중요**: `docs/phases/phase-N.md`는 ROADMAP을 작업 단위로 쪼갠 실제 체크리스트. Phase 진입 시 ROADMAP보다 이 파일을 메인으로 follow한다. `RUNBOOK.md`는 implement 단계엔 read-only 참조 (Phase 1 dogfooding 시작 후 실제 사용).

### 디자인 핸드오프 (Claude Design 결과)

```
design-handoff/zugzag-game/
├── README.md                              # "코딩 에이전트 먼저 읽어라" 가이드
├── chats/chat1.md                          # design assistant와의 대화 (intent의 근거)
└── project/
    ├── zugzag-game Design Phase 1.html    # entry launcher (React 18 UMD + Babel + 8 jsx)
    ├── tokens.css                          # CSS 변수 SSOT — implementation 시 그대로 globals.css로 이식
    ├── primitives.jsx                      # KindBadge / FAB / HoldChip / BottomNav / Avatar / Toast
    ├── design-canvas.jsx                   # 캔버스 시스템 (구현엔 불필요)
    ├── screens-mobile-1.jsx                # P3 SendModal 인터랙티브 + P2 ProblemBoard
    ├── screens-mobile-2.jsx                # P4 SeasonDetail + P5 GameHome state machine
    ├── screens-tv.jsx                      # P1 LiveBoard + P10 TVDisplay 9-state
    ├── screens-admin.jsx                   # P6 SeasonCreate + P7 QuickRanked + P8 TVToken
    ├── screens-extras.jsx                  # P9 AdminDashboard + P11 OG cards + P12 SharedLanding
    └── app.jsx                             # 캔버스 마운트 (구현엔 불필요)
```

### CEO Plan (전체 의사결정 근거)

```
~/.gstack/projects/zugzag-game/ceo-plans/2026-05-13-zugzag-game-phase-1.md
```

CEO plan에 들어 있는 것:

- 25 결정 (D1-D25) + 1 reversal (E6 Add→Defer)
- Cherry-picks E1-E8 중 ACCEPTED 7개 (E1/E2/E3/E4/E5/E7/E8) + DEFERRED 1개 (E6)
- Critic 1차 (4/10 REVISE → E6 거절) + Critic 2차 (6.5/10 REVISE → C-A/C-B/C-C 3 fix)
- Full Pivot (D19/D20): `sessions.kind` enum('ranked', 'casual_open'), 시즌 점수 = ranked sends만

---

# 2. 기존 컨텍스트 (이미 완료된 것)

## 2.1 CEO Plan (1-2 시간 워크플로우 결과)

- 4-mode review (SCOPE EXPANSION 모드 최종)
- 8개 cherry-pick 평가 → 7 ACCEPTED, 1 DEFERRED
- 2 critic round + 베이스라인 6개 docs 갱신
- VERDICT: CLEARED, eng review 권장 다음 단계

## 2.2 Design Review (7-pass, /plan-design-review 결과)

| Pass        | Before → After | 핵심 결정                                                                                                                 |
| ----------- | -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1 IA        | 6 → 9          | PWA 4탭 (Home/Board/Live/Me) + sticky FAB / P5 state machine hero / P5 4 empty branch / P7 bottom sheet / P9 KPI strip    |
| 2 States    | 3 → 9          | **P10 TVDisplayPage 9-state matrix 신설** / SendRecord error UX = inline retry toast / 모든 화면 empty/loading default    |
| 3 Journey   | 4 → 9          | **Casual/Ranked Badge primitive 도입 (CRITICAL)** / **P11 OG + P12 anonymous landing 신설** / P7 시작 시 TV URL 자동 발급 |
| 4 Slop      | 5 → 9          | P5 카드 dashboard 금지 / P7 어두운 긴장감 / P4 랭킹이 주인공 / 11개 blacklist + 4개 zugzag-specific 금지                  |
| 5 Tokens    | 2 → 9          | **DESIGN.md SSOT 신설** / Pretendard+Inter / 12-tier type scale                                                           |
| 6 Resp/A11y | 5 → 9          | viewport 표 / **아바타 default = 닉네임 이니셜 + 사진 opt-in (privacy)** / ARIA per-screen                                |
| 7 Decisions | n/a            | H3 score preview 4-state / H4 ceremony exit / H7 CSV 7-column lock / latecomer join / toast stacking                      |

Outside voices (양쪽 독립 도달한 합의):

- **CRITICAL** P5 = state machine, 카드 dashboard 금지
- **CRITICAL** Casual vs Ranked shared visual language (badge primitive)
- **CRITICAL** /tv/{token} 화면 9-state matrix
- **HIGH** E4 OG = 숫자 중심 포스터 (사진 위 텍스트 X)
- **HIGH** DESIGN.md token SSOT

## 2.3 Claude Design Handoff Bundle (검증 완주, 17/17 PASS)

12 화면 + 핵심 primitives 모두 구현됨:

- KindBadge (RANKED solid `#FF3B5C` / CASUAL outline)
- FAB (right bottom, accent.ranked, 56×56)
- HoldChip (60×60, white/black outline 분기)
- BottomNav 4탭 (Home/Board/Live/Me + Live 탭에 ranked dot)
- Avatar (default = initial+color, src 있을 때만 사진)
- Toast (max 3 stack, 3s, slidein 300ms)
- 인터랙티브 P3 SendModal (useState step 1→2→3, ranked/casual 분기)
- 인터랙티브 P5 GameHome (HOME_STATES 7개 hero variant)
- 인터랙티브 P7 QuickRankedSheet (form → success transform with QR)

미세 갭 (구현 단계에서 fix):

- P10 `between-sessions` state: archived season leaderboard fallback로 처리
- P10 `error generic` state: TVExpired로 흡수됨, 명시적 분기 필요 시 추가

---

# 3. 기술 스택 (CEO plan + ROADMAP에서 lock-in)

```
Framework      : Next.js 16 (App Router)
Language       : TypeScript (strict)
DB             : PostgreSQL via Supabase (zugzag 본체와 같은 프로젝트, schema 분리)
ORM            : Drizzle (schemaFilter: ['games'])
Realtime       : Supabase Postgres Changes (publication: games.sends/send_revisions/sessions/seasons)
Auth           : zugzag 본체 NextAuth 세션 공유 (.zugzag.com 쿠키 도메인)
Styling        : Tailwind CSS + globals.css (tokens.css 이식)
Validation     : zod
Image          : @vercel/og (E4 OG cards)
Deploy         : Vercel (Edge Functions for SSE proxy)
Domain         : games.zugzag.com
Package mgr    : pnpm
Test           : Vitest (unit) + Playwright (e2e, 우선순위 P2)
```

DB 권한 (운영):

- `zugzag_game` 별도 user — `public.*` SELECT만, `games.*` 전체
- 본체 마이그레이션: zugzag 레포에서만 (`public.*`)
- 본체 미러 schema: 6 테이블 (users / crews / crew_members / gyms / provider_colors / pass_providers)

---

# 4. 너의 작업 순서 (이 순서 그대로)

## Step 0: Pre-flight (15분)

1. 위 §1의 핵심 파일 모두 read (병렬, multi-tool single message)
   - 필수: PRINCIPLES, FEATURE_SPEC, ROADMAP, phases/phase-0, phases/phase-1, DB_SHARING, DESIGN, DESIGN_PROMPT, TODOS, CLAUDE_DESIGN_PROMPT, RUNBOOK
   - phases/phase-2/3은 skim 가능 (먼 미래)
2. `design-handoff/zugzag-game/chats/chat1.md` read (design intent의 근거)
3. `design-handoff/zugzag-game/project/` 전체 read (tokens.css + primitives.jsx + 5 screens-\*.jsx)
4. CEO plan read (`~/.gstack/projects/zugzag-game/ceo-plans/2026-05-13-zugzag-game-phase-1.md`)
5. 현재 작업 디렉토리 상태 (`ls -la`, `git status`)
6. Pre-flight 보고:
   - read 한 파일 표 (체크리스트)
   - 부족/모호한 점 (있으면)
   - Step 1로 진입 confirm 요청

## Step 1: Implementation Plan 작성 (사용자 confirm 후 Step 2)

CEO plan + ROADMAP + Design handoff를 종합해서 implementation plan 작성. 출력 위치:

```
docs/IMPLEMENTATION_PLAN.md
```

포함 내용:

- **폴더 구조** (Next.js 16 App Router + Drizzle + Supabase 권장 구조)
- **하네스 (harness)**: package.json scripts, tsconfig, eslint, prettier, husky pre-commit, biome 또는 eslint+prettier 결정
- **환경 변수 템플릿** (.env.example)
- **Drizzle config** (`drizzle.config.ts` + schemaFilter)
- **Phase 0 task breakdown** (`docs/phases/phase-0.md` 그대로 + design handoff에서 추출한 토큰/프리미티브 이식 항목 추가)
- **Phase 1 task breakdown** (`docs/phases/phase-1.md` 그대로 + 각 task에 design handoff JSX 매핑)
- **각 task의 verification** (어떻게 "done" 판단할지, test/manual)
- **의존성 그래프** (예: RLS 정책 sql → mirror schema → Drizzle 마이그레이션 → API → UI)
- **risk 표 + 완화 plan**

이 plan을 사용자에게 보여주고 confirm 받은 후 Step 2.

## Step 2: 폴더 구조 + Harness Setup (사용자 confirm 후 Step 3)

```
zugzag-game/
├── docs/                            # 이미 존재 (read-only, planning artifacts)
├── design-handoff/                  # 이미 존재 (read-only, design reference)
├── src/
│   ├── app/                         # Next.js 16 App Router
│   │   ├── (game)/                  # 인증 후 라우트 그룹
│   │   │   ├── c/[crew]/...
│   │   │   └── ...
│   │   ├── tv/[token]/page.tsx      # P10 인증 우회 라우트
│   │   ├── shared/seasons/[id]/page.tsx  # P12 비인증 landing
│   │   ├── api/                     # Route Handlers
│   │   ├── og/                      # @vercel/og endpoints (E4)
│   │   ├── globals.css              # tokens.css 이식
│   │   └── layout.tsx
│   ├── components/
│   │   ├── primitives/              # KindBadge / FAB / HoldChip / BottomNav / Avatar / Toast
│   │   ├── screens/                 # 12 화면 React 컴포넌트
│   │   └── ui/                      # shadcn 또는 자체
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema/
│   │   │   │   ├── games/           # games.* 자체 스키마
│   │   │   │   └── shared/          # public.* 미러 (read-only 헤더)
│   │   │   ├── client.ts
│   │   │   └── seed.ts
│   │   ├── auth/                    # NextAuth share helper
│   │   ├── realtime/                # Supabase Realtime client
│   │   ├── sse/                     # E5 SSE proxy (Vercel Edge)
│   │   ├── og/                      # @vercel/og helpers (E4)
│   │   └── validation/              # zod schemas
│   └── types/
├── db/
│   └── setup/                       # Supabase 대시보드 수동 SQL (D17)
│       ├── 001_create_schema.sql
│       ├── 002_create_user.sql
│       ├── 003_publication.sql
│       └── 004_rls_policies.sql
├── drizzle/                         # Drizzle 마이그레이션 (auto-gen)
├── public/                          # PWA manifest, icons
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.example
├── .gitignore
├── biome.json (또는 .eslintrc + .prettierrc)
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tailwind.config.ts               # tokens 이식
├── README.md                        # 프로젝트 개요 + 개발 시작 가이드
└── CLAUDE.md                        # 프로젝트 routing rules + 본 컨텍스트 요약
```

작업:

1. `git init` + `.gitignore` (Next.js + macOS + 환경변수)
2. `pnpm init` + Next.js 16 install (`pnpm create next-app@latest --typescript --tailwind --app`)
3. Drizzle install + config
4. Supabase client install
5. NextAuth install + zugzag 본체 share helper
6. Linter/formatter 결정 (biome 또는 eslint+prettier+husky)
7. tokens.css 이식 → globals.css + tailwind.config의 theme.extend (CSS 변수 → Tailwind 토큰 매핑 표 만들기)
8. CLAUDE.md 작성 (프로젝트 routing rules + memory)
9. README.md 작성 (개발자 onboarding, "처음 받았으면 이렇게")
10. **첫 git commit**: `chore: bootstrap Next.js 16 + Drizzle + Supabase scaffold`

각 작업 완료마다 git commit (small atomic commits). 사용자에게 "Step 2 완료, Step 3로 진입할까?" confirm.

## Step 3: 외부 설정 (사용자 작업 + 너의 가이드)

너는 직접 못 함 — 사용자가 손으로:

1. Supabase 대시보드 → SQL editor에서 `db/setup/*.sql` 순서대로 실행 (D17 결정)
2. Supabase 대시보드 → Database → Replication → publication에 4 테이블 추가
3. `.env.local` 작성 (`.env.example` 참조)
4. zugzag 본체 토큰 스냅샷 + DESIGN.md §11에 매핑 표 작성 (T-I8: NextAuth + Supabase RLS 패턴 D14)
5. Vercel 프로젝트 생성 + `games.zugzag.com` 서브도메인 연결

너는: 각 단계 가이드 (정확한 SQL/명령어/UI 클릭 순서 + 검증 방법) + 사용자가 막히면 디버그.

이 단계 끝나면: `pnpm dev` → `localhost:3000` 진입 시 zugzag 로그인 세션으로 빈 게임 홈 표시 (ROADMAP Phase 0 완료 조건).

## Step 4: Phase 0 implementation 마무리 (1-2일)

ROADMAP Phase 0 체크리스트 항목 + Design handoff 토큰/프리미티브 이식 완료:

- [ ] Drizzle schema 9 개 (`games.seasons` / scoring_policies / setting_cycles / walls / problems / sessions / session_teams / session_participants / sends / send_revisions / display_tokens) 정의
- [ ] Mirror schema 6 개 (`public.*` read-only 헤더)
- [ ] RLS 정책 raw SQL (T5 send_revisions service-only INSERT + display_tokens)
- [ ] tokens.css 이식 검증 (Tailwind class 작동 확인)
- [ ] primitives 6개 React 컴포넌트로 변환 (KindBadge / FAB / HoldChip / BottomNav / Avatar / Toast) — design-handoff JSX를 React+TypeScript로 1:1 포팅
- [ ] T-MS1 casual_open close 트리거 (Phase 0 첫주 작업)
- [ ] T-M1 timezone (`Asia/Seoul` 명시)
- [ ] T-M2 close race 핸들링 (POST /api/sends에 cached session_id + 409 분기)
- [ ] T-I7 cross-schema FK 정책 (RESTRICT)
- [ ] T-I8 NextAuth + RLS 연결 패턴 (zugzag 본체 follow)
- [ ] CI: type-check + lint (GitHub Actions)

## Step 5+: Phase 1 implementation (4-6주)

ROADMAP Phase 1 §1.1-1.6 + cherry-picks E1-E5/E7/E8 순서대로 구현. 각 sub-section 완료 후 사용자 confirm + git commit.

권장 순서 (의존성 minimal first):

1. **§1.1 도메인 모델** — Drizzle schema + 시드
2. **§1.4 LiveBoard** — P1 mock data → Realtime 구독 → 5초 KPI 측정 (제품의 얼굴, 빨리 검증)
3. **§1.3 멤버 화면 핵심** — P5 GameHome state machine + P3 SendModal 3탭 + P2 ProblemBoard
4. **§1.2 운영 화면** — P6 SeasonCreate + P4 SeasonDetail
5. **§1.5 운영 안전망** — RLS 통합 테스트 + send_revisions append-only 검증 + Rate limit
6. **§1.6 Cherry-picks** — E1 (LocalStorage prefill) → E2 (점수 프리뷰 4-state) → E3 (활성도 카운터) → E5 (display_tokens + SSE proxy + P10 9-state) → E7 (P9 admin dashboard) → E4 (P11 OG + P12 landing) → E8 (시즌 의식 카드)

**각 화면 구현 시 반드시**:

- design-handoff JSX 해당 컴포넌트 read → 1:1 React+TypeScript 포팅 (className → Tailwind class 매핑, useState 그대로)
- API endpoint 설계 (FEATURE_SPEC §5/§6 참조)
- zod 검증 스키마
- RLS 동작 테스트 (다른 크루 데이터 누설 차단 확인)
- 단위 테스트 (Vitest)

---

# 5. 의사결정 우선순위 (모든 trade-off에서 적용)

```
PRINCIPLES > FEATURE_SPEC > ROADMAP > DB_SHARING
(상위 문서가 하위 문서를 이긴다)

라이브 경험 > 데이터 정확성 > 운영 편의 > 시각적 화려함
```

trade-off 발생 시 위 우선순위로 결정. 모호하면 사용자에게 AskUserQuestion. 단순 fix/명확한 결정은 inline 진행.

---

# 6. 사용자 선호 (지난 세션 학습)

## 톤 / 응답 형식

- **한국어 응답** (영문 기술 용어는 OK, 일반 설명은 한국어)
- **terse + concrete** (장황한 설명 X, 결정/숫자/파일 path 포함)
- **markdown 표 + 코드 블록 적극 활용**
- **emoji 피하기** (사용자가 명시 요청한 경우만)
- **결정 + WHY**: 단순 옵션 나열 X, "권장: A 이유: ..." 형식
- 각 답변 끝에 1-2 문장 summary

## 작업 진행

- **작업 단위 commit** — 큰 PR 회피, atomic commit (사용자 git workflow 시작 시 명시)
- **AskUserQuestion 신중히** — 자명 fix는 inline 박고, 의미 있는 alternative만 묻기
- **진행 보고는 짧게** — "Step X 완료, Y로 진입?" 정도
- **검증 후 보고** — "구현했다"가 아니라 "구현 + 검증 결과 + 다음"
- **AskUserQuestion 호출 시 옵션마다 ✅/❌ 줄 X** — 한 줄 description으로 충분 (이전 세션 사용자 reject 경험)

## Tool 사용

- **병렬 실행 적극** — 독립 작업 multiple tool call 한 메시지에
- **Background tool** — 빌드/install 등 long-running은 `run_in_background`
- **Read tool 병렬** — 파일 여러 개 동시
- **TaskCreate/TaskUpdate** — 3+ step 작업에 자동 사용
- **Bash 자제** — Read/Edit/Write 우선 (cat/sed/echo 회피)

## 사용자 환경

- macOS (Darwin 25.2.0), zsh
- Node 20 (nvm), pnpm
- Cursor + Claude Code
- Korean dev (한국어 변수명/주석 OK if 의미 명확)

---

# 7. 시작 시 너가 해야 할 것 (정확한 첫 응답)

이 프롬프트 받으면 다음 순서로 정확히 진행:

```
1. 사용자 인사 1줄 ("Implementation 시작합니다. 먼저 컨텍스트 read 후 plan 작성.")
2. Step 0 Pre-flight 즉시 시작:
   - 모든 핵심 파일 병렬 read (docs/* 8개 + design-handoff README + chats + tokens.css + primitives.jsx)
   - CEO plan read
   - 현재 디렉토리 상태 (ls + git status)
3. Pre-flight 보고:
   - "이걸 read 했다" 표
   - "이게 부족하다 / 모호하다" 항목 (있으면)
4. Step 1로 진입 confirm 요청:
   - "다음: docs/IMPLEMENTATION_PLAN.md 작성. 진행해도 돼?"
5. 사용자 confirm → IMPLEMENTATION_PLAN.md 작성 → 사용자 확인
6. Step 2 (폴더 구조 + harness) 작업 → atomic commit
7. Step 3 (외부 설정 가이드)
8. Step 4 (Phase 0 마무리)
9. Step 5+ (Phase 1)
```

**절대 하지 말 것**:

- Step 0 skip 하고 바로 코드 작성
- 사용자 confirm 없이 다음 Step 진입
- design handoff JSX의 시각적 결정 임의 변경 (사용자가 명시 요청 시만)
- DESIGN.md 토큰을 임의 추가/변경 (P4 원칙: zugzag 본체 follow)
- `git add -A` (atomic commit, 명시적 staging)
- Test skip / type 에러 무시

---

# 8. 이전 세션 산출물 인덱스 (참조용)

| 파일                                                                         | 역할                                                                                                        |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `docs/PRINCIPLES.md`                                                         | 5원칙, Non-Goals, 의사결정 우선순위                                                                         |
| `docs/FEATURE_SPEC.md`                                                       | 기능/화면/API/DB/규칙/시나리오 SSOT                                                                         |
| `docs/ROADMAP.md`                                                            | Phase 0~3 + KPI (high-level)                                                                                |
| `docs/phases/phase-0.md`                                                     | Phase 0 작업 단위 체크리스트 (2-2.5주)                                                                      |
| `docs/phases/phase-1.md`                                                     | Phase 1 MVP 체크리스트 (4-6주, 1.1-1.6 + cherry-picks 7개)                                                  |
| `docs/phases/phase-2.md`                                                     | Phase 2 정기 대회/팀전 (4주)                                                                                |
| `docs/phases/phase-3.md`                                                     | Phase 3 멀티 크루 확장                                                                                      |
| `docs/DB_SHARING.md`                                                         | zugzag↔game DB 공유 계약                                                                                    |
| `docs/DESIGN.md`                                                             | 토큰 SSOT (color/type/spacing/radius/motion/z-index + Session Kind Badge primitive + zugzag 본체 매핑 슬롯) |
| `docs/DESIGN_PROMPT.md`                                                      | 9 화면 텍스트 명세 (P1-P9)                                                                                  |
| `docs/TODOS.md`                                                              | Phase 0/1 명확화 + 인프라 부채 + Skeptic 우려 + 접근성                                                      |
| `docs/RUNBOOK.md`                                                            | 운영 사고 시나리오 (T-I5 해결) — Phase 1 dogfooding 참조                                                    |
| `docs/CLAUDE_DESIGN_PROMPT.md`                                               | Claude Design 입력 프롬프트 + 12 화면 spec + 17개 셀프체크                                                  |
| `docs/IMPLEMENTATION_PROMPT.md`                                              | (이 파일) 새 세션 kickoff 프롬프트                                                                          |
| `docs/README.md`                                                             | docs 인덱스 + 의사결정 우선순위                                                                             |
| `~/.gstack/projects/zugzag-game/ceo-plans/2026-05-13-zugzag-game-phase-1.md` | CEO Plan (D1-D25 + Critic 2회 + Completion Summary)                                                         |
| `design-handoff/zugzag-game/` (11 파일)                                      | Claude Design handoff bundle (검증 17/17 PASS)                                                              |

---

# 9. 자주 참조할 결정 표 (빠른 lookup)

## Cherry-picks (CEO plan)

| ID  | 무엇                                                            | Phase                | 영향 화면                      |
| --- | --------------------------------------------------------------- | -------------------- | ------------------------------ |
| E1  | SendModal 자동선택 (LocalStorage prefill)                       | 1                    | P3                             |
| E2  | 점수 변동 프리뷰 4-state (confident/tentative/stale/suppressed) | 1                    | P3                             |
| E3  | "이번 시즌 누적 N건" 카운터 (ranked만)                          | 1                    | P1, P5                         |
| E4  | 시즌 종료 OG 이미지 2종 (`@vercel/og`)                          | 1                    | P11, P12 신설                  |
| E5  | display_tokens + SSE proxy + /tv/{token}                        | 1                    | P8, P10 신설                   |
| E6  | PWA 오프라인 send 큐잉                                          | **DEFERRED Phase 2** | (Phase 1 = inline retry toast) |
| E7  | raw 데이터 운영자 대시보드 (sparkline + CSV)                    | 1                    | P9                             |
| E8  | 시즌 시작/종료 풀스크린 의식 카드 (TV)                          | 1                    | P10 ceremony state             |

## CRITICAL fixes (Critic 2차)

- **C-A**: `sends.session_kind` denormalized + partial UNIQUE WHERE session_kind='ranked'
- **C-B**: `casual_open_one_per_day` partial UNIQUE + INSERT ON CONFLICT DO NOTHING
- **C-C**: publication 그대로 + 클라이언트 `kind='ranked'` 필터링

## TODO 우선순위 (Phase 0/1 진입 전)

P1 (Phase 0 필수):

- T-M1 timezone Asia/Seoul
- T-M2 close race 409 분기
- T-MS1 casual_open close 트리거
- T-I7 cross-schema FK RESTRICT
- T-I8 NextAuth + RLS 연결 패턴

P2 (Phase 1):

- T-M4 E2 casual mode UX
- T-M5 E4 OG ranked-vs-casual 의도 확정
- T-MS2 TV token scope (해결: P7 시작 시 자동 발급, scope=session)
- T-MS4 session_participants와 casual_open

## 디자인 결정 (구현 시 반드시 반영)

- **Avatar default**: 닉네임 이니셜 + crew color, 사진은 user opt-in (settings)
- **Session Kind Badge**: P3 Step 3 / P1 leaderboard / P5 피드 / P9 / P10 모두 일관
- **P3 casual mode**: 점수 프리뷰 X, 대신 "기록만 남아요 — 시즌 점수에 미반영"
- **P5 hero**: 7 state machine (live_joined / live_not_joined / leader_idle / member_idle / empty_member / no_season_leader / loading)
- **P7 TV 옵션**: default ON, 시작 시 같은 모달이 transform → QR 표시
- **/tv/{token}**: 9 state matrix (live / loading / empty / reconnecting / pre-session / ceremony / between-sessions / expired / revoked / no-data / error)
- **OG cards**: 숫자 중심 포스터, 사진 X, gradient + 데이터 텍스트만

---

# 10. 최종 — 너가 명심할 것

1. **Don't recreate, port** — design handoff JSX는 reference 디자인. 1:1로 React+TS 포팅하되, 시각/인터랙션 결정은 그대로 보존. 임의 변경 금지.
2. **TypeScript strict** — `any` 금지, zod로 런타임 검증.
3. **RLS first** — DB 권한 + RLS 정책 raw SQL 먼저, 그 다음 ORM, 그 다음 API.
4. **Atomic commits** — 작업 단위로 commit, 메시지는 conventional commits.
5. **Korean UI strict** — 모든 user-facing 한국어 (label-sm 영문 wordmark만 의도적 영문).
6. **사용자 confirm gate** — Step 0/1/2/3/4/5+ 사이마다 사용자 확인 후 진입.
7. **검증 보고** — "구현했다" 단독 보고 X. "구현 + 어떻게 검증함 + 결과 + 다음" 4-line 보고.
8. **CEO plan + ROADMAP + Design handoff = SSOT**. 충돌 시 §5 우선순위로 결정.

---

# 시작!

위 9 단계 정확히 따라 Step 0 Pre-flight 부터 시작하라.

**첫 메시지**: "Implementation 시작합니다. 컨텍스트 read 후 plan 작성하겠습니다." → 즉시 병렬 read.
