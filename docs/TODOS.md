# ZUGZAG-GAME TODOS

> `/plan-ceo-review` 2026-05-13 결과 박혀나온 deferred 항목 + Critic 2차 findings 중 implementation 시점에 결정/수정해야 할 항목.
> CRITICAL 3개는 이미 spec에 박혔으므로 여기 없음 (FEATURE_SPEC.md / DB_SHARING.md / ROADMAP.md 참조).

---

## Phase 1 implementation 진입 전 명확화

### T-M1. casual_open 자정 cutover 정책 명시
- **What**: `casual_open` session의 "1 per crew per day" 기준을 server `created_at::date Asia/Seoul`로 박는다. 23:58 모달 → 00:01 submit이면 다음 날 casual_open에 묶이도록.
- **Why**: dogfooding에서 야간 빌더링 자주. cutover 모호하면 KPI 비교 깨짐.
- **How**: `sessions.starts_at`을 `now() AT TIME ZONE 'Asia/Seoul'`로 박고, UNIQUE index의 `(starts_at::date)`도 같은 timezone으로.
- **Effort**: S
- **Priority**: P1 (Phase 0)

### T-M2. Ranked session close 중 사용자 모달 race 핸들링
- **What**: 호스트가 `POST /api/sessions/{id}/close` 실행 직후 다른 멤버가 POST `/api/sends`. 서버가 진행 중 ranked 조회 → 없음 → casual_open으로 fallback. 멤버는 "ranked로 푼다고 생각"했는데 casual.
- **Why**: P1 라이브 경험의 신뢰성. "방금까지 ranked였는데 갑자기 casual"은 양심제 신뢰 깸.
- **How**: 클라이언트가 모달 진입 시 session_id를 캐시 → POST에 함께 전송. 서버가 session.status=closed면 명시적 409 + 모달에 "랭크전이 방금 종료됐어요" 안내. (또는 close에 30s grace period — status='closing' 도입은 더 복잡하므로 grace 옵션 후순위.)
- **Effort**: S
- **Priority**: P1 (Phase 0)

### T-M4. E2 점수 프리뷰 casual 모드 UX
- **What**: SendRecordModal Step 3의 점수 프리뷰가 ranked session 안에서만 표시. casual에선 표시 안 됨 → 사용자가 "버그?"라고 인지 가능.
- **Why**: UX 일관성. ranked/casual 분리 자체는 명확하되 모달이 그것을 명시적으로 표현해야.
- **How**: casual 모드 모달에 별도 카피 ("기록만 남아요 — 시즌 점수에 안 들어가요") + 등록 보드의 active session badge로 ranked/casual 시각화.
- **Effort**: S
- **Priority**: P1 (Phase 1 design)

### T-M5. E4 OG 챔피언 (ranked 합산) viral 가설 검증
- **What**: 시즌 챔피언 OG가 ranked 합산만 반영하면 casual에서 많이 푼 사람은 OG 누락. SNS 공유 동기 작아질 가능성.
- **Why**: P5 "다른 크루로 확장" viral 시드 가설이 약화될 수 있음.
- **How**: 의도 확정:
  - (옵션 A) ranked 챔피언 + casual MVP("최다 풀이상") 둘 다 OG 카드 — 비용 거의 0.
  - (옵션 B) 개인 카드(E4 2종 중 한 종)는 본인 total send 기준으로 — 박제 의식 강화.
- **Effort**: S
- **Priority**: P2 (Phase 1 implementation)

### T-MS1. casual_open close 트리거 정책
- **What**: casual_open이 언제 close되는가? 자정 cron? 다음 첫 send 시 이전 자동 close?
- **Why**: 안 닫히면 `(crew_id, kind, date)` partial UNIQUE가 영원히 같은 row + closed 상태 추적 안 됨.
- **How**: 다음 첫 send 시 lazy로 어제 casual_open을 close 처리 (cron 없이). 또는 Supabase pg_cron으로 매일 00:00에 closed flag.
- **Effort**: S
- **Priority**: P1 (Phase 0, partial UNIQUE 의도 완성)

### T-MS2. TV `/tv/{token}` 보드 선택 정책
- **What**: ranked session 진행 중 vs 평시일 때 TV에 어느 보드 표시?
- **Why**: 베이스라인은 "시즌 라이브" 또는 "ranked 세션 라이브" 둘 다 가능. 호스트가 매번 선택? 자동 우선순위?
- **How**: token 발급 시 운영자가 명시 (`token.scope: 'season' | 'session'`). 또는 자동: ranked active 있으면 그것, 없으면 시즌.
- **Effort**: S
- **Priority**: P2 (Phase 1 E5)

