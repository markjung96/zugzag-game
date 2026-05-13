-- 01-schema-and-role.sql
-- Phase 0 셋업 #1: games 스키마 + zugzag_game 운영 role + public.* SELECT-only grant
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → SUPER 권한으로 실행.
-- D17 결정: 대시보드 수동 SQL + repo 고정으로 감사 가능성 확보.
-- 멱등성: IF NOT EXISTS / IF EXISTS 패턴으로 재실행 안전하게.
--
-- 사전 조건: zugzag 본체가 이미 같은 Supabase 프로젝트에서 public.* 운영 중.

-- ============================================================================
-- 1. zugzag_game 운영 role 생성 (게임 앱이 접속할 DB 유저)
-- ============================================================================
-- 비밀번호는 실제 실행 시 Supabase 대시보드의 Vault 또는 안전한 채널로 교체.
-- placeholder를 그대로 두지 말 것.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'zugzag_game') THEN
    EXECUTE 'CREATE ROLE zugzag_game LOGIN PASSWORD ''CHANGE_ME_BEFORE_RUN''';
  END IF;
END
$$;

-- ============================================================================
-- 2. games 스키마 생성
--    Supabase Cloud의 postgres는 제한된 superuser라 AUTHORIZATION 절로 다른 role
--    소유 스키마를 만들 수 없다 (SET ROLE 권한 부재). 대신 postgres 소유로 만들고
--    zugzag_game에 ALL 권한을 명시적으로 부여한다. DB 분리의 보안 효과는 동일.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS games;
GRANT ALL ON SCHEMA games TO zugzag_game;
ALTER DEFAULT PRIVILEGES IN SCHEMA games
  GRANT ALL ON TABLES TO zugzag_game;
ALTER DEFAULT PRIVILEGES IN SCHEMA games
  GRANT ALL ON SEQUENCES TO zugzag_game;
ALTER DEFAULT PRIVILEGES IN SCHEMA games
  GRANT ALL ON FUNCTIONS TO zugzag_game;

-- ============================================================================
-- 3. public 스키마는 SELECT만 (절대 ALTER/INSERT/UPDATE/DELETE 금지)
--    → DB 레벨에서 실수를 차단. 미러 schema 정책의 강제 layer.
-- ============================================================================
GRANT USAGE ON SCHEMA public TO zugzag_game;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO zugzag_game;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO zugzag_game;

-- 새로 추가되는 public.* 테이블에도 자동으로 SELECT 부여 (zugzag 본체 마이그레이션 대응)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO zugzag_game;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON SEQUENCES TO zugzag_game;

-- ============================================================================
-- 4. games 스키마는 전체 권한 (소유자이므로 기본 부여되지만 명시)
-- ============================================================================
GRANT ALL ON SCHEMA games TO zugzag_game;

-- ============================================================================
-- 5. authenticator/anon/authenticated role도 games 스키마 사용 가능하게 (Supabase 기본 패턴)
--    Drizzle migration이 만든 테이블에 RLS 적용 후, 클라이언트 SDK는 anon/authenticated로 접근.
-- ============================================================================
GRANT USAGE ON SCHEMA games TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA games
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA games
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA games
  GRANT ALL ON TABLES TO service_role;

-- ============================================================================
-- 검증 쿼리 (실행 후 수동 확인 권장)
-- ============================================================================
-- SELECT nspname, nspowner::regrole FROM pg_namespace WHERE nspname = 'games';
-- SELECT grantee, privilege_type FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND grantee = 'zugzag_game' LIMIT 5;
