# ZUGZAG-GAME 기능 명세서 (Feature Specification)

> **이 문서는 기능의 Single Source of Truth.**
> 의사결정이 충돌하면 `PRINCIPLES.md`를 우선, 그 다음 이 문서를 기준으로 한다.
> 미구현 기능은 `ROADMAP.md` 참조.

**문서 버전**: 0.2 (Full Pivot — ranked vs casual_open sessions, Phase 1 기준)
**최종 수정일**: 2026-05-13

---

## 목차

1. [인증 & 세션](#1-인증--세션)
2. [시즌](#2-시즌)
3. [점수 정책](#3-점수-정책)
4. [세팅 회차 · 벽 · 문제](#4-세팅-회차--벽--문제)
5. [완등 기록 (Sends)](#5-완등-기록-sends)
6. [정기 대회 (Sessions)](#6-정기-대회-sessions)
7. [팀전 & 크루 대항전](#7-팀전--크루-대항전)
8. [랭킹](#8-랭킹)
9. [라이브 보드](#9-라이브-보드)
10. [알림](#10-알림)
11. [데이터 모델 통합](#11-데이터-모델-통합)
12. [시스템 제약 & 제한값](#12-시스템-제약--제한값)

---

## 1. 인증 & 세션

### 개요

zugzag-game은 **자체 로그인 화면이 없다.** zugzag 본체의 NextAuth 세션을 그대로 사용한다.

### 동작

- 미인증 상태로 `games.zugzag.com/*` 접근 시 → `https://zugzag.com/login?callbackUrl={원래 URL}` 로 302 리다이렉트
- 로그인 후 zugzag NextAuth가 쿠키 `domain=.zugzag.com`으로 세션 발급 → 양쪽 도메인에서 자동 인식
- 로그아웃은 zugzag 본체에서만 가능 (zugzag-game에는 로그아웃 버튼만 두고 zugzag의 logout 엔드포인트 호출)

### 권한 모델

zugzag의 `crew_members.role` 그대로 사용 (`leader`, `admin`, `member`).

| 액션                | leader | admin | member |
| ------------------- | ------ | ----- | ------ |
| 시즌/세션/정책 CRUD | ✅     | ✅    | ❌     |
| 벽/문제 등록        | ✅     | ✅    | ❌     |
| 본인 완등 기록      | ✅     | ✅    | ✅     |
| 본인 기록 수정/취소 | ✅     | ✅    | ✅     |
| 타인 기록 수정/취소 | ❌     | ❌    | ❌     |

### 비즈니스 규칙

- 게임 진입 시 사용자가 속한 크루 목록 조회 → 1개면 자동 진입, 다수면 선택 화면
- 크루 미가입 사용자는 안내 화면으로 라우팅 (zugzag로 가서 가입하라)

---

## 2. 시즌

### 개요

크루 단위의 상시 누적 점수 단위. 1크루 동시에 active 시즌 1개. 시즌 종료 시 점수 freeze.

### 화면

| 경로                          | 화면명           | 권한         | 설명                         |
| ----------------------------- | ---------------- | ------------ | ---------------------------- |
| `/c/{crew}/seasons`           | SeasonListPage   | crew member  | 과거+현재 시즌 목록          |
| `/c/{crew}/seasons/{id}`      | SeasonDetailPage | crew member  | 시즌 랭킹 + 기간 + 정책 요약 |
| `/c/{crew}/seasons/new`       | SeasonCreatePage | leader/admin | 시즌 생성                    |
| `/c/{crew}/seasons/{id}/edit` | SeasonEditPage   | leader/admin | 시즌 정보/정책 편집          |

### API

| Method | Path                          | 권한         | 설명                       |
| ------ | ----------------------------- | ------------ | -------------------------- |
| GET    | `/api/crews/{crewId}/seasons` | crew         | 시즌 목록                  |
| POST   | `/api/crews/{crewId}/seasons` | leader/admin | 시즌 생성                  |
| GET    | `/api/seasons/{id}`           | crew         | 시즌 상세                  |
| PATCH  | `/api/seasons/{id}`           | leader/admin | 시즌 정보 수정 (이름/기간) |
| POST   | `/api/seasons/{id}/close`     | leader/admin | 시즌 종료 (freeze)         |

### 비즈니스 규칙

- 시즌 생성 시 점수 정책 ID를 반드시 지정 (없으면 크루 기본 정책 자동 생성)
- 시즌 status: `draft` / `active` / `closed`
- 한 크루에 동시에 `active` 1개만 허용 (`UNIQUE(crew_id) WHERE status='active'` partial index)
- 시즌 종료 시 → 모든 `sends.score_snapshot` 그대로 보존, 새 send 차단
- 시즌 기간: 시작일 필수, 종료일은 선택 (자동 종료 옵션) 또는 수동 종료
- 삭제는 없음. 잘못 만들면 `draft` 상태에서 archive (soft delete)

---

## 3. 점수 정책

### 개요

색상(난이도) → 점수 매핑. 시즌 단위로 결정되며 시즌 시작 후엔 수정 불가.

### 데이터 구조

```jsonc
// scoring_policies.color_scores (jsonb)
{
  "first_send_only": true, // 같은 문제 1회만 인정
  "team_top_n": 5, // 팀전 시 상위 N명 합산 (null이면 전원)
  "color_scores": {
    // provider_color_id (UUID) → 점수
    "uuid-white": 10,
    "uuid-yellow": 20,
    "uuid-orange": 35,
    "uuid-green": 60,
    "uuid-blue": 95,
    "uuid-red": 140,
    "uuid-purple": 195,
    "uuid-black": 260,
  },
}
```

> 점수표 수치는 시즌 시작 시 크루장이 자유롭게 조정. 위는 권장 시드.

### 화면

| 경로                      | 화면명           | 권한         |
| ------------------------- | ---------------- | ------------ |
| `/c/{crew}/policies`      | PolicyListPage   | crew         |
| `/c/{crew}/policies/{id}` | PolicyDetailPage | crew         |
| `/c/{crew}/policies/new`  | PolicyCreatePage | leader/admin |

### API

| Method | Path                                   | 권한         | 설명                       |
| ------ | -------------------------------------- | ------------ | -------------------------- |
| GET    | `/api/crews/{crewId}/scoring-policies` | crew         | 정책 목록                  |
| POST   | `/api/crews/{crewId}/scoring-policies` | leader/admin | 정책 생성                  |
| GET    | `/api/scoring-policies/{id}`           | crew         | 정책 상세                  |
| PATCH  | `/api/scoring-policies/{id}`           | leader/admin | 정책 수정 (시즌 시작 전만) |

### 비즈니스 규칙

- 정책은 **크루가 자주 다니는 암장(provider)별로 색-점수 매핑 묶음**을 가진다. 한 정책이 여러 provider를 커버할 수 있음.
- 시즌 시작 후 정책 수정 불가 (immutable). 바꾸려면 새 정책 + 새 시즌.
- `first_send_only=true`일 때 같은 user + problem + season 조합으로 한 번만 점수 인정.

---

## 4. 세팅 회차 · 벽 · 문제

### 4.1 세팅 회차 (Setting Cycle)

암장의 세팅 일자 단위. 문제의 라이프사이클을 묶는 컨테이너.

| Method | Path                               | 권한         | 설명                        |
| ------ | ---------------------------------- | ------------ | --------------------------- |
| GET    | `/api/gyms/{gymId}/setting-cycles` | crew         | 회차 목록 (active+archived) |
| POST   | `/api/gyms/{gymId}/setting-cycles` | leader/admin | 새 회차 시작                |
| PATCH  | `/api/setting-cycles/{id}/close`   | leader/admin | 회차 종료                   |

**규칙**

- 한 gym에 동시에 active 회차 1개
- 회차 종료 시 그 회차의 모든 문제 자동 `archived` → 새 완등 기록 차단 (단, 이전 기록은 보존)

### 4.2 벽 (Wall)

| Method | Path                      | 권한         | 설명                       |
| ------ | ------------------------- | ------------ | -------------------------- |
| GET    | `/api/gyms/{gymId}/walls` | crew         | 벽 목록                    |
| POST   | `/api/gyms/{gymId}/walls` | leader/admin | 벽 등록                    |
| PATCH  | `/api/walls/{id}`         | leader/admin | 이름/정렬 수정             |
| DELETE | `/api/walls/{id}`         | leader/admin | 삭제 (활성 문제 없을 때만) |

### 4.3 문제 (Problem)

| Method | Path                                | 권한         | 설명                            |
| ------ | ----------------------------------- | ------------ | ------------------------------- |
| GET    | `/api/setting-cycles/{id}/problems` | crew         | 현재 회차 문제 목록             |
| POST   | `/api/setting-cycles/{id}/problems` | leader/admin | 문제 등록                       |
| PATCH  | `/api/problems/{id}`                | leader/admin | 색/번호/메모 수정               |
| DELETE | `/api/problems/{id}`                | leader/admin | 삭제 (해당 문제 send 없을 때만) |
| POST   | `/api/problems/{id}/photo`          | leader/admin | 사진 업로드 (Supabase Storage)  |

### 화면

| 경로                     | 화면명              | 권한         | 설명                                  |
| ------------------------ | ------------------- | ------------ | ------------------------------------- |
| `/c/{crew}/problems`     | ProblemBoardPage    | crew         | 벽 × 색 그리드. 회차 선택. 완등 표시. |
| `/c/{crew}/problems/new` | ProblemQuickAddPage | leader/admin | 30초 등록 UX (벽→색→번호→사진)        |

### 비즈니스 규칙

- 문제 식별: `(gym_id, wall_id, setting_cycle_id, provider_color_id, number)` UNIQUE
- 문제는 한 setting_cycle에 종속. 회차 바뀌면 새 문제 객체.
- 사진 업로드는 선택. 등록 시 즉시 board 반영.
- "30초 등록 UX": 벽 직전 선택 기억 → 색 탭 → 번호 자동 +1 → 저장. 사진은 선택.

---

## 5. 완등 기록 (Sends)

### 개요

**제품의 심장.** 모든 기록은 즉시 라이브 보드와 타임라인에 노출되며, 점수 스냅샷이 박제된다.

### API

| Method | Path                                      | 권한  | 설명                             |
| ------ | ----------------------------------------- | ----- | -------------------------------- |
| GET    | `/api/sends?seasonId=&userId=&problemId=` | crew  | 기록 목록 (필터)                 |
| POST   | `/api/sends`                              | crew  | 완등 기록                        |
| PATCH  | `/api/sends/{id}`                         | owner | 본인 기록 수정 (코멘트만)        |
| DELETE | `/api/sends/{id}`                         | owner | 본인 기록 취소 (soft, 이력 보존) |
| GET    | `/api/sends/{id}/revisions`               | crew  | 수정 이력                        |

### 화면

| 경로                 | 화면명        | 권한 |
| -------------------- | ------------- | ---- |
| `/c/{crew}/timeline` | TimelinePage  | crew |
| `/c/{crew}/me`       | MyRecordsPage | crew |

### 완등 기록 모달 (3탭)

1. 벽 선택 (직전 사용 기억)
2. 색 + 번호 탭 (해당 벽 active 회차 문제 그리드 표시)
3. 기록 — 시도 횟수(선택), 코멘트(선택) → 저장

### 비즈니스 규칙

- `POST /api/sends` 입력: `problem_id` + (선택) `attempt_count` + (선택) `comment`
- 서버 처리 순서:
  1. RLS 검증 (본인이 같은 크루)
  2. 현재 active season 조회 (한 크루에 1개)
  3. **Session 결정**:
     - 진행 중 ranked session 있으면 → 자동으로 그 session에 참가자 추가 후 `session_id` 채우기
     - ranked session 없으면 → casual_open 자동 생성 또는 기존 당일 casual_open 재사용 (lazy 생성), `session_id` 채우기
  4. 정책 조회 → `color_scores[problem.provider_color_id]` 으로 점수 산출
  5. `first_send_only` 정책이면 같은 problem 기존 send 확인 → 있으면 점수 0 (기록은 됨)
  6. `score_snapshot` 박제 후 INSERT (항상 `session_id` NOT NULL)
  7. Supabase Realtime이 자동 push → 라이브 보드 갱신
- 취소 시: `sends.cancelled_at` 채우고 `send_revisions`에 `action='cancel'` 기록. 랭킹 계산은 `cancelled_at IS NULL`만.
- 한 user가 한 problem을 여러 번 INSERT 가능 (재완등 코멘트 등) but 점수는 first only
- **시즌 점수 집계**: ranked session sends의 `score_snapshot` SUM만. casual sends 무관.

### 제한

| 항목           | 값                                   |
| -------------- | ------------------------------------ |
| Rate limit     | user당 60초에 30회 (POST /api/sends) |
| 코멘트 길이    | 0~200자                              |
| 시도 횟수      | 1~99                                 |
| 취소 가능 기간 | 무제한 (단 이력 보존)                |

---

## 6. 정기 대회 (Sessions)

### 개요

시즌 안에서 진행되는 컨테이너. 두 가지 종류:

- **Ranked**: 호스트(크루장)가 명시적 생성. starts_at, ends_at, team_mode 지정. 시즌 점수에 포함.
- **Casual_open**: 자동 생성. 매일 크루당 1개. 첫 send 발생 시 lazy로 생성. 점수는 기록되지만 시즌 집계 제외.

### 화면

| 경로                           | 화면명            | 권한         |
| ------------------------------ | ----------------- | ------------ |
| `/c/{crew}/sessions`           | SessionListPage   | crew         |
| `/c/{crew}/sessions/{id}`      | SessionDetailPage | crew         |
| `/c/{crew}/sessions/{id}/join` | SessionJoinPage   | crew         |
| `/c/{crew}/sessions/new`       | SessionCreatePage | leader/admin |

### API

| Method | Path                         | 권한         | 설명                       |
| ------ | ---------------------------- | ------------ | -------------------------- |
| GET    | `/api/seasons/{id}/sessions` | crew         | 세션 목록                  |
| POST   | `/api/seasons/{id}/sessions` | leader/admin | ranked 세션 생성           |
| GET    | `/api/sessions/{id}`         | crew         | 세션 상세                  |
| PATCH  | `/api/sessions/{id}`         | leader/admin | 세션 수정 (시작 전만)      |
| POST   | `/api/sessions/{id}/join`    | crew         | 참가 신청 (+ team_id 선택) |
| POST   | `/api/sessions/{id}/start`   | leader/admin | 즉시 시작                  |
| POST   | `/api/sessions/{id}/close`   | leader/admin | 즉시 종료 (freeze)         |

### 데이터

- `sessions.kind`: enum `'ranked'` / `'casual_open'`
  - `'ranked'`: starts_at, ends_at, team_mode 필수 (명시적 생성)
  - `'casual_open'`: starts_at만 설정 (첫 send 발생 시 자동), ends_at=None
- `sessions.status`: `scheduled` / `live` / `closed`
- `sessions.team_mode`: `individual` / `team` / `crew_vs_crew` (ranked만 사용)
- `sessions.gym_id`: 어느 암장에서 진행하는지 (해당 gym의 active setting cycle 문제만 인정)

### 비즈니스 규칙

- **Ranked 세션**: 호스트가 "지금 랭크전 시작" → 즉석 대회. 게임 홈 CTA로 진입. 시즌 점수에 포함.
- **Casual_open 세션**: 첫 send 발생 시 자동 생성. "평시 풀이 기록" 용도. 시즌 점수에 미포함.
- 세션 기간 안의 send만 세션 랭킹 집계.
- `closed` 후엔 send POST 시 세션엔 반영 안 됨.
- 세션 시작 5분 전 푸시 알림 (Phase 2)
- 카운트다운 표시: 라이브 보드에서 종료까지 남은 시간

---

## 7. 팀전 & 크루 대항전

### 7.1 팀전 (크루 내)

`sessions.team_mode='team'`일 때 활성.

- 운영자가 세션 생성 시 팀 N개 만들기 (`game_session_teams`: name, color)
- 멤버가 참가 시 팀 선택 → `session_participants.team_id` 채움
- 팀 점수 = 팀 멤버들의 세션 점수 중 **상위 N명 합산** (`policies.team_top_n`)

### 7.2 크루 대항전

`sessions.team_mode='crew_vs_crew'`일 때 활성. **Phase 3 기능.**

- 별도 `game_matches` 테이블로 두 크루 묶기 (`match_id`, `crew_a_id`, `crew_b_id`, 공유 정책, 기간)
- 양쪽 크루 멤버가 같은 라이브 보드를 본다
- 크루 점수 = 해당 크루 멤버의 세션 점수 중 상위 N명 합산
- 매치 종료 시 승자/무승부 표시

---

## 8. 랭킹

### 개요

같은 `games.sends` 테이블에서 aggregate 단위만 바꿔 4종 랭킹을 만든다. **시즌 개인 랭킹은 ranked session sends만 합산.**

| 랭킹      | 기준                                                                      | 화면                      |
| --------- | ------------------------------------------------------------------------- | ------------------------- |
| 시즌 개인 | `SUM(score) GROUP BY user_id WHERE season_id=? AND session.kind='ranked'` | `/c/{crew}/seasons/{id}`  |
| 세션 개인 | `SUM(score) GROUP BY user_id WHERE session_id=?`                          | `/c/{crew}/sessions/{id}` |
| 세션 팀   | `SUM(top N per team) WHERE session_id=?`                                  | 같은 페이지 탭            |
| 크루 대항 | `SUM(top N per crew) WHERE match_id=?`                                    | `/match/{id}` (Phase 3)   |

### 동순위 처리

- 점수 동률 시 → 첫 번째 완등 시각 빠른 쪽 우선
- 그래도 같으면 → 완등 개수 많은 쪽 우선

### API

| Method | Path                                                | 권한 |
| ------ | --------------------------------------------------- | ---- |
| GET    | `/api/seasons/{id}/rankings?type=individual`        | crew |
| GET    | `/api/sessions/{id}/rankings?type=individual\|team` | crew |

---

## 9. 라이브 보드

### 개요

**제품의 얼굴.** 암장 TV / 태블릿 풀스크린으로 띄우는 것을 1순위로 디자인.

### 화면

| 경로                           | 화면명               | 모드                                |
| ------------------------------ | -------------------- | ----------------------------------- |
| `/c/{crew}/live`               | LiveBoardPage        | 시즌 라이브 (active 시즌 자동 선택) |
| `/c/{crew}/sessions/{id}/live` | LiveSessionBoardPage | 세션 라이브 (카운트다운 포함)       |

### 구성 (위→아래)

1. 헤더: 크루 로고, 시즌/세션 이름, 카운트다운(세션 모드만)
2. **Top 10 leaderboard**: 순위, 닉네임, 점수, 마지막 완등 색상 도트
3. "방금 풀이" 토스트 카드: 새 send 발생 시 3초간 표시 (이름 + 색 + 벽+번호)
4. 가로 모드/16:9 자동 (CSS container query)

### 동작

- 진입 시 Supabase Realtime 채널 `realtime:games:sends:crew={crew_id}` 구독
- INSERT 이벤트 수신 → 클라이언트에서 랭킹 재계산 (점수만 합산하므로 가볍게)
- 5초 이내 반영 KPI
- 1분에 한 번 fallback fetch (네트워크 끊김 복구)

### 비주얼 톤

- 어두운 배경(클라이밍 짐의 조명에서도 잘 보이게)
- 대형 폰트
- 변화 시 부드러운 슬라이드/페이드 (사람이 따라갈 수 있는 속도)
- 1위 강조(왕관/하이라이트)

---

## 10. 알림

### MVP (Phase 1)

- 본인 완등 → 클라이언트 토스트만 (푸시 없음)

### Phase 2

zugzag의 web-push 인프라(`web-push` 패키지) 그대로 활용:

- 시즌 1위 추월당함 → 추월당한 사람에게 푸시
- 세션 시작 5분 전 / 1분 전 → 참가 신청자에게 푸시
- 본인 기록에 좋아요 (zugzag 피드 연동 후) → 푸시

### Phase 3

- 자동 배지 획득 알림
- 크루 대항전 시작/종료

---

## 11. 데이터 모델 통합

### 11.1 새로 만드는 `games.*` 테이블 (Drizzle 정의)

```ts
// games.seasons
{
  id: uuid PK
  crew_id: uuid (FK public.crews, NOT NULL)
  name: varchar(100) NOT NULL
  scoring_policy_id: uuid (FK games.scoring_policies, NOT NULL)
  starts_at: timestamptz NOT NULL
  ends_at: timestamptz (nullable)
  status: enum('draft','active','closed') DEFAULT 'draft'
  created_by: uuid (FK public.users)
  created_at: timestamptz DEFAULT now()
}
INDEX (crew_id, status)
PARTIAL UNIQUE (crew_id) WHERE status='active'

// games.scoring_policies
{
  id: uuid PK
  crew_id: uuid (FK public.crews, NOT NULL)
  name: varchar(100) NOT NULL
  color_scores: jsonb NOT NULL  // see §3
  is_locked: boolean DEFAULT false  // 시즌 시작 시 true
  created_by: uuid (FK public.users)
  created_at: timestamptz
}

// games.setting_cycles
{
  id: uuid PK
  gym_id: uuid (FK public.gyms, NOT NULL)
  name: varchar(100) NOT NULL  // "2026-05 세팅"
  started_at: timestamptz NOT NULL
  ended_at: timestamptz (nullable)
  status: enum('active','closed') DEFAULT 'active'
}
PARTIAL UNIQUE (gym_id) WHERE status='active'

// games.walls
{
  id: uuid PK
  gym_id: uuid (FK public.gyms, NOT NULL)
  name: varchar(50) NOT NULL  // "A벽", "메인볼더"
  sort_order: integer DEFAULT 0
}
UNIQUE (gym_id, name)

// games.problems
{
  id: uuid PK
  setting_cycle_id: uuid (FK games.setting_cycles, NOT NULL, CASCADE)
  wall_id: uuid (FK games.walls, NOT NULL)
  provider_color_id: uuid (FK public.provider_colors, NOT NULL)
  number: integer NOT NULL  // 해당 벽+색 내 번호
  position_memo: text (nullable)
  photo_url: text (nullable)
  status: enum('active','archived') DEFAULT 'active'
  created_by: uuid (FK public.users)
  created_at: timestamptz
}
UNIQUE (setting_cycle_id, wall_id, provider_color_id, number)

// games.sessions
{
  id: uuid PK
  season_id: uuid (FK games.seasons, NOT NULL)
  gym_id: uuid (FK public.gyms, NOT NULL)
  name: varchar(100) NOT NULL
  kind: enum('ranked','casual_open') DEFAULT 'ranked'  // 신설: ranked는 명시적, casual_open은 lazy 생성
  starts_at: timestamptz NOT NULL
  ends_at: timestamptz (nullable)  // casual_open은 NULL 가능
  status: enum('scheduled','live','closed') DEFAULT 'scheduled'
  team_mode: enum('individual','team','crew_vs_crew') DEFAULT 'individual'
  created_by: uuid (FK public.users)
  created_at: timestamptz
}
-- C-B fix: casual_open은 크루당 1일 1개 (race 회피)
CREATE UNIQUE INDEX casual_open_one_per_day
  ON games.sessions (crew_id, (starts_at::date))
  WHERE kind = 'casual_open' AND status != 'closed';
-- ranked는 무제한 (호스트가 원하는 만큼 동시 또는 순차 개최 가능)

// games.session_teams
{
  id: uuid PK
  session_id: uuid (FK games.sessions, CASCADE)
  name: varchar(50) NOT NULL
  color: varchar(7) NOT NULL  // #RRGGBB
}

// games.session_participants
{
  session_id: uuid (FK games.sessions, CASCADE)
  user_id: uuid (FK public.users)
  team_id: uuid (FK games.session_teams, nullable)
  joined_at: timestamptz DEFAULT now()
  PRIMARY KEY (session_id, user_id)
}

// games.sends  -- 핵심
{
  id: uuid PK
  user_id: uuid (FK public.users, NOT NULL)
  problem_id: uuid (FK games.problems, NOT NULL)
  season_id: uuid (FK games.seasons, NOT NULL)
  session_id: uuid (FK games.sessions, NOT NULL)  // 변경: 모든 send가 session에 묶임 (ranked 또는 casual_open)
  session_kind: enum('ranked','casual_open') NOT NULL  // C-A fix: denormalized from sessions.kind. trigger 또는 INSERT 시 채움. partial UNIQUE 필터링용 + Realtime payload에 자동 포함 (E3 카운터/M-3).
  score_snapshot: integer NOT NULL  // 그 시점 정책 적용 결과
  attempt_count: integer (nullable)
  comment: varchar(200) (nullable)
  created_at: timestamptz DEFAULT now() NOT NULL
  cancelled_at: timestamptz (nullable)
}
INDEX (season_id, user_id)
INDEX (session_id)
INDEX (problem_id, user_id)
PARTIAL UNIQUE (user_id, problem_id, season_id) WHERE cancelled_at IS NULL AND session_kind = 'ranked'
  -- C-A fix: ranked에만 first_send_only 적용. casual은 자유 INSERT (LoL 일반게임=자유 프랜티스).
  -- first_send_only=false 정책 시즌엔 이 UNIQUE를 만들지 않음.

// games.send_revisions
{
  id: uuid PK
  send_id: uuid (FK games.sends, CASCADE)
  action: enum('create','update','cancel','restore')
  before: jsonb (nullable)
  after: jsonb (nullable)
  reason: varchar(200) (nullable)
  by_user_id: uuid (FK public.users)
  at: timestamptz DEFAULT now()
}
-- service-role only INSERT 강제. RLS UPDATE/DELETE 거부 (append-only)

// games.display_tokens  -- 신설 (E5 TV 모드)
{
  id: uuid PK
  token: varchar(64) UNIQUE NOT NULL  // 랜덤 생성
  season_id: uuid (FK games.seasons, nullable)  // ranked session이 이 시즌의 것
  session_id: uuid (FK games.sessions, nullable)  // 또는 구체적 session (ranked만)
  crew_id: uuid (FK public.crews, NOT NULL)
  expires_at: timestamptz NOT NULL  // default 24h from now
  revoked_at: timestamptz (nullable)  // 운영자 즉시 취소 용도
  created_by: uuid (FK public.users)  // 토큰 생성자
  created_at: timestamptz DEFAULT now()
}
INDEX (token)
INDEX (crew_id, expires_at)
```

### 11.2 미러링하는 `public.*` 테이블 (read-only)

- `users` — id, name, nickname, image_url 만 필요
- `crews` — id, name, image_url, leader_id
- `crew_members` — crew_id, user_id, role
- `gyms` — id, name, address, provider_id
- `provider_colors` — id, provider_id, label, color_hex, sort_order
- `pass_providers` — id, name

상세 정의는 `DB_SHARING.md` 참조. **변경 금지.**

---

## 12. 시스템 제약 & 제한값

| 항목                        | 값                   | 근거                      |
| --------------------------- | -------------------- | ------------------------- |
| Send POST rate limit        | 60초당 30회 (user당) | 봇/오탭 방지              |
| 코멘트 길이                 | 0~200자              | DB varchar(200)           |
| 시도 횟수                   | 1~99                 | DB integer + check        |
| 한 크루 active 시즌         | 1개                  | partial unique            |
| 한 gym active setting cycle | 1개                  | partial unique            |
| 라이브 보드 반영 지연       | p95 5초              | Supabase Realtime         |
| 사진 업로드 크기            | 5 MB                 | Supabase Storage 정책     |
| 시즌 이름                   | 1~100자              | varchar(100)              |
| 문제 사진 형식              | JPEG, PNG, WebP      | MIME 검증                 |
| API maxDuration             | 10초 (기본)          | Next.js + Vercel          |
| Display token 만료          | 24시간 (기본)        | `/tv/{token}` 라우트 보안 |

---

## 부록 A. 사용자 시나리오 (해피 패스)

### A1. 크루장이 새 시즌을 연다

1. `/c/{crew}/seasons/new` 접속
2. 시즌 이름 "2026 5월 랭크전", 시작일 오늘, 종료일 6월 30일 입력
3. 정책 선택 → 기본 정책 자동 생성 (색별 점수표 시드 적용)
4. 생성 → status `draft`
5. 점수표 검토 후 `active` 전환 → 멤버 푸시(Phase 2)

### A2. 멤버가 문제를 완등한다

1. 암장 도착 → PWA 홈에 추가된 zugzag-game 열기
2. 라이브 보드(또는 문제 보드) 진입
3. "완등 기록" FAB 탭
4. 벽 선택 (이전 선택 기억) → 색 탭 → 번호 선택
5. 시도 횟수 "3" 입력 (선택), 코멘트 빈칸
6. 저장 → 토스트 "+95점! 시즌 3위"
7. 라이브 보드에 5초 안에 반영, 다른 사람들 화면에 "방금 풀이" 카드

### A3. 크루장이 정기 대회를 연다

1. `/c/{crew}/sessions/new`
2. 이름 "5월 4주차 토요 랭크전", 토요일 14:00~17:00, gym 선택, team_mode `team`
3. 팀 4개 만들기 (빨강팀/파랑팀/...)
4. 멤버에게 공유 → 멤버들이 `/sessions/{id}/join` 에서 팀 선택
5. 시작 시각 도래 → status `live` 자동 전환
6. 멤버들이 풀고, 라이브 보드를 TV에 띄움
7. 종료 시각 → 자동 freeze, 우승 팀 카드 표시
