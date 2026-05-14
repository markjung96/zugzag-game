# Phase 1 — MVP (4~6주, 우리 크루 dogfooding)

> **완료 조건**: 우리 크루 멤버 N명이 한 시즌 동안 실제로 라이브 보드 보면서 풀이 기록을 쌓는다.

자세한 화면/API/규칙은 `docs/FEATURE_SPEC.md` 참조. 이 파일은 작업 단위 체크리스트.

---

## 1.1 도메인 모델 + 검증 박제 ✅ 완료

> **컨셉 변경**: scoring policy seed는 폐기. Policy는 시스템 invariant가 아니라 운영자 자율 룰북 — P1.2-PolicyCRUD admin UI에서 생성. 기본값은 `src/lib/policies/default-template.ts` 상수로 보관.

- [x] `games.*` schema 마이그레이션 (Phase 0.3 완료)
- [x] **zod 스키마 공유 모듈** (`src/lib/validation/*` 9파일 + barrel + 27 unit tests)
- [x] **scoring policy 기본 템플릿 상수** (`src/lib/policies/default-template.ts` — FEATURE_SPEC §3.1 점수 + 한/영 라벨 aliases. P1.2-PolicyCRUD가 import)
- [x] **`scoring_policies (crew_id, name)` UNIQUE migration 0002** (race-safe idempotency. Supabase SQL Editor 적용 완료)
- [x] **partial UNIQUE 통합 테스트** (`tests/integration/partial-unique.test.ts` — ranked first_send_only 23505 + ON CONFLICT DO NOTHING, casual_open 1/day)
- [x] **cross-schema 조인 통합 테스트** (`tests/integration/cross-schema-join.test.ts` — sends↔users, sessions↔crews)
- [x] **POSTGRES_URL_ADMIN 가드** (integration test 전용. .env.example + ESLint no-restricted-syntax dot/bracket/destructure 3종)
- [x] **04-cross-schema-fks.sql 주석 정정** (15 → 16)
- [x] ~~기본 점수 정책 seed~~ → 폐기 (P1.2-PolicyCRUD 이관)

## 1.2 운영자 화면 (leader/admin)

- [ ] SeasonCreatePage / SeasonEditPage / SeasonListPage (FEATURE_SPEC §2, DESIGN_PROMPT P6)
- [ ] PolicyCreatePage — provider별 색-점수 매핑 에디터 (FEATURE_SPEC §3)
- [ ] SettingCycleManagePage — 회차 시작/종료
- [ ] WallManagePage — 벽 등록/정렬
- [ ] ProblemQuickAddPage — **30초 등록 UX** (벽→색→번호+1→사진)
- [ ] QuickRankedSessionPage — "즉석 랭크전 열기" (DESIGN_PROMPT P7)
- [ ] TVTokenGeneratePage — display token 발급 + QR + revoke (DESIGN_PROMPT P8)

## 1.3 멤버 화면 (모든 사용자)

- [ ] GameHomePage — 시즌 요약 + ranked 세션 카드 + 빠른 액션 + 최근 활동 (DESIGN_PROMPT P5)
- [ ] ProblemBoardPage — 벽 × 색 그리드 (DESIGN_PROMPT P2)
- [ ] SendRecordModal — 3탭 위저드 (DESIGN_PROMPT P3, FEATURE_SPEC §5)
- [ ] MyRecordsPage / TimelinePage
- [ ] SeasonDetailPage — 시즌 랭킹 (DESIGN_PROMPT P4)
- [ ] SessionDetailPage / SessionJoinPage
- [ ] LiveBoardPage `/c/{crew}/live` (DESIGN_PROMPT P1)
- [ ] LiveSessionBoardPage `/c/{crew}/sessions/{id}/live` — 카운트다운 포함

## 1.4 API (Route Handlers + zod)

- [ ] 시즌 CRUD + close
- [ ] 정책 CRUD (시즌 시작 후 immutable)
- [ ] 세팅 회차 / 벽 / 문제 CRUD + 사진 업로드 (MIME server-side double check, T9)
- [ ] **`POST /api/sends`** — RLS 검증 → active season 조회 → session 결정(ranked 진행 중이면 자동 join, 아니면 lazy casual_open) → 정책 점수 계산 → `score_snapshot` 박제 → INSERT (항상 `session_id` NOT NULL)
- [ ] `PATCH /api/sends/{id}` (코멘트만) / `DELETE` (soft cancel + send_revisions 자동 기록)
- [ ] 세션 CRUD + start/close/join
- [ ] 랭킹 GET (시즌/세션, ranked sends만 시즌 합산)
- [ ] TV 토큰 발급/revoke (`POST /api/seasons/{id}/display-tokens`, `DELETE /api/display-tokens/{id}`)

