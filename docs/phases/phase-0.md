# Phase 0 — 셋업 (2-2.5주)

> **완료 조건**: 로컬에서 `games.zugzag.com`(또는 localhost) 접속 시 zugzag 로그인 세션으로 빈 게임 홈을 본다.

Full Pivot 도입으로 lazy casual_open + first_send_only 정책 재정의 + `sends.session_kind` denormalized + RLS 조정이 추가되어 일정이 1주 → 2-2.5주로 갱신됨 (Critic 2차 M-6).

---

## 0.1 프로젝트 부트스트랩

- [ ] `pnpm create next-app@latest . --typescript --app --tailwind --eslint` (Next.js 16 App Router)
- [ ] `pnpm add drizzle-orm postgres drizzle-zod zod`
- [ ] `pnpm add -D drizzle-kit @types/node`
- [ ] Drizzle config: `schemaFilter: ['games']` (안전 장치)
- [ ] `.env.example` 기반으로 `.env.local` 채우기 (zugzag와 같은 Supabase 프로젝트 URL/anon/service-role)
- [ ] CI: GitHub Actions `pnpm type-check` + `pnpm lint`

## 0.2 DB 분리 & 권한

- [ ] `db/setup/01-schema-and-role.sql` Supabase 대시보드에서 SUPER로 실행 — `games` schema + `zugzag_game` role + `public.*` SELECT-only grant
- [ ] `db/setup/02-publication.sql` 실행 — `supabase_realtime`에 `games.sends`, `games.send_revisions`, `games.sessions`, `games.seasons` 추가
- [ ] `db/setup/03-rls-policies.sql` 실행 — `games.is_crew_member()` 헬퍼 + 각 테이블 RLS + `send_revisions` append-only enforce
- [ ] Drizzle migration으로 `games.*` 테이블 정의 (seasons/policies/cycles/walls/problems/sessions/teams/participants/sends/send_revisions/display_tokens)
- [ ] 미러 schema 6개 (`public.users`, `crews`, `crew_members`, `gyms`, `provider_colors`, `pass_providers`) — read-only 헤더 명시
- [ ] cross-schema FK 검증 (`games.sends.user_id → public.users.id` ON DELETE RESTRICT)

## 0.3 인증 + 도메인

- [ ] NextAuth `.zugzag.com` 쿠키 도메인 검증 — 본체 패턴 그대로 follow (D14, 코드 참조)
- [ ] 미인증 시 `https://zugzag.com/login?callbackUrl=...`로 리다이렉트 미들웨어
- [ ] Vercel 프로젝트 + `games.zugzag.com` 서브도메인 연결 (dev는 localhost)
- [ ] Supabase client 세팅 (anon + service-role 분리, RLS bypass는 service-role 한 곳에만)
- [ ] Realtime Postgres Changes 구독 스모크 테스트 (`games.sends` INSERT 이벤트 수신 확인)

## 0.4 Phase 0 진입 전 명확화 (`docs/TODOS.md` P1)

- [ ] **T-M1** casual_open 자정 cutover — `now() AT TIME ZONE 'Asia/Seoul'` 일관 적용 + UNIQUE index `(crew_id, (starts_at::date))`도 같은 timezone
- [ ] **T-M2** Ranked session close 중 사용자 모달 race — 클라이언트가 모달 진입 시 session_id 캐시 → POST에 함께 전송, 서버가 `status=closed`면 409 + "랭크전이 방금 종료됐어요" 안내
- [ ] **T-MS1** casual_open close 트리거 — 다음 첫 send 시 lazy로 이전 일자 casual_open close (cron 없이)
- [ ] **T-I7** Cross-schema FK 정책 — `ON DELETE RESTRICT` 확정 (sends 보존)
- [ ] **T-I8** NextAuth + Supabase RLS 연결 패턴 — 본체 코드 확인 후 결정 (Phase 0 첫날)

---

## Phase 1 진입 조건

- [ ] `db/setup/*.sql` 3개 모두 Supabase에 적용 완료
- [ ] 미러 schema + games schema 양쪽 type-check pass
- [ ] localhost에서 zugzag 로그인 세션으로 빈 게임 홈 진입 확인
- [ ] Realtime 스모크 테스트 통과
- [ ] CI green
