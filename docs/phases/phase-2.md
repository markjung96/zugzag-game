# Phase 2 — 정기 대회 & 팀전 (4주)

> **완료 조건**: 우리 크루에서 ranked 세션 1회 + 팀전 1회를 라이브 보드 띄워놓고 진행한다.

---

## 2.1 정기 대회 자동 스케줄링

- [ ] ranked 세션 자동 transition (`scheduled` → `live` → `closed`) — pg_cron 또는 Vercel Cron
- [ ] 세션 시작 5분 전 / 1분 전 푸시 알림 (zugzag `web-push` 인프라 활용)
- [ ] 세션 종료 자동 freeze + 우승자 카드

## 2.2 팀전

- [ ] `session_teams` UI — 운영자가 팀 N개 만들기 (name, color)
- [ ] 멤버 참가 시 팀 선택 (`session_participants.team_id`)
- [ ] 팀 점수 = 상위 N명 합산 (`policies.team_top_n`)
- [ ] 라이브 보드 팀 모드 — 팀별 색 그라데이션

## 2.3 푸시 알림 인프라

- [ ] 시즌 1위 추월당함 알림 (추월당한 사람에게 푸시)
- [ ] 본인 기록에 좋아요 (zugzag 피드 연동 후) — T-I4 본체 피드 발행 책임 분담 합의
- [ ] 푸시 토큰 관리 + opt-in/out

## 2.4 zugzag 본체 피드 발행 (T-I4)

- [ ] 옵션 결정: (i) game이 본체 API 호출 vs (ii) 본체가 `games.sends` Realtime 구독
- [ ] 양 팀 API 합의 + 인터페이스 명세
- [ ] 완등 이벤트 + 시즌 우승 이벤트 발행

## 2.5 인프라 부채 정리

- [ ] **T-I1** display_tokens cleanup cron — 만료 토큰 정리 (pg_cron)
- [ ] **T-I2** Rate limit Upstash Redis 전환 (in-memory → 분산)
- [ ] **T-I3** staging Supabase 환경 검토 (~$25/월)
- [ ] **T-I6** Realtime publication row filter 동작 stable 시 server-side 필터링으로 migration

## 2.6 E6 재검토 (PWA 오프라인 큐, D12 reversal로 deferred)

- [ ] Phase 1 dogfooding 끊김 빈도 데이터 분석
- [ ] 도입 결정 시: `games.send_attempts (idempotency_key, send_id, created_at)` 별도 테이블 패턴으로 idempotency vs partial unique 충돌 회피
- [ ] Service Worker 큐 + 재시도 정책

## 2.7 OG 시즌 종료 보강

- [ ] T-M5 결정 반영: ranked 챔피언 + casual MVP 둘 다 OG 카드 (옵션 A) 또는 개인 카드 본인 total send 기준 (옵션 B)
- [ ] 공유 클릭 추적 (다른 크루 viral 시드 가설 검증)

---

## Phase 3 진입 조건

- [ ] ranked 세션 1회 + 팀전 1회 라이브 보드 운영 완료
- [ ] 푸시 알림 deliverability 80%+
- [ ] 본체 피드 연동 안정성 1주 무장애
