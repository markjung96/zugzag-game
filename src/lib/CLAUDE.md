# src/lib/ — 핵심 라이브러리

## 하위 모듈

| 디렉토리      | 역할                                                            |
| ------------- | --------------------------------------------------------------- |
| `db/`         | Drizzle client, schema(games.ts + shared/), 도메인별 쿼리 함수  |
| `auth/`       | NextAuth v5 config + helpers. `.zugzag.com` 쿠키 공유(D14)      |
| `supabase/`   | server(anon/service-role) + browser client                      |
| `validation/` | zod schemas — 모든 API 입력 검증 통일                           |
| `policies/`   | scoring policy 기본 템플릿 상수 (P1.2-PolicyCRUD UI에서 import) |
| `errors/`     | GameError 계층 (RLS/Policy/RateLimit/NotFound/Auth)             |
| `realtime/`   | Supabase Realtime hooks (sends, sessions, seasons)              |
| `sse/`        | SSE Proxy server-side (E5 TV 모드)                              |
| `og/`         | @vercel/og 헬퍼 (E4 시즌 OG)                                    |

## import 규칙

- `@/lib/*` alias 사용.
- `server-only` 패키지: server.ts 파일 상단에 `import "server-only"`.
- DB client는 서버 사이드 전용. 클라이언트에서는 Supabase JS 사용.
