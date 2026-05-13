# db/ — 데이터베이스 SQL 스크립트

## 실행 순서 (Supabase 대시보드 SQL Editor에서 수동)

1. `setup/01-schema-and-role.sql` — games schema + zugzag_game role
2. `setup/02-publication.sql` — Realtime publication (sends, send_revisions, sessions, seasons)
3. `setup/03-rls-policies.sql` — RLS 정책
4. `setup/04-cross-schema-fks.sql` — public.\* 참조 FK

## 주의

- `public.*` ALTER 절대 금지 — zugzag 본체 레포에서만 변경.
- Drizzle migration은 `src/lib/db/schema/` 기반. 여기 SQL은 1회성 인프라 setup.
