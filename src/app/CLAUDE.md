# src/app/ — Next.js App Router

## 라우트 그룹

- `(auth)/` — 인증 필요. `layout.tsx`에 auth guard + crew context provider.
- `(public)/` — 비인증 허용. TV 모드(`/tv/[token]`) 등.
- `api/` — Route Handlers. POST/PATCH/DELETE만 사용. GET은 Server Component에서 직접 쿼리.

## 규칙

- Server Actions는 form-only. 데이터 변경은 Route Handler(api/) 경유.
- `globals.css`에 디자인 토큰 정의. Tailwind 4 `@theme inline` 블록으로 유틸리티 클래스 연결.
- layout 계층: root → (auth) layout(auth guard) → c/[crew] layout(crew context).
