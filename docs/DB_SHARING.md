# DB 공유 정책 (zugzag ↔ zugzag-game)

> **이 문서는 두 코드베이스 사이의 계약이다.**
> 둘 다 같은 PostgreSQL 인스턴스를 사용하지만, 책임은 schema 단위로 엄격히 분리된다.

---

## 핵심 규칙

```
하나의 Supabase 프로젝트 (zugzag 본체와 공유)
├── public.*    ← zugzag(본체)가 소유. zugzag만 마이그레이션.
└── games.*     ← zugzag-game이 소유. zugzag-game만 마이그레이션.

같은 프로젝트의 Realtime / Auth / Storage 인프라를 공유.
```

> 확인된 사실: zugzag의 `POSTGRES_URL` 호스트가 `*.pooler.supabase.com`이고
> `NEXT_PUBLIC_SUPABASE_URL`이 같은 Supabase 프로젝트(`qiqzabildtsislyrngfe`)를 가리킨다.
> 따라서 **zugzag DB == Supabase Postgres == Supabase Realtime이 보는 DB**.
> zugzag-game은 **별도 Supabase 프로젝트를 만들지 않는다.**

| 누가 | 어디서 | 무엇을 |
|---|---|---|
| zugzag (본체) | `public.*` | CRUD (정상 운영) |
| zugzag (본체) | `games.*` | ❌ 절대 접근 안 함 |
| zugzag-game | `public.*` | **SELECT만** (인증/조회 목적) |
| zugzag-game | `public.*` | ❌ INSERT/UPDATE/DELETE/ALTER 금지 |
| zugzag-game | `games.*` | CRUD (자체 운영) |

---

## 마이그레이션 책임

- **`public.*` 스키마 변경은 zugzag 레포에서만 한다.**
  zugzag-game의 Drizzle migration은 `games.*` 만 다룬다.
- zugzag에서 `public.users`에 컬럼이 추가되면, zugzag-game은 미러 schema 파일만 업데이트한다 (실제 ALTER 안 함).
- Drizzle config의 `schemaFilter: ['games']` 로 안전 장치를 둔다.

## 미러 schema 정책 (`src/lib/db/schema/shared/`)

- zugzag의 `public.*` 테이블 중 zugzag-game이 읽는 것만 미러링한다.
- 각 미러 파일 상단에 다음 헤더를 둔다:
  ```ts
  /**
   * MIRROR of zugzag.public.users (READ-ONLY)
   * Source: ../zugzag/src/lib/db/schema/users.ts
   * 변경 금지. zugzag에서 컬럼 추가 시 이 파일도 동기화하되, ALTER 마이그레이션은 zugzag에서만.
   */
  ```
- 미러 대상 (MVP 기준):
  - `public.users`
  - `public.crews`, `public.crew_members`
  - `public.gyms`
  - `public.provider_colors`
  - `public.pass_providers` (gyms.providerId 조인용)

## DB 권한 (운영 환경에서)

```sql
-- zugzag-game 용 별도 DB 유저
CREATE ROLE zugzag_game LOGIN PASSWORD '...';

-- public 스키마는 SELECT만
GRANT USAGE ON SCHEMA public TO zugzag_game;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO zugzag_game;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO zugzag_game;

-- games 스키마는 전체 권한
CREATE SCHEMA IF NOT EXISTS games AUTHORIZATION zugzag_game;
```

- 이 권한 설계로 **DB 레벨에서 실수를 차단**한다.
- 개발 환경은 같은 유저를 써도 되지만, 운영에선 분리 권장.

## Realtime Publication 정책

Supabase Realtime은 PostgreSQL publication에 등록된 테이블의 변경(WAL)만 push한다.
**민감한 `public.*` 테이블은 publication에서 제외**한다. `games.*` 중에서도 라이브 보드에 필요한 것만 노출.

| 테이블 | publication 포함? | 비고 |
|---|---|---|
| `games.sends` | ✅ | 라이브 보드의 핵심 신호 |
| `games.send_revisions` | ✅ | 취소/수정 이벤트 반영 |
| `games.sessions` | ✅ | 세션 status 변경 (scheduled→live→closed). **C-C 결정 (D25)**: `casual_open` 이벤트도 publication에 포함 (row filter 안 함). 클라이언트가 `kind='ranked'`만 표시 처리. P2 "공개 타임라인" 원칙 정합 — casual도 같은 크루 안에선 가시화 OK. |
| `games.seasons` | ✅ | E8 풀스크린 의식 카드용 상태 전환 감지 (draft→active→closed) |
| `games.problems` | ❌ | 잦은 변경 없음. 클라이언트에서 React Query로 페치 |
| `games.scoring_policies` | ❌ | 시즌 단위 안정 |
| `games.display_tokens` | ❌ | auth artifact, TV 토큰 노출 금지 |
| `public.*` 전체 | ❌ | Realtime 노출 금지 |

설정 위치: Supabase 대시보드 → Database → Replication → `supabase_realtime` publication.

## RLS 정책 (games.*)

`games.*` 모든 테이블에 RLS 활성화. 정책의 큰 그림:

| 테이블 | SELECT | INSERT | UPDATE/DELETE |
|---|---|---|---|
| `games.seasons` | 같은 크루 멤버 | 크루장/admin | 크루장/admin |
| `games.scoring_policies` | 같은 크루 멤버 | 크루장/admin | 크루장/admin |
| `games.sessions` | 같은 크루 멤버 | 크루장/admin | 크루장/admin |
| `games.session_participants` | 같은 크루 멤버 | 본인 또는 크루장 | 본인 또는 크루장 |
| `games.problems` | 같은 크루의 시즌 암장 | 크루장/admin | 크루장/admin |
| `games.sends` | 같은 시즌의 같은 크루 멤버 | 본인(`user_id = auth.uid()`) | 본인 |
| `games.send_revisions` | 해당 send의 SELECT 가능자 | service-role only | ❌ (RLS UPDATE/DELETE USING false, append-only) |
| `games.display_tokens` | 토큰 holder (비인증 `/tv/{token}`) | 운영자 | 운영자 (revoke만) |

- 크루 멤버십 검증은 `public.crew_members` 조인 함수로 헬퍼화: `games.is_crew_member(crew_id, user_id) returns boolean`
- 정책은 Supabase SQL 마이그레이션에 포함 (코드와 함께 버전 관리)
- Realtime 구독 시 RLS가 자동 적용 → 다른 크루 데이터 누설 방지

## 인증 공유

- 도메인: `zugzag.com` ↔ `games.zugzag.com`
- NextAuth 세션 쿠키: `domain=.zugzag.com`, `secure`, `sameSite=lax`
- zugzag-game은 자체 인증 UI 없음. 비로그인 시 `https://zugzag.com/login?callbackUrl=https://games.zugzag.com/...` 로 리다이렉트.

## 변경 절차 (체크리스트)

zugzag-game이 `public.*`의 새 컬럼/테이블을 읽어야 할 때:

1. zugzag 레포에서 마이그레이션 작성 + 머지
2. zugzag-game 레포에서 미러 schema 파일 업데이트 (ALTER 안 함, 정의만 동기화)
3. PR 설명에 `MIRROR sync: <컬럼>` 표기
4. 타입 체크 (`pnpm type-check`) 통과 확인
