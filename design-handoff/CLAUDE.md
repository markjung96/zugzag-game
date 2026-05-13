# design-handoff/ — 디자인 핸드오프 (read-only)

이 디렉토리는 디자이너가 전달한 원본 JSX + CSS 시안이다. **절대 수정하지 않는다.**

## 포팅 규칙 (PLAN.md 부록 B 참조)
- JSX → `.tsx` + TypeScript strict.
- `className` string → Tailwind utility.
- `tokens.css` 변수 → `globals.css` :root 변수 + `@theme` 유틸리티.
- inline style → Tailwind. 불가능한 경우만 CSS Module.
- `onClick` 등 이벤트 → `"use client"` 지시자 필요.
