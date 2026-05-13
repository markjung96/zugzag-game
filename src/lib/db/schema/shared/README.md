# MIRROR — `public.*` (READ-ONLY)

이 디렉토리에 정의되는 모든 schema 파일은 **zugzag 본체의 `public.*` 테이블 미러**다.

## 규칙

- **변경 금지** — zugzag 본체에서 컬럼이 추가되면 여기 정의만 동기화. ALTER 마이그레이션은 zugzag 본체 레포에서만.
- Drizzle config의 `schemaFilter: ['games']` 가 안전 장치로 작동 — 이 파일들이 introspect/migrate 대상에 잡히지 않음.
- 파일 상단 헤더 의무:
  ```ts
  /**
   * MIRROR of zugzag.public.<table> (READ-ONLY)
   * Source: ../zugzag/src/lib/db/schema/<table>.ts
   * 변경 금지. zugzag에서 컬럼 추가 시 이 파일도 동기화하되, ALTER 마이그레이션은 zugzag에서만.
   */
  ```

## 미러 대상 (MVP 기준)

- `public.users`
- `public.crews`
- `public.crew_members`
- `public.gyms`
- `public.provider_colors`
- `public.pass_providers`

상세 정의는 `docs/DB_SHARING.md` §"미러 schema 정책" 참조.