### T-MS3. `first_send_only=false` 정책 모드의 Full Pivot 후 의미
- **What**: 정책 OFF면 partial UNIQUE 안 만듦 → ranked에서 같은 문제 다중 INSERT 정상. 그러나 casual은? casual은 항상 자유?
- **Why**: 베이스라인 §5는 "한 user가 한 problem 여러 번 INSERT 가능 (재완등 코멘트 등) but 점수는 first only"로 적혀 있음. casual에서도 같은 의미?
- **How**: `first_send_only=true` 시즌만 Phase 1에서 운영. `false` 모드는 Phase 2 검토.
- **Effort**: S (defer)
- **Priority**: P3 (Phase 2)

### T-MS4. session_participants와 casual_open
- **What**: `session_participants` PK는 (session_id, user_id). casual_open에선 participants row 없이 sends가 묶이는가?
- **Why**: 모델 일관성.
- **How**: casual_open은 participants 없이 sends만 묶임 (자동 join 가정). 또는 첫 send 시 자동 participants INSERT.
- **Effort**: S
- **Priority**: P2 (Phase 0~1)

---

## Phase 2+ 이연 항목 (cherry-pick 의식에서 deferred)

### T-D1. PWA 오프라인 send 큐잉 (E6 reversal로 defer)
- Phase 1 거절 (Critic 1차 C2). dogfooding 끊김 빈도 데이터 수집 후 결정.
- 별도 `games.send_attempts (idempotency_key, send_id, created_at)` 테이블 패턴 검토 (sends 충돌 회피).
- **Priority**: P2

### T-D2. 운영자 룰 기반 의심 패턴 카드
- Phase 3 ROADMAP. N 커진 후 시간/시간 통계 신호 정착되면 도입.
- **Priority**: P3

### T-D3. AR 오버레이, AI 자동 인식, 데일리 챌린지, "내 다음 목표" 추천, 햅틱
- 모두 cherry-pick 의식에서 skip 또는 deferred.
- **Priority**: P3

### T-D4. 점수 정책 marketplace
- 다른 크루 도입 시 viral 후보.
- **Priority**: P3

---

## 인프라/운영 부채

### T-I1. display_tokens cleanup cron
- 만료된 token 정리. Phase 1엔 manual cleanup, Phase 2에 pg_cron 또는 별도 job.
- **Priority**: P2

### T-I2. Rate limit 인프라 (Upstash Redis)
- Phase 1 in-memory rate limit, Phase 2에 Upstash 전환.
- **Priority**: P2

### T-I3. staging Supabase 환경 분리
- 현재 dev = local Supabase CLI만. 비용 ~$25/월로 staging 프로젝트 검토.
- **Priority**: P2

### T-I4. zugzag 본체 피드 발행 책임 분담 합의
- Phase 2 "본체 피드에 완등 이벤트 발행" — 양쪽 팀 API 합의 미정.
- 옵션: (i) game이 본체 API 호출, (ii) 본체가 games.sends Realtime 구독.
- **Priority**: P2

### T-I5. RUNBOOK.md 신설 — 3개 운영 시나리오
- "라이브 보드 지연", "POST /api/sends 5xx 폭증", "TV 빈 화면"
- 양심제 신뢰성 검증 정성 retrospective도 포함.
- **Priority**: P2

### T-I6. Realtime publication row filter 동작 확인
- C-C 결정은 클라이언트 필터링이지만, Supabase Realtime의 row filter (`WHERE kind='ranked'`)가 베타에서 stable 되면 server-side 필터링으로 migration. Phase 2 검토.
- **Priority**: P3

### T-I7. Cross-schema FK 정책 (zugzag user 삭제)
- `games.sends.user_id → public.users.id` ON DELETE 정책. 권장 RESTRICT (sends 보존). Drizzle migration 작성 시 확정.
- **Priority**: P1 (Phase 0)

### T-I8. NextAuth + Supabase RLS 연결 패턴 확정
- D14: "zugzag 본체와 같은 패턴" 결정. 본체 코드 확인 후 결정. Phase 0 첫날 작업.
- **Priority**: P1 (Phase 0)

---

## Critic Skeptic 우려 추적

### T-S1. KPI "casual:ranked 완등 비율" 추적
- "ranked-only 점수가 casual 노력 무가치하게 만들어 → 적게 푸는 패턴 학습 위험" 가설.
- Phase 1 dogfooding 종료 시 정량 검증. raw dashboard (E7)에 분리 sparkline으로 표시.
- **Priority**: P1 (E7 구현 시 함께)

### T-S2. PRINCIPLES P3 "단순한 점수, 유연한 정책" tension acknowledge
- ranked/casual 분리가 P3 약속과 표면적 충돌. PRINCIPLES.md P3에 한 줄 보강 권장 ("분리는 동기 강화용, 점수 산출 자체는 여전히 단순").
- **Priority**: P2

---

## 접근성 (DESIGN_PROMPT 미명시)

### T-A1. 접근성 절을 DESIGN_PROMPT.md에 신설
- 키보드 nav, 스크린 리더 ARIA, 명도 대비 4.5:1, 터치 타겟 60×60+.
- **Priority**: P2
