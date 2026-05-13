# ZUGZAG-GAME 로드맵

> Phase 단위 진행. 각 Phase는 "이걸 못 하면 다음 Phase로 못 간다"는 정의를 가진다.
> 우리 크루로 dogfooding → 검증 → 확장의 순서를 어기지 않는다.
>
> **이 문서는 인덱스다.** 상세 체크리스트는 `docs/phases/phase-{0..3}.md` 참조.

---

## Phase 0 — 셋업 (2-2.5주)

**완료 조건**: 로컬에서 `games.zugzag.com`(또는 localhost) 접속 시 zugzag 로그인 세션으로 빈 게임 홈을 본다.

핵심 작업: Next.js 16 부트스트랩, `games` schema + `zugzag_game` role, Realtime publication 등록, RLS 정책, NextAuth `.zugzag.com` 쿠키 공유 검증, 미러 schema 6개.

상세: [`phases/phase-0.md`](./phases/phase-0.md) (Phase 0 진입 전 명확화 P1 항목 포함 — T-M1/T-M2/T-MS1/T-I7/T-I8).

> Full Pivot 도입으로 lazy casual_open + first_send_only 재정의 + `sends.session_kind` denormalized + RLS 조정이 추가되어 1주 → 2-2.5주로 갱신 (Critic 2차 M-6).

---

## Phase 1 — MVP (4~6주, 우리 크루 dogfooding)

**완료 조건**: 우리 크루 멤버 N명이 한 시즌 동안 실제로 라이브 보드 보면서 풀이 기록을 쌓는다.

핵심 작업: 도메인 모델 마이그레이션, 운영자/멤버 화면 풀세트, `POST /api/sends` (session 결정 + score_snapshot 박제), 라이브 보드 Realtime + 5초 KPI, Cherry-picks 7개 (E1/E2/E3/E4/E5/E7/E8).

상세: [`phases/phase-1.md`](./phases/phase-1.md).

---

## Phase 2 — 정기 대회 & 팀전 (4주)

**완료 조건**: 우리 크루에서 ranked 세션 1회 + 팀전 1회를 라이브 보드 띄워놓고 진행한다.

핵심 작업: 자동 스케줄링, 팀전, 푸시, zugzag 본체 피드 발행 (T-I4), 인프라 부채 정리 (T-I1/I2/I3/I6), E6 PWA 큐 재검토, OG 보강.

상세: [`phases/phase-2.md`](./phases/phase-2.md).

---

## Phase 3 — 멀티 크루 & 자동화 (확장)

**완료 조건**: 다른 크루 1곳 이상이 자기네 시즌을 독립적으로 운영한다.

핵심 작업: 크루 대항전, 자동 배지, 의심 패턴 카드, 다국어, 통계 깊이.

상세: [`phases/phase-3.md`](./phases/phase-3.md).

---

## 측정 지표 (Phase 1 기준)

| 지표                         | 목표                              | 측정 방식                                       |
| ---------------------------- | --------------------------------- | ----------------------------------------------- |
| ranked session 완등 기록 수  | 우리 크루 N명 × 1주 × 평균 5건/주 | `games.sends WHERE session.kind='ranked'` count |
| casual_open 완등 기록 수     | 우리 크루 N명 × 4주 × 평균 10건   | 전체 sends                                      |
| 라이브 보드 사용 시간        | 1회 ranked 세션당 평균 30분       | 페이지뷰 + 활성 채널 시간                       |
| 첫 등록부터 첫 완등 기록까지 | 24시간 이내 (활성 멤버 80%)       | 이벤트 funnel                                   |
| 라이브 보드 반영 지연        | p95 5초 이내                      | 클라이언트 측정                                 |
