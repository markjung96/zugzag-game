-- 03-rls-policies.sql
-- Phase 0 셋업 #3: games.* RLS 정책 + 헬퍼 함수
--
-- 사전 조건:
--   - 01-schema-and-role.sql 실행 완료
--   - Drizzle migration으로 games.* 모든 테이블 생성 완료
--
-- 정책 큰 그림 (DB_SHARING.md §"RLS 정책 (games.*)" 참조):
--   | 테이블                       | SELECT                     | INSERT          | UPDATE/DELETE        |
--   |------------------------------|----------------------------|-----------------|----------------------|
--   | games.seasons                | 같은 크루 멤버              | leader/admin    | leader/admin         |
--   | games.scoring_policies       | 같은 크루 멤버              | leader/admin    | leader/admin         |
--   | games.sessions               | 같은 크루 멤버              | leader/admin    | leader/admin         |
--   | games.session_participants   | 같은 크루 멤버              | 본인 또는 leader| 본인 또는 leader     |
--   | games.problems               | 같은 크루의 시즌 암장       | leader/admin    | leader/admin         |
--   | games.sends                  | 같은 시즌의 같은 크루 멤버  | 본인             | 본인                  |
--   | games.send_revisions         | 해당 send SELECT 가능자     | service-role only| ❌ (USING false)     |
--   | games.display_tokens         | 토큰 holder (별도 처리)     | leader/admin    | leader/admin (revoke)|
--
-- 핵심 결정 반영:
--   D16: send_revisions append-only — service-role only INSERT + RLS UPDATE/DELETE 거부
--   D14: NextAuth + Supabase RLS = 본체 패턴 follow (auth.uid()가 zugzag 본체와 동일하게 작동한다는 가정 — Phase 0 T-I8에서 검증)
--   E5 SSE Proxy: display_tokens SELECT는 토큰 기반인데 RLS로는 임의의 토큰 비교 불가 →
--                 SSE Proxy 서버에서 service-role로 직접 조회 (RLS bypass), 클라이언트는 직접 SELECT 안 함.

-- ============================================================================
-- 0. 헬퍼 함수: games.is_crew_member(crew_id, user_id) returns boolean
-- ============================================================================
-- public.crew_members 조인. SECURITY DEFINER로 zugzag_game role이
-- public.crew_members SELECT 권한을 통해 평가 가능하게 함.

CREATE OR REPLACE FUNCTION games.is_crew_member(p_crew_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.crew_members
    WHERE crew_id = p_crew_id AND user_id = p_user_id
  );
$$;

-- 같은 크루이면서 leader 또는 admin 인지
CREATE OR REPLACE FUNCTION games.is_crew_admin(p_crew_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.crew_members
    WHERE crew_id = p_crew_id
      AND user_id = p_user_id
      AND role IN ('leader', 'admin')
  );
$$;

