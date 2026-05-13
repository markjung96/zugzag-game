-- 04-cross-schema-fks.sql
-- Phase 0 셋업 #4: games.* → public.* cross-schema FK 추가
--
-- 사전 조건:
--   - 01-schema-and-role.sql 실행 완료
--   - Drizzle migration 적용 완료 (games.* 테이블 존재)
--   - zugzag 본체 public.* 테이블 존재 (이미 운영 중)
--
-- 왜 raw SQL인가:
--   Drizzle schema/index.ts에 미러 schema를 export하면 drizzle-kit generate가
--   public.* 까지 CREATE TABLE 을 만들어 zugzag 본체와 충돌한다 (P4 위반).
--   그래서 미러는 generate 진입점에서 제외하고, cross-schema FK는 여기서 raw로 추가.
--
-- 정책 (T-I7): 일관되게 ON DELETE RESTRICT.
--   user/crew/gym 삭제 시 games.* 데이터 보존. 본체에서 cascade 결정을 강제로 받지 않게.
--   created_by / by_user_id 만 ON DELETE SET NULL (감사 메타로 충분).

-- ============================================================================
-- 멱등성: DROP CONSTRAINT IF EXISTS → ADD CONSTRAINT 패턴. 재실행 안전.
-- ============================================================================

-- games.seasons -------------------------------------------------------------
ALTER TABLE games.seasons
  DROP CONSTRAINT IF EXISTS seasons_crew_id_fk,
  ADD CONSTRAINT seasons_crew_id_fk
    FOREIGN KEY (crew_id) REFERENCES public.crews(id) ON DELETE RESTRICT;

ALTER TABLE games.seasons
  DROP CONSTRAINT IF EXISTS seasons_created_by_fk,
  ADD CONSTRAINT seasons_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- games.scoring_policies ----------------------------------------------------
ALTER TABLE games.scoring_policies
  DROP CONSTRAINT IF EXISTS scoring_policies_crew_id_fk,
  ADD CONSTRAINT scoring_policies_crew_id_fk
    FOREIGN KEY (crew_id) REFERENCES public.crews(id) ON DELETE RESTRICT;

ALTER TABLE games.scoring_policies
  DROP CONSTRAINT IF EXISTS scoring_policies_created_by_fk,
  ADD CONSTRAINT scoring_policies_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- games.setting_cycles ------------------------------------------------------
ALTER TABLE games.setting_cycles
  DROP CONSTRAINT IF EXISTS setting_cycles_gym_id_fk,
  ADD CONSTRAINT setting_cycles_gym_id_fk
    FOREIGN KEY (gym_id) REFERENCES public.gyms(id) ON DELETE RESTRICT;

-- games.walls ---------------------------------------------------------------
ALTER TABLE games.walls
  DROP CONSTRAINT IF EXISTS walls_gym_id_fk,
  ADD CONSTRAINT walls_gym_id_fk
    FOREIGN KEY (gym_id) REFERENCES public.gyms(id) ON DELETE RESTRICT;

-- games.problems ------------------------------------------------------------
ALTER TABLE games.problems
  DROP CONSTRAINT IF EXISTS problems_provider_color_id_fk,
  ADD CONSTRAINT problems_provider_color_id_fk
    FOREIGN KEY (provider_color_id) REFERENCES public.provider_colors(id) ON DELETE RESTRICT;

ALTER TABLE games.problems
  DROP CONSTRAINT IF EXISTS problems_created_by_fk,
  ADD CONSTRAINT problems_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- games.sessions ------------------------------------------------------------
ALTER TABLE games.sessions
  DROP CONSTRAINT IF EXISTS sessions_crew_id_fk,
  ADD CONSTRAINT sessions_crew_id_fk
    FOREIGN KEY (crew_id) REFERENCES public.crews(id) ON DELETE RESTRICT;

ALTER TABLE games.sessions
  DROP CONSTRAINT IF EXISTS sessions_gym_id_fk,
  ADD CONSTRAINT sessions_gym_id_fk
    FOREIGN KEY (gym_id) REFERENCES public.gyms(id) ON DELETE RESTRICT;

ALTER TABLE games.sessions
  DROP CONSTRAINT IF EXISTS sessions_created_by_fk,
  ADD CONSTRAINT sessions_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- games.session_participants ------------------------------------------------
ALTER TABLE games.session_participants
  DROP CONSTRAINT IF EXISTS session_participants_user_id_fk,
  ADD CONSTRAINT session_participants_user_id_fk
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;

-- games.sends ---------------------------------------------------------------
ALTER TABLE games.sends
  DROP CONSTRAINT IF EXISTS sends_user_id_fk,
  ADD CONSTRAINT sends_user_id_fk
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;

-- games.send_revisions ------------------------------------------------------
ALTER TABLE games.send_revisions
  DROP CONSTRAINT IF EXISTS send_revisions_by_user_id_fk,
  ADD CONSTRAINT send_revisions_by_user_id_fk
    FOREIGN KEY (by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- games.display_tokens ------------------------------------------------------
ALTER TABLE games.display_tokens
  DROP CONSTRAINT IF EXISTS display_tokens_crew_id_fk,
  ADD CONSTRAINT display_tokens_crew_id_fk
    FOREIGN KEY (crew_id) REFERENCES public.crews(id) ON DELETE RESTRICT;

ALTER TABLE games.display_tokens
  DROP CONSTRAINT IF EXISTS display_tokens_created_by_fk,
  ADD CONSTRAINT display_tokens_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- ============================================================================
-- 검증 쿼리
-- ============================================================================
-- SELECT
--   tc.constraint_name,
--   tc.table_schema || '.' || tc.table_name AS source,
--   ccu.table_schema || '.' || ccu.table_name || '(' || ccu.column_name || ')' AS target,
--   rc.delete_rule
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.referential_constraints rc USING (constraint_name)
-- JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_schema = 'games'
--   AND ccu.table_schema = 'public'
-- ORDER BY source, constraint_name;
--
-- 기대: 16개 cross-schema FK (위 ADD CONSTRAINT 합산)
