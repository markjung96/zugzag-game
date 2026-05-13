# CLAUDE.md — zugzag-game

> 새 agent가 들어왔을 때 **30초 컨텍스트 흡수**가 목표. 이 파일은 인덱스 + 핵심 결정 highlight + 코딩 규칙만. 세부는 `docs/`에 위임.

---

## 1. 정체성 (한 줄)

클라이밍 크루용 **실시간 볼더링 랭크전** Next.js 앱. zugzag 본체와 **같은 Supabase 프로젝트 DB**를 공유하되 `games.*` schema 분리. URL `games.zugzag.com`. 현 단계: planning 완료, Phase 0 직전.

---

## 2. 진실 source (이 순서대로)

| # | 파일 | 역할 |
|---|---|---|
| 1 | `docs/PRINCIPLES.md` | 5원칙 + 비-목표 (최상위) |
| 2 | `docs/FEATURE_SPEC.md` | 화면/API/DB/규칙 SSOT (v0.2 Full Pivot) |
| 3 | `docs/ROADMAP.md` + `docs/phases/phase-{0..3}.md` | Phase별 체크리스트 |
| 4 | `docs/DB_SHARING.md` | DB 공유 계약 (publication, RLS, append-only) |
| 5 | `docs/DESIGN_PROMPT.md` | UI 톤 + 9개 화면 시안 |
| 6 | `docs/TODOS.md` | MAJOR/Missing/인프라/Skeptic 우려 |
| 7 | `docs/RUNBOOK.md` | 운영 시나리오 3종 |
| 8 | `~/.gstack/projects/zugzag-game/ceo-plans/2026-05-13-zugzag-game-phase-1.md` | 25개 결정 + Full Pivot archive |

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

## 7. 다음 단계

1. `pnpm create next-app@latest . --typescript --app --tailwind --eslint`
2. Drizzle setup → `db/setup/*.sql`을 Supabase 대시보드에 적용
3. NextAuth `.zugzag.com` 쿠키 공유 검증
4. Phase 0 체크리스트 = `docs/phases/phase-0.md`
5. 진입 전 권장: `/plan-eng-review`, `/plan-design-review`

> harness 진화: Phase 0 마무리 후 `.claude/rules/` 추가 (path-scoped). Phase 1 코드 진입 후 폴더별 `CLAUDE.md` 보강 (on-demand 로딩).