GRANT EXECUTE ON FUNCTION games.is_crew_member(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION games.is_crew_admin(uuid, uuid) TO authenticated, anon, service_role;

-- ============================================================================
-- 1. games.seasons
-- ============================================================================
ALTER TABLE games.seasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS seasons_select ON games.seasons;
CREATE POLICY seasons_select ON games.seasons FOR SELECT
  USING (games.is_crew_member(crew_id, auth.uid()));

DROP POLICY IF EXISTS seasons_insert ON games.seasons;
CREATE POLICY seasons_insert ON games.seasons FOR INSERT
  WITH CHECK (games.is_crew_admin(crew_id, auth.uid()));

DROP POLICY IF EXISTS seasons_update ON games.seasons;
CREATE POLICY seasons_update ON games.seasons FOR UPDATE
  USING (games.is_crew_admin(crew_id, auth.uid()))
  WITH CHECK (games.is_crew_admin(crew_id, auth.uid()));

DROP POLICY IF EXISTS seasons_delete ON games.seasons;
CREATE POLICY seasons_delete ON games.seasons FOR DELETE
  USING (games.is_crew_admin(crew_id, auth.uid()));

-- ============================================================================
-- 2. games.scoring_policies
-- ============================================================================
ALTER TABLE games.scoring_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS scoring_policies_select ON games.scoring_policies;
CREATE POLICY scoring_policies_select ON games.scoring_policies FOR SELECT
  USING (games.is_crew_member(crew_id, auth.uid()));

DROP POLICY IF EXISTS scoring_policies_modify ON games.scoring_policies;
CREATE POLICY scoring_policies_modify ON games.scoring_policies FOR ALL
  USING (games.is_crew_admin(crew_id, auth.uid()))
  WITH CHECK (games.is_crew_admin(crew_id, auth.uid()));

-- ============================================================================
-- 3. games.sessions
-- ============================================================================
ALTER TABLE games.sessions ENABLE ROW LEVEL SECURITY;

-- 시즌을 통해 크루를 찾는 헬퍼 (sessions에는 crew_id가 없고 season_id만 있음)
CREATE OR REPLACE FUNCTION games.session_crew_id(p_session_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = games, pg_temp
AS $$
  SELECT s.crew_id FROM games.seasons s
  JOIN games.sessions ss ON ss.season_id = s.id
  WHERE ss.id = p_session_id;
$$;

GRANT EXECUTE ON FUNCTION games.session_crew_id(uuid) TO authenticated, anon, service_role;

DROP POLICY IF EXISTS sessions_select ON games.sessions;
CREATE POLICY sessions_select ON games.sessions FOR SELECT
  USING (
    games.is_crew_member(
      (SELECT crew_id FROM games.seasons WHERE id = season_id),
      auth.uid()
    )
  );

DROP POLICY IF EXISTS sessions_modify ON games.sessions;
CREATE POLICY sessions_modify ON games.sessions FOR ALL
  USING (
    games.is_crew_admin(
      (SELECT crew_id FROM games.seasons WHERE id = season_id),
      auth.uid()
    )
  )
  WITH CHECK (
    games.is_crew_admin(
      (SELECT crew_id FROM games.seasons WHERE id = season_id),
      auth.uid()
    )
  );

-- ============================================================================
-- 4. games.session_participants
-- ============================================================================
ALTER TABLE games.session_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS session_participants_select ON games.session_participants;
CREATE POLICY session_participants_select ON games.session_participants FOR SELECT
  USING (
    games.is_crew_member(
      games.session_crew_id(session_id),
      auth.uid()
    )
  );

DROP POLICY IF EXISTS session_participants_insert ON games.session_participants;
CREATE POLICY session_participants_insert ON games.session_participants FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR games.is_crew_admin(games.session_crew_id(session_id), auth.uid())
  );

DROP POLICY IF EXISTS session_participants_update ON games.session_participants;
CREATE POLICY session_participants_update ON games.session_participants FOR UPDATE
  USING (
    user_id = auth.uid()
    OR games.is_crew_admin(games.session_crew_id(session_id), auth.uid())
  );

DROP POLICY IF EXISTS session_participants_delete ON games.session_participants;
CREATE POLICY session_participants_delete ON games.session_participants FOR DELETE
  USING (
    user_id = auth.uid()
    OR games.is_crew_admin(games.session_crew_id(session_id), auth.uid())
  );

-- ============================================================================
-- 5. games.setting_cycles / walls / problems
--    같은 크루의 gym → 같은 크루 멤버 SELECT, leader/admin CRUD.
--    크루↔gym 관계는 public.crew_members + public.crews 등에서 파생.
--    Phase 0에서 cross-schema join 검증 시 정책 강화 가능 (지금은 보수적으로 authenticated 전체 SELECT 후 클라이언트 필터 → Phase 0 T-I8 확정 시 좁힘).
-- ============================================================================
ALTER TABLE games.setting_cycles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS setting_cycles_select ON games.setting_cycles;
CREATE POLICY setting_cycles_select ON games.setting_cycles FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS setting_cycles_modify ON games.setting_cycles;
CREATE POLICY setting_cycles_modify ON games.setting_cycles FOR ALL
  TO authenticated USING (true) WITH CHECK (true);
-- TODO: Phase 0 T-I8에서 gym→crew 관계 결정 후 좁힘.

ALTER TABLE games.walls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS walls_select ON games.walls;
CREATE POLICY walls_select ON games.walls FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS walls_modify ON games.walls;
CREATE POLICY walls_modify ON games.walls FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE games.problems ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS problems_select ON games.problems;
CREATE POLICY problems_select ON games.problems FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS problems_modify ON games.problems;
CREATE POLICY problems_modify ON games.problems FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- 6. games.sends — 본인 INSERT/UPDATE, 같은 시즌의 같은 크루 SELECT
-- ============================================================================
ALTER TABLE games.sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sends_select ON games.sends;
CREATE POLICY sends_select ON games.sends FOR SELECT
  USING (
    games.is_crew_member(
      (SELECT crew_id FROM games.seasons WHERE id = season_id),
      auth.uid()
    )
  );

DROP POLICY IF EXISTS sends_insert ON games.sends;
CREATE POLICY sends_insert ON games.sends FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND games.is_crew_member(
      (SELECT crew_id FROM games.seasons WHERE id = season_id),
      auth.uid()
    )
  );

