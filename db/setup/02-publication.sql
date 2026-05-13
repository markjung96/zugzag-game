-- 02-publication.sql
-- Phase 0 셋업 #2: Supabase Realtime publication에 games.* 라이브 보드 테이블 등록
--
-- 사전 조건:
--   - 01-schema-and-role.sql 실행 완료
--   - Drizzle migration으로 games.sends / send_revisions / sessions / seasons 테이블 생성 완료
--   - supabase_realtime publication이 이미 존재 (Supabase 기본 설정)
--
-- 정책 (DB_SHARING.md publication 표 기준):
--   ✅ 포함: games.sends, games.send_revisions, games.sessions, games.seasons
--   ❌ 제외: games.display_tokens (auth artifact), games.problems / scoring_policies,
--            public.* 전체
--
-- C-C 결정 (D25): sessions publication은 kind 구분 없이 노출. 클라이언트가
-- kind='ranked'만 표시 처리. P2 "공개 타임라인" 원칙 정합.
--
-- 멱등성: ALTER PUBLICATION ADD TABLE은 이미 등록된 테이블 추가 시 에러.
-- DO 블록으로 존재 여부 확인 후 ADD.

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'games.sends',
    'games.send_revisions',
    'games.sessions',
    'games.seasons'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND (schemaname || '.' || tablename) = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %s', tbl);
    END IF;
  END LOOP;
END
$$;

-- ============================================================================
-- 검증 쿼리
-- ============================================================================
-- SELECT schemaname, tablename FROM pg_publication_tables
--   WHERE pubname = 'supabase_realtime' AND schemaname = 'games'
--   ORDER BY tablename;
--
-- 기대 결과 (4행):
--   games | seasons
--   games | send_revisions
--   games | sends
--   games | sessions
