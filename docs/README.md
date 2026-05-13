# ZUGZAG-GAME 문서

크루 기반 실시간 볼더링 **랭크전** 플랫폼. 호스트가 랭크전을 열고 참가자가 모여 그 시간 안의 풀이로 순위를 박제하는 게 메인 경험. 평시 풀이(casual)는 본인 타임라인에만 남는 자산. (LoL의 일반게임/랭크게임 분리 모델)

zugzag(본체)와 같은 Supabase 프로젝트의 DB를 공유하되, 코드와 배포는 완전히 분리된 별도 Next.js 앱.

## 핵심 문서

| 문서 | 역할 | 보는 시점 |
|---|---|---|
| [PRINCIPLES.md](./PRINCIPLES.md) | 서비스 원칙과 비-목표. 의사결정이 흔들릴 때 돌아오는 기준 | 모든 결정 전 |
| [FEATURE_SPEC.md](./FEATURE_SPEC.md) | 기능 명세 SSOT. 화면/API/DB/규칙/시나리오 | 기능 구현 전·중 |
| [ROADMAP.md](./ROADMAP.md) | Phase 0~3 단계별 진행 + 완료 조건 + KPI | 작업 우선순위 결정 |
| [DB_SHARING.md](./DB_SHARING.md) | zugzag↔game DB 공유 계약. schema 분리, RLS, Realtime publication | DB/마이그레이션 변경 전 |
| [DESIGN_PROMPT.md](./DESIGN_PROMPT.md) | Claude Design 등 디자인 도구에 입력할 프롬프트 모음 | 디자인 작업 시 |

## 빠른 컨텍스트

- **타겟**: 클라이밍 크루 (우리 크루부터 dogfooding → 다른 크루로 확장)
- **메인 경험**: 호스트가 즉석 랭크전(=session, kind=ranked)을 연다 → 참가자 모집 → 풀이 → 5초 안에 라이브 보드 반영 → 시즌 점수에 박제
- **부가 경험**: 평시 풀이(casual_open)는 본인 타임라인에 누적, 시즌 점수와 무관
- **기술 스택**: Next.js 16 App Router + Drizzle + Supabase (Realtime/Storage) + Vercel
- **인증**: zugzag NextAuth 세션을 `.zugzag.com` 쿠키로 공유
- **TV 모드**: display token으로 인증 없이 라이브 보드 풀스크린 (E5 SSE Proxy)
- **URL**: `games.zugzag.com`

## 의사결정 우선순위

```
PRINCIPLES > FEATURE_SPEC > ROADMAP > DB_SHARING
(상위 문서가 하위 문서를 이긴다)
```

기능 추가 요청이 들어오면:
1. `PRINCIPLES`의 5원칙 + Non-Goals 위배하지 않는지
2. `FEATURE_SPEC`의 기존 모델/API와 충돌 없는지
3. `ROADMAP`의 현 Phase 정의에 부합하는지
4. `DB_SHARING`의 schema/권한 정책을 깨지 않는지