## 1.5 라이브 보드 (P1 핵심) ✅ 코드 완료 / ⏳ KPI 측정 대기

- [x] NextAuth → Supabase JWT broker (HS256, 1h, 5분 전 자동 갱신) + 양쪽 Supabase client 토큰 주입
- [x] Supabase Realtime hook `useRealtimeSends` — `games.sends` INSERT/UPDATE를 `season_id` 필터로 구독, zod payload 검증
- [x] INSERT 이벤트 수신 → 클라이언트 랭킹 재계산 (점수 합산만 가볍게)
- [x] connected 직후 race-window refetch (R1-M2)
- [x] 60s 1회 fallback polling (네트워크 끊김 복구)
- [x] "방금 풀이" 토스트 카드 (3초 페이드)
- [x] LiveBoardPage `/c/{crew}/live` + LiveSessionBoardPage `/c/{crew}/sessions/{id}/live` + primitives (BottomNav/KindBadge/Avatar/Toast)
- [x] 시즌/세션 ranking GET API + query helper (RPC + raw fallback)
- [x] e2e KPI 시나리오 (100 INSERT, NTP offset 보정, `expect(p95).toBeLessThan(4500)`)
- [ ] 5초 이내 보드 반영 KPI (p95) — `pnpm test:kpi` 실제 실행 측정 (사용자 액션)
- [ ] 가로 16:9 자동 (CSS container query) — Phase 1.6에서

## 1.6 운영 안전망

- [ ] `send_revisions` 자동 기록 (service-role only INSERT, RLS UPDATE/DELETE 거부 — append-only)
- [ ] Rate limit `POST /api/sends` 60초당 30회/user (Phase 1 in-memory, Phase 2 Upstash → T-I2)
- [ ] custom `GameError` 계층 + Route Handler에서 status code 매핑
- [ ] structured JSON 로깅 (Phase 2 Axiom 연동 — T-I 인프라)

## 1.7 Phase 1 Cherry-picks (7 ACCEPTED)

- [ ] **E1** SendRecordModal 자동선택 — LocalStorage (wall, color, last_number+1) prefill. last_number+1이 active 문제 그리드에 없으면 silent fallback (color 마지막 활성 번호)
- [ ] **E2** 점수 변동 풀 프리뷰 — Step 3에 "+95점 (시즌 1240→1335) 3→2위". draft 시즌엔 비표시. **ranked session 안에서만 표시** (T-M4 casual 모드 별도 카피)
- [ ] **E3** "이번 시즌 누적 N건 완등" 카운터 — **ranked sends만 count**. send_revisions cancel 이벤트로 decrement
- [ ] **E4** 시즌 종료 OG 이미지 2종 — `@vercel/og` 챔피언 카드 + 개인 카드 + SNS 공유 버튼. 비인증 access는 시즌 종료 후만 응답, 개인 카드는 owner_token으로 보호. T-M5 viral 가설 검증 동반
- [ ] **E5** `games.display_tokens` + TV 모드 라우트 + **SSE Proxy** (Vercel Edge streaming, p99 1-2초). 서버가 service-role로 Realtime 구독 + 토큰 검증 → SSE push. T-MS2 보드 선택 정책 (token.scope: 'season' | 'session')
- [ ] **E7** raw 데이터 운영자 대시보드 — 시간대별 완등 분포 sparkline + CSV download. CSV 열: user_name, problem_id, color, score, session_kind, created_at. 취소율 카드 제외 (D18). T-S1 KPI casual:ranked 비율 분리 sparkline
- [ ] **E8** 시즌 시작/종료 풀스크린 의식 카드 (TV) — `games.seasons` Realtime 구독으로 status 전환 감지 (draft→active→closed). 3-5초 overlay

---

## Phase 2 진입 조건

- [ ] 우리 크루 N명 × 1주 × 평균 ranked 5건/주 달성
- [ ] 라이브 보드 반영 지연 p95 5초 이내 측정 확인
- [ ] 첫 등록 → 첫 완등 기록 24시간 이내 (활성 멤버 80%)
- [ ] dogfooding retrospective 1회 수행 (T-I5 RUNBOOK 양심제 신뢰성 정성 검증)
- [ ] E6 PWA 오프라인 큐 도입 여부 결정 (dogfooding 끊김 빈도 데이터 기반)
