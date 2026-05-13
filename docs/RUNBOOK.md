# ZUGZAG-GAME 운영 RUNBOOK

> 사고/장애 시 우왕좌왕하지 않게 시나리오별 절차를 박아둔 문서. **T-I5**.
> Phase 1 dogfooding 종료 시 양심제 신뢰성 정성 retrospective도 이 문서에 추가.

---

## 시나리오 1: 라이브 보드가 5초 이내에 안 뜬다

**증상**: 완등 → 보드 반영까지 10초 이상. 또는 새 send가 전혀 안 보임.
**SLO 위반**: P1 5초 KPI p95 위반.

### 1단계 — 클라이언트 측정 로그 확인
- 브라우저 콘솔에서 `realtime:games:sends:crew=*` 채널 status 확인
  - `SUBSCRIBED`이면 채널 OK → 서버/publication 문제
  - `CHANNEL_ERROR` / `TIMED_OUT`이면 클라이언트 측 연결 문제
- 클라이언트의 fallback fetch (1분 1회) 발화 여부 확인 → 발화하면 send 자체는 DB에 들어감

### 2단계 — Realtime publication 확인
```sql
SELECT schemaname, tablename FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime' AND schemaname = 'games';
```
- `sends`, `send_revisions`, `sessions`, `seasons` 4개 모두 보여야 함
- 누락되었다면 `db/setup/02-publication.sql` 재실행

### 3단계 — Supabase Realtime 인프라
- Supabase 대시보드 → Settings → Realtime 활성화 확인
- Realtime 로그에서 connection drop / channel error 패턴 확인
- WAL replication slot 상태 (`pg_replication_slots`) 확인

### 4단계 — 클라이언트 fallback fetch 활성화
- 임시 mitigation: 클라이언트 polling 주기를 1분 → 10초로 좁힘 (env flag로 토글)
- 사용자에겐 "잠시 새로고침이 자주 일어날 수 있어요" 배너

### 회복 후
- 라이브 보드 측정 로그 archive (`p95`, `p99` 기록)
- 원인이 publication 누락이었다면 setup SQL 재실행 절차 보강
- 원인이 Supabase 인프라였다면 Supabase 상태 페이지 링크 RUNBOOK에 추가

---

## 시나리오 2: `POST /api/sends` 5xx 폭증

**증상**: Vercel 로그에서 `/api/sends` 5xx 비율 1% 초과. 클라이언트 토스트 "기록 실패".

### 1단계 — 에러 타입 분류 (custom `GameError` 계층)
- `PolicyError` (color_scores 매핑 누락) → 정책 데이터 정합 깨짐. 시즌 정책 확인:
  ```sql
  SELECT id, name, color_scores FROM games.scoring_policies WHERE id = '...';
  ```
  → `problem.provider_color_id`가 키에 없으면 운영자 화면에서 정책 보강 필요. **G1 fix (D15) — POST /api/problems 상위에서 검증해야** 함. 누락 검출되면 그 검증이 우회됐다는 뜻.

- `RLSError` (auth.uid()와 user_id 불일치) → NextAuth 세션과 supabase auth 동기화 깨짐. T-I8 패턴 재검토.

- `RateLimitError` → 정상. 클라이언트가 60초 30회 초과. 사용자에게 안내 토스트.

- 기타 `GameError` 미분류 → unhandled. 즉시 stack trace 확인.

### 2단계 — DB 측면
- `games.sends` partial UNIQUE 위반?
  - `PARTIAL UNIQUE (user_id, problem_id, season_id) WHERE cancelled_at IS NULL AND session_kind='ranked'`
  - 같은 ranked에서 같은 문제 두 번 → first_send_only=true 정상. 클라이언트 UX에서 막아야 (이미 완등 표시).
- `casual_open_one_per_day` 충돌?
  - `INSERT ... ON CONFLICT DO NOTHING` 분기 누락. 코드 검토.

### 3단계 — RLS 정책 변경 직후라면
- 최근 `db/setup/03-rls-policies.sql` 변경 PR 확인
- 일시적 롤백: 변경 직전 정책으로 복원 (Supabase 대시보드 SQL Editor)
- 정책 변경 시 staging에서 검증 후 prod 적용 절차 강화 (T-I3 staging 환경 부재가 원인이면 우선순위 상승)

### 4단계 — Rate limit 인프라
- Phase 1 in-memory rate limit는 Vercel cold start 시 reset. 폭증이 cold start와 상관관계면 Phase 2 Upstash (T-I2) 우선순위 상승.

### 회복 후
- 5xx 에러 분류 통계를 retrospective에 첨부
- `GameError` 계층에 새 케이스가 있으면 추가

---

## 시나리오 3: TV `/tv/{token}` 빈 화면

**증상**: 운영자가 발급한 token URL을 TV에서 띄웠는데 leaderboard가 비어 있거나 멈춰 있음.

### 1단계 — token 유효성
- `games.display_tokens` 조회:
  ```sql
  SELECT id, token, season_id, session_id, crew_id, expires_at, revoked_at
    FROM games.display_tokens WHERE token = '<paste-token>';
  ```
- `expires_at < now()` → 만료. 운영자가 새 token 발급해야.
- `revoked_at IS NOT NULL` → revoke됨. 새 token 발급.
- row 없음 → URL 잘못 입력. 운영자 화면에서 다시 복사.

### 2단계 — SSE Proxy 서버 상태
- Vercel Edge Functions 로그에서 `/api/tv/stream` 또는 `/tv/[token]/route.ts` 호출 로그 확인
- 토큰 검증 통과 → Realtime 구독 시작 로그 있는지
- service-role로 `games.sends` SELECT 가능한지 (테이블에 데이터가 있는데도 빈 화면이면 RLS bypass가 안 됐을 수 있음 — service-role client 사용 확인)

### 3단계 — Realtime 끊김
- TV 디바이스 네트워크 확인 (암장 wifi 끊김 흔함)
- SSE는 자동 재연결 동작 — 로그에서 reconnect 패턴 확인
- TV 브라우저 캐시/쿠키 → fresh URL로 재시도

### 4단계 — 보드 선택 정책 (T-MS2)
- `token.scope: 'season' | 'session'` 발급 시 잘못 선택?
  - season scope인데 ranked session 진행 중이면 다른 보드를 보고 있을 수 있음
  - 운영자 화면에서 token이 가리키는 보드 명확히 표시

### 회복 후
- 끊김 빈도가 잦으면 Phase 2 E6 PWA 재검토 (오프라인 큐 우선순위)
- TV 모드 모니터링: 현재 `/tv/{token}` 접속 중인 디바이스 수 표시 (DESIGN_PROMPT P8 §3)

---

## 양심제 신뢰성 retrospective (Phase 1 dogfooding 종료 시)

dogfooding 종료 후 작성. 정성 평가 + 정량 신호:

- 취소율 추이 (`send_revisions WHERE action='cancel'` / 전체 sends)
- 의심 패턴 카드 (T-D2)로 잡았어야 할 케이스가 발생했나
- 멤버 인터뷰: "혹시 누군가 부풀린 기록이 있다고 느꼈나"
- P2 양심제 원칙 유지 여부 결정 → Phase 3 영상 인증/심사 도입 여부 input

기록 위치: 이 RUNBOOK 하단에 dated section 추가.
