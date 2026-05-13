// games.* schema 진입점. Drizzle migration이 여기서 출발한다.
//
// 채울 예정 (Phase 0.2):
//   - seasons / scoring_policies / setting_cycles / walls / problems
//   - sessions (kind: 'ranked' | 'casual_open') / session_teams / session_participants
//   - sends (session_id NOT NULL, session_kind denormalized) / send_revisions
//   - display_tokens
//
// public.* 미러는 ./shared/ 에 별도 정의 (read-only, 변경 금지).
//
// 참조:
//   - docs/FEATURE_SPEC.md §11 (테이블 정의 SSOT)
//   - docs/DB_SHARING.md (publication / RLS)
//   - db/setup/03-rls-policies.sql (RLS 정책)

export {};
