/**
 * Drizzle migration 진입점. drizzle.config.ts가 이 파일을 본다.
 *
 * **여기서는 games.* 만 export.**
 * 미러 (public.*) schema는 import 시 drizzle-kit이 generate에서 함께 CREATE TABLE을 생성해
 * zugzag 본체 테이블과 충돌하므로 (P4 위반) 분리.
 *
 * App 코드에서 미러 schema가 필요하면 직접 `from "@/lib/db/schema/shared"` 로 import:
 *   import { users, crews } from "@/lib/db/schema/shared";
 * cross-schema join은 Drizzle query builder에서 자유롭게 사용 가능.
 *
 * Cross-schema FK는 db/setup/04-cross-schema-fks.sql 에서 raw ALTER로 추가.
 *
 * 진실 source:
 *   - docs/FEATURE_SPEC.md §11 (테이블 정의)
 *   - docs/DB_SHARING.md (RLS / publication / 미러 정책)
 */

export * from "./games";