DROP POLICY IF EXISTS sends_update ON games.sends;
CREATE POLICY sends_update ON games.sends FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS sends_delete ON games.sends;
CREATE POLICY sends_delete ON games.sends FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- 7. games.send_revisions — append-only (D16)
--    INSERT는 service-role만, UPDATE/DELETE 전면 거부.
--    SELECT는 해당 send를 볼 수 있는 사람.
-- ============================================================================
ALTER TABLE games.send_revisions ENABLE ROW LEVEL SECURITY;

-- 일반 role의 INSERT 권한을 DB 레벨에서도 차단 (RLS와 이중 방어)
REVOKE INSERT, UPDATE, DELETE ON games.send_revisions FROM authenticated, anon, zugzag_game;
GRANT  INSERT ON games.send_revisions TO service_role;

DROP POLICY IF EXISTS send_revisions_select ON games.send_revisions;
CREATE POLICY send_revisions_select ON games.send_revisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games.sends s
      WHERE s.id = send_revisions.send_id
        AND games.is_crew_member(
          (SELECT crew_id FROM games.seasons WHERE id = s.season_id),
          auth.uid()
        )
    )
  );

-- UPDATE / DELETE 전면 거부 (RLS USING false). DB GRANT REVOKE와 이중 방어.
DROP POLICY IF EXISTS send_revisions_no_update ON games.send_revisions;
CREATE POLICY send_revisions_no_update ON games.send_revisions FOR UPDATE
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS send_revisions_no_delete ON games.send_revisions;
CREATE POLICY send_revisions_no_delete ON games.send_revisions FOR DELETE
  USING (false);

-- service-role만 INSERT 가능 (RLS bypass되므로 정책 불필요, GRANT가 enforce)

-- ============================================================================
-- 8. games.display_tokens — SSE Proxy 서버에서 service-role로 직접 조회
--    클라이언트(authenticated)는 발급/revoke만, SELECT는 운영자만.
-- ============================================================================
ALTER TABLE games.display_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS display_tokens_admin_all ON games.display_tokens;
CREATE POLICY display_tokens_admin_all ON games.display_tokens FOR ALL
  USING (games.is_crew_admin(crew_id, auth.uid()))
  WITH CHECK (games.is_crew_admin(crew_id, auth.uid()));
-- 비인증 /tv/{token} 라우트는 SSE Proxy 서버가 service-role로 토큰 검증 → SSE push.

-- ============================================================================
-- 9. session_teams (참고: ranked 팀전, Phase 2에서 본격 사용)
-- ============================================================================
ALTER TABLE games.session_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS session_teams_select ON games.session_teams;
CREATE POLICY session_teams_select ON games.session_teams FOR SELECT
  USING (games.is_crew_member(games.session_crew_id(session_id), auth.uid()));
DROP POLICY IF EXISTS session_teams_modify ON games.session_teams;
CREATE POLICY session_teams_modify ON games.session_teams FOR ALL
  USING (games.is_crew_admin(games.session_crew_id(session_id), auth.uid()))
  WITH CHECK (games.is_crew_admin(games.session_crew_id(session_id), auth.uid()));

-- ============================================================================
-- 검증 쿼리
-- ============================================================================
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'games' ORDER BY tablename;
--   → 모든 행이 rowsecurity = true 이어야 함
--
-- SELECT polname, polcmd, polqual FROM pg_policy
--   JOIN pg_class ON pg_policy.polrelid = pg_class.oid
--   WHERE relnamespace = 'games'::regnamespace
--   ORDER BY relname, polname;
--   → send_revisions_no_update / send_revisions_no_delete 의 polqual이 false 인지 확인
