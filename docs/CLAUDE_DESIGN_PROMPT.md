# Claude Design 프롬프트 — zugzag-game Phase 1

> **사용법**: 이 파일 전체를 [claude.ai/design](https://claude.ai/design)에 붙여넣는다.
> 추가로 첨부 권장: `docs/PRINCIPLES.md`, `docs/FEATURE_SPEC.md`, `docs/DESIGN.md` (토큰), `docs/DESIGN_PROMPT.md` (화면별 명세).
>
> Claude Design Opus 4.7는 **default house style이 warm cream / serif italic / terracotta**다. 우리 제품은 **클라이밍 짐 dark 게임 보드**라 정면 충돌. 아래 명시적 override가 필수.

---

# 0. 한 문장 요약 (모델 첫 인상)

**Korean climbing crew의 실시간 볼더링 랭크전 PWA — 짐의 어두운 조명에서 TV로 띄우는 라이브 보드가 제품의 얼굴. Strava의 신뢰감 + Apple Fitness 데이터 명료성 + LoL 일반/랭크 분리 모델. Vercel-style minimalism, Linear-style precision. 절대 Notion/Stripe-style 화이트 SaaS 아님.**

---

# 1. ⚠️ Claude Design Default Style 명시적 OVERRIDE

**금지 (Opus 4.7 기본값에서 모두 제거)**:

- ❌ Warm cream / off-white / beige 배경
- ❌ Serif display 폰트 (Garamond, Bodoni, Playfair 등)
- ❌ Italic word-accent
- ❌ Terracotta / amber / warm brown 액센트
- ❌ Editorial / hospitality 톤

**강제 (이걸로 교체)**:

- ✅ **Dark mode 전용** — `#0A0A0B` canvas, `#16161A` surface
- ✅ **Sans-serif 한국어 우선** — Pretendard (한글) + Inter (영문/숫자)
- ✅ **Roman, no italic** — italic 사용 금지 (강조는 weight + size로)
- ✅ **Cool red 액센트** — `#FF3B5C` (RANKED), `#FFD24A` (1위 그로우)
- ✅ **Esports / sports 신뢰감 톤** — Strava + Apple Fitness + LoL 일반/랭크 분리

---

# 2. 브랜드 정체성

```
제품명         : zugzag-game (zugzag 본체의 별도 sub-product)
타겟           : 클라이밍 크루 (한국 도심 짐 5-30명 단위)
핵심 경험      : 호스트가 즉석 랭크전 열기 → 멤버 모집 → 풀이 → 5초 안에 라이브 보드 반영 → 시즌 점수 박제
부가 경험      : 평시 풀이(casual)는 본인 타임라인 자산, 시즌 점수 무관
핵심 감정      : 경쟁의 짜릿함 + 크루의 응원 + 내 기록의 누적
URL            : games.zugzag.com
인증           : zugzag 본체 NextAuth 세션 공유 (자체 로그인 화면 없음)
```

**의사결정 우선순위**: 라이브 경험 > 데이터 정확성 > 운영 편의 > 시각적 화려함

---

# 3. 디자인 토큰 (정확히 이 값 사용)

## 3.1 Color

```
Background:
  bg.canvas        #0A0A0B   ← 페이지 최하단 (TV LiveBoard 전체)
  bg.canvas-2      #1A1A1F   ← 그라데이션 종점
  bg.surface       #16161A   ← 카드/모달/시트
  bg.surface-2     #1E1E24   ← 카드 위 카드
  bg.overlay       rgba(0,0,0,0.72)

Text:
  text.primary     #F4F4F5   ← 본문, 헤딩
  text.secondary   #A1A1AA   ← 보조, 메타
  text.tertiary    #71717A   ← hint

Accent:
  accent.ranked    #FF3B5C   ← RANKED badge, 시즌 점수, 1차 CTA
  accent.win       #FFD24A   ← 1위 그로우, 챔피언, 메달 금
  accent.silver    #D1D5DB
  accent.bronze    #CD7F32
  accent.alert     #EF4444   ← 에러, destructive
  accent.success   #22C55E   ← 성공 토스트

Climbing Holds (실제 홀드 색, 문제 chip 배경에만 사용):
  hold.white   #F8F9FA  (dark bg에서 1px outline #52525B 추가)
  hold.yellow  #FBBF24
  hold.orange  #FB923C
  hold.green   #22C55E
  hold.blue    #3B82F6
  hold.red     #EF4444
  hold.purple  #A855F7  ← UI chrome 절대 금지, 홀드 색만 허용
  hold.black   #1F2937  (dark bg에서 1px outline #71717A 추가)

Border:
  border.default   #27272A
  border.strong    #3F3F46
  border.focus     #FF3B5C  (focus ring 2px outline)
```

## 3.2 Typography

```
Display, body : Pretendard (한글) → fallback -apple-system, system-ui
Mono, numeric : Inter (영문/숫자) → fallback ui-monospace

Type scale:
  display-2xl  96 / 96 / 700   ← TV 1위 점수, E8 의식 카드 헤드라인
  display-xl   72 / 72 / 700   ← TV 카운트다운, OG 챔피언 점수
  display-lg   56 / 60 / 700   ← TV Top10 점수
  display-md   40 / 44 / 700   ← 시즌 헤더, 모달 hero 점수
  title-xl     28 / 32 / 700   ← 페이지 H1
  title-lg     22 / 28 / 600   ← 카드 헤딩
  title-md     18 / 24 / 600   ← 섹션 헤딩
  body-lg      17 / 24 / 400   ← 모바일 본문 default
  body-md      15 / 22 / 400   ← 데스크탑 본문 default
  body-sm      13 / 18 / 400   ← 캡션
  label-md     13 / 16 / 600   ← 버튼, badge
  label-sm     11 / 14 / 600   ← tag

규칙:
- 숫자는 항상 Inter (점수, 카운트다운, 등수)
- TV 화면은 최소 display-lg 이상으로 헤딩
- 모바일 본문 body-lg 이상
```

## 3.3 Spacing / Radius / Motion

```
Spacing (4px grid): 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128
Radius: 4 / 8 (버튼) / 16 (카드) / 24 (hero) / full (아바타, FAB, pill)
Motion: 150ms (hover) / 300ms ease-out (모달, leaderboard 슬라이드) / 500ms cubic-bezier(.2,.8,.2,1) (의식 카드)

Reduced-motion: 모든 motion → 0ms
```

## 3.4 Z-index

```
sticky 100 / fab 200 / dropdown 300 / modal 400 / toast 500 / tv-overlay 600
```

---

# 4. ⛔ AI Slop Blacklist (절대 금지 패턴)

이 11개 중 1개라도 등장하면 디자인 실패로 판단:

1. **보라/violet/indigo 그라데이션 배경** (UI chrome에서 — 홀드 색은 예외)
2. **3-column feature grid** with icon-in-colored-circle + bold title + 2-line description (전형적 SaaS 시그니처)
3. **Icons in colored circles** as section decoration (SaaS starter look)
4. **Centered everything** (모든 헤딩/설명/카드 `text-align: center`)
5. **Uniform bubbly border-radius** (모든 element에 같은 큰 radius)
6. **Decorative blobs / 둥둥 떠 있는 circles / wavy SVG dividers**
7. **Emoji as design elements** (🚀 헤딩, 이모지 bullet)
8. **Colored left-border on cards** (`border-left: 3px solid <accent>`)
9. **Generic hero copy** ("Welcome to...", "Unlock the power of...", "Your all-in-one...")
10. **Cookie-cutter rhythm** (hero → 3 features → testimonials → pricing → CTA)
11. **system-ui** as primary display font

추가 zugzag-game-specific 금지:

- ❌ "밝고 활기찬" 톤 (어두운 짐 환경 + 어두운 긴장감으로 강제)
- ❌ App UI를 stacked card 모음으로 (카드는 카드 자체가 인터랙션일 때만)
- ❌ 사진 위 텍스트 (LiveBoard, OG 모두 데이터 자체가 디자인)
- ❌ "사용해보세요" 같은 generic CTA (구체 액션 동사 사용: "지금 시작", "참가하기", "기록하기")

---

# 5. 화면 명세 (P1-P12 총 12 화면)

각 화면당: viewport / hierarchy / 핵심 elements / 상태(state) / 결정사항.

---

## P1. LiveBoardPage — TV 풀스크린 (제품의 얼굴, 1순위)

```
경로          : /c/{crew}/live  또는  /c/{crew}/sessions/{id}/live
viewport      : 16:9 가로 1920x1080+ (TV / 4K), 모바일은 P5 hero에서 압축 미리보기
hierarchy 위계:
  Tier 1 (5m 거리 가독): 1위 닉네임+점수 (display-2xl), 카운트다운 <5min일 때
  Tier 2 (2m 가독): Top 2-10 ranks (display-lg), "방금 풀이!" 토스트
  Tier 3 (호기심): 크루 로고, 시즌 이름, E3 누적 카운터, 활동 피드

레이아웃:
  헤더 (높이 12%):
    좌측 — 크루 로고 + 크루 이름 (title-md, text.secondary)
    중앙 — 시즌 이름 "2026 5월 랭크전" (title-xl, text.primary)
    우측 — 카운트다운 MM:SS (display-xl, accent.win when <5min)
    Session Kind Badge: 헤더 좌하 RANKED solid pill 또는 CASUAL outline pill

  본문:
    좌 65% — Top 10 leaderboard
      각 행: 순위 (display-md Inter), 아바타 (원형 96px), 닉네임 (title-lg), 점수 (display-md Inter), 마지막 완등 색 dot (24px)
      1위 행: 1.4배 + accent.win glow (elevation.glow-1st)
      변동 시 motion.base ease-out 슬라이드 (reduced-motion 시 즉시)

    우 35% — 활동 피드
      "방금 풀이!" 토스트 카드: 위에서 슬라이드 다운, 3s 후 fade out
      그 아래 정적 최근 10건 리스트
      활동 0건일 때: "첫 풀이를 기다리고 있어요" + 활성 멤버 N명 + 카운트다운 유지
      max 3 토스트 stack, FIFO replace on 4th

배경: 그라데이션 #0A0A0B → #1A1A1F + 미세한 noise texture
1위 영역: 은은한 #FFD24A glow

state 매트릭스:
  loading       — dark skeleton shimmer (3-layer rectangle)
  empty 0건     — 위 명시
  error SSE 끊김 — 우상단 작은 "재연결 중…" + auto-retry, 5초+ 시 inline notice
  success       — n/a (보드 자체)
  partial       — 일부만 로드된 상태 = 로드된 부분만 표시 + skeleton 나머지

아바타 privacy: default = 닉네임 이니셜 원 + crew color 배경. 사진은 user opt-in (settings).
```

---

## P2. ProblemBoardPage — 벽 × 색 그리드

```
경로          : /c/{crew}/problems
viewport      : 모바일 375-430 우선, 태블릿+ 그리드 확장
hierarchy:
  Tier 1: 회차 선택 dropdown + 현재 활성 회차 명
  Tier 2: 벽=row, 같은 벽의 active 문제를 색별 → 번호순 chip
  Tier 3: gym 선택 (멀티 짐 크루만)

칩:
  배경 = hold.{color} hex
  텍스트 = 번호 (Inter title-md 굵게)
  최소 크기: 60×60 (a11y.touch-target.game)
  완등한 문제: 우상단 체크 아이콘 + 80% opacity
  white/black 칩: outline 1px 추가

FAB: 우하단, "완등 기록" + (E1 prefill 있으면 작은 색 dot 표시), z.fab

state:
  loading: dark skeleton rectangles per 행
  empty: "이번 세팅 문제가 아직 없어요" + (leader면 "새 회차 시작" CTA, member면 "크루장에게 알리기")
  error: inline "데이터 로드 실패 — 새로고침" 버튼

dark + light 둘 다 (실외 야외 가능). a11y: 색맹 모드 = 색 외에 번호+패턴 식별 강제.
```

---

## P3. SendRecordModal — 3탭 핵심 UX (30초 등록)

```
용도          : 손에 초크 묻은 채 30초 안에 완등 기록
viewport      : 모바일 풀스크린 모달 / 태블릿+ bottom sheet
3 단계 wizard:

Step 1 — 벽 선택:
  그리드 2-3열, 카드 ≥100×100
  E1 prefill 있으면 직전 벽 pre-select + 800ms 후 자동 Step 2 진행
  step indicator 하단에 progress (1/3 → 2/3 → 3/3) 항상 표시
  "← 다른 벽" 버튼으로 되돌리기 가능

Step 2 — 색/번호 선택:
  상단 가로 스크롤 색 탭 (큰 원 또는 사각형, 실제 hold.{color})
  본문: 그 색의 active 문제 번호들 큰 그리드, 번호 ≥60×60
  "이미 완등" 회색 + 체크
  E1 prefill 있으면 last_number+1 pre-select (없으면 silent fallback)

Step 3 — 기록:
  ⚡ 상단 고정 Session Kind Badge (RANKED 또는 CASUAL)
  선택 문제 카드 (벽/색/번호) 요약
  시도 횟수 stepper 1-99 (선택, skip 가능 강조)
  코멘트 (선택, 200자), placeholder "한 마디 남기기 (선택)"

  ⚡ 점수 미리보기 분기 (CRITICAL — 거짓말 금지):
    [RANKED 모드]
      display-md "+95점"
      body-md "시즌 1240 → 1335" + "3위 → 2위"
      stale (>30s) 시: "예상 +95점" + 작은 노란 dot
      offline 시: 점수 라인 숨김 + body-sm "기록 후 점수 갱신됨"

    [CASUAL 모드]
      "기록만 남아요 — 시즌 점수에 미반영"
      "오늘 누적 N건째 풀이"
      점수 미리보기 없음

  메인 CTA: "기록하기" full width 56px height
    RANKED 모드 = bg accent.ranked
    CASUAL 모드 = bg.surface-2 + border.strong outline

전환:
  단계 간 슬라이드 (motion.base, reduced-motion 시 즉시)
  뒤로 가기 명확 (chevron 좌상)

성공 시:
  토스트 "+95점!" (RANKED) 또는 "오늘 5건째 풀이 기록!" (CASUAL)
  라이트 햅틱

state:
  loading post: 모달 inline spinner + CTA 비활성
  error network: toast "기록 실패 — 다시 시도" 8s + 재시도 버튼 + 모달 유지 + localStorage last-attempt 보존
  T-M2 race (호스트가 session close 직후 다른 멤버 send): 서버 409 → 모달 inline "랭크전이 방금 종료됐어요. casual로 기록할까요?" 분기
```

---

## P4. SeasonDetailPage — 시즌 랭킹 (개인)

```
경로          : /c/{crew}/seasons/{id}
viewport      : 모바일 single column / 태블릿+ side-by-side
hierarchy: 랭킹 리스트가 주인공 (codex 권고 — "내 카드"가 주인공이면 경쟁 긴장 죽음)

상단 (얇은 스트립, 카드 X):
  시즌 이름, 기간 (D-N), status badge
  내 한 줄: title-md "2위, 1335점, 14완등" + sparkline (성장 곡선, 14일)

본문:
  전체 랭킹 리스트 (주인공)
    1-3위 메달 (accent.win/silver/bronze 그라데이션)
    각 행: 순위 / 아바타 / 닉네임 / 점수 / 완등 / 마지막 풀이 색
    행 탭 → 그 사람 풀이 타임라인

하단 sticky (내 위치 화면 밖일 때만):
  body-sm 1줄 바 "내 위치: 12위, 위 11위와 -85점"

탭 (sticky 상단):
  개인 (default) / 팀 (시즌에 팀 정보 있을 때만, 없으면 탭 자체 숨김)

시즌 종료 시:
  맨 아래 "내 카드 공유" CTA → P11 OG 개인 카드 + 공유 sheet

state:
  loading: 행 5개 skeleton
  empty (Day 1 0건): "첫 풀이를 시작해보세요" + "완등 기록" inline CTA
  error: "랭킹 로드 실패" + 재시도
```

---

## P5. GameHomePage — State Machine Home (CRITICAL — 카드 dashboard 금지)

```
경로          : /c/{crew}  또는  /games (자동 redirect)
viewport      : 모바일 single column (메인 hero 우선)
hierarchy: 한 순간 한 hero만. 6개 zone 동시 표시 금지.

⚡ Hero 우선순위 결정 트리 (한 hero만 표시):
  1) live ranked 진행 중 + 멤버 미참가
     → "X분 남음, 참가하기" (display-md 카운트다운, accent.ranked CTA)
  2) live ranked 진행 중 + 이미 참가
     → "라이브 보드 보기" + 내 현재 순위 1줄
  3) ranked 없음 + 시즌 active + leader
     → "즉석 랭크전 열기" CTA (P7 모달 트리거)
  4) ranked 없음 + 시즌 active + member
     → "내 시즌 N위, X점" 1줄 + sparkline + 이번주 누적
  5) 시즌 active + 멤버 첫 풀이 0건
     → "첫 문제를 풀어보세요" + "완등 기록" inline CTA
  6) 시즌 없음 + leader
     → "첫 시즌을 만들어보세요" CTA
  7) 시즌 없음 + member
     → "X일 후 시즌이 시작돼요" (다음 시즌 명시되면)
  8) 다수 크루 가입 사용자 첫 진입
     → "어느 크루?" 크루 선택 inline picker (sub-section)
  9) 크루 미가입 사용자
     → 풀스크린 "zugzag로 가서 크루에 가입하세요" + zugzag 본체 link

Hero 아래 (subordinate, 항상 작게):
  Quick action 2개 inline button — "완등 기록" / "문제 보드"
  E3 누적 카운터 (ranked만) body-sm 1줄 "이번 시즌 234건 완등"

하단 — 최근 활동 피드 (scroll-fold 아래):
  우리 크루원 최근 5건, 카드 작게
  각 카드: 아바타 + Session Kind Badge + 닉네임 + "B벽 노란 #12" + 점수 + 시간

⚡ FAB:
  bottom-right sticky "완등 기록" (z.fab)
  scroll에 관계없이 항상 표시
  Home + ProblemBoard 화면에만 노출 (Live, Me 화면엔 없음)

⚡ PWA 하단 탭바 4개 (Home / Board / Live / Me):
  z.sticky, 각 56px height, label + icon (icon은 단순 line, 컬러 채움 X)
  Live 탭은 ranked 진행 중이면 작은 RANKED dot 배지

state:
  loading: hero skeleton + quick action skeleton + 피드 skeleton
  empty: 위 결정 트리에 모든 분기 포함
  error: 각 zone 별 fallback ("로드 실패 — 새로고침")
```

---

## P6. SeasonCreatePage — 단일 선형 폼 (codex 권고)

```
경로          : /c/{crew}/seasons/new
viewport      : 모바일 단계별 / 데스크탑 단일 폼 + 우측 sticky 정책 요약
hierarchy: 단일 선형, 카드 모음 X

폼 (linear, 위→아래):
  1. 시즌 이름 (필수, 1-100자)
  2. 시작일 (필수, 기본=오늘)
  3. 종료일 (선택, datepicker, 없으면 수동 종료)
  4. 점수 정책:
     - 기존 정책 dropdown (이전 시즌 사용)
     - 또는 "새로 만들기" → 인라인 색-점수 매핑 에디터
  5. 옵션:
     - first_send_only 토글 (default ON)
     - team_top_n stepper (default 5)

색-점수 매핑 에디터 (4번 새로 만들기 시 inline 확장):
  provider별 탭 (가로 스크롤, 짐 1개면 탭 X)
  각 hold.{color} 라벨 옆에 숫자 input (placeholder X, default value 명시)
  색 배경 위 텍스트 명도 자동 보정 (hold.white/black은 outline)

데스크탑 우측 sticky:
  현재 입력값 정책 요약 카드 (실시간 업데이트)
  "8색 매핑 완료, first_send_only ON, 상위 5명 합산"

푸터:
  "초안으로 저장" (secondary) + "시작하기" (accent.ranked)
  "시작하기" 누르면 정책 lock + active 전환 + 확인 다이얼로그

state:
  loading: 폼 skeleton
  error: inline 필드별 에러
  success: 토스트 "시즌 시작!" + auto-redirect to P4
```

---

## P7. QuickRankedSession — 바텀시트 모달 (어두운 긴장감, codex 권고)

```
용도          : "즉석 랭크전 열기" 30초 UX
viewport      : 모바일 + 태블릿 = bottom sheet (높이 75%), 데스크탑 = 우측 drawer
hierarchy: 단일 1차 CTA "지금 시작", 모든 부속 입력 default 채워짐

⚡ 톤 override (DESIGN_PROMPT 원본 "밝고 활기찬"은 잘못 — 무시):
  → "어두운 긴장감"
  → 배경 bg.canvas 유지, accent.ranked로 카운트다운 강조
  → 이벤트 프로모션 팝업 절대 X

폼 (모두 default 채워진 상태로 모달 진입):
  1. 세션 이름 (자동 "2026-05-13 현장 랭크전", inline editable)
  2. 시간: "지금 ~ 2시간 뒤" 빠른 슬라이더 (1h / 2h / 3h preset chip)
  3. 팀 모드: 개인 (default) / 팀 / 크루 대항 — segmented control 가로 3칸
  4. 팀 모드 선택 시 팀 N개 + 색상 inline 확장

⚡ TV 옵션 (CRITICAL — Path B 단축):
  토글 "☐ TV에서 공공 공유" (default ON)
  → ON일 때 "지금 시작" 누르면 자동 display_token 발급

액션:
  1차 — display-md "지금 시작" full width 56px (accent.ranked)
  2차 — body-md text-only "5분 뒤 예약"

성공 화면 (모달 그대로 transform):
  display-lg "시작!"
  TV 옵션 ON이면:
    큰 QR 코드 (≥240px) 중앙
    URL text 아래 "복사" 버튼
    body-md "이 화면을 TV로 가서 띄우세요"
    "닫기" 클릭 시 /sessions/{id}/live로 자동 이동

state:
  loading post: CTA 비활성 + spinner
  error: inline "세션 생성 실패 — 다시 시도"
```

---

## P8. TVTokenGeneratePage — 평시 TV 모드 발급 (P7과 분리)

```
경로          : /c/{crew}/admin/seasons/{id}/tv  또는  /c/{crew}/admin/sessions/{id}/tv
viewport      : 데스크탑 우선, 태블릿 가능
hierarchy: 발급 panel (좌측 큰) + 토큰 table (우측 작은)
  → P7의 TV 옵션은 자동 발급 / P8은 평시 시즌 보드 TV 발급

좌측 큰 발급 panel (60% width):
  scope 선택 — radio "시즌 전체" / "이 세션" (P7에서 진입했으면 session pre-select)
  expires_at — preset chip "24시간 / 7일 / 30일"
  큰 "발급" CTA (display-md, accent.ranked)
  발급 결과 inline:
    QR ≥240px 중앙
    URL text 아래 "복사" + "QR 다운로드" 버튼
    body-md "이 URL을 TV에 띄우세요"

우측 토큰 table (40% width):
  활성 토큰 list
  각 행: scope / 생성일 / 만료까지 / "즉시 취소" (alert 색)
  취소 시 confirm dialog

state:
  loading: 발급 panel skeleton
  empty (활성 토큰 0): "발급된 TV URL이 없어요"
  error revoke: "취소 실패 — 다시 시도"
```

---

## P9. AdminDashboardPage — Raw 데이터, KPI strip 우선

```
경로          : /c/{crew}/admin/dashboard
viewport      : 데스크탑 우선
hierarchy: 상단 KPI strip > sparkline > CSV > raw table

상단 — KPI strip (3칸 한 줄):
  display-md 숫자 + body-sm 라벨
  ① 오늘 ranked   ② 오늘 casual   ③ 이번주 누적
  각 칸 우측 작은 변화량 chip (전일 대비, +/− body-sm)

중단 — 시간대별 완등 분포 sparkline:
  0-23시 막대 차트 (ranked solid + casual outline 색 분리)
  높이 80px, 폭 100%

CSV 다운로드:
  body-md 1줄 + outline 버튼 "CSV 다운로드 (이번 시즌 전체)"
  schema lock: user_name(닉네임) / problem_id(문제ID) / color(색) / score(점수) / session_kind(랭크/캐주얼) / created_at(시각) / comment(코멘트)

하단 — 사용자별 분포 table:
  닉네임 / 완등 수 / 점수 합계 (Inter)
  sortable column header

state:
  loading: KPI strip skeleton + sparkline shimmer + table 5행 skeleton
  empty (Day 1 0 sends): KPI 0/0/0 + "데이터가 쌓이면 표시됩니다" placeholder + 시즌 시작 N일째 표시
  error: 각 zone 별 fallback
```

---

## P10. TVDisplayPage — `/tv/{token}` 9-state Matrix (CRITICAL, 신설)

```
경로          : /tv/{token}  (auth bypass, display token 검증)
viewport      : 16:9 가로 1920x1080+ TV ONLY
hierarchy: P1 LiveBoard와 동일한 시각 시스템 + 상태별 fallback

기본 (live)  → P1 LiveBoard 그대로 + 헤더 우측 작은 "TV mode" badge

9 state matrix:
  pre-session         (token 발급됐으나 세션 시작 전):
    풀스크린 "곧 시작합니다" + 세션 이름 + display-xl 카운트다운
    배경 bg.canvas + accent.win subtle pulse

  live                : P1 LiveBoard 그대로

  between-sessions    (이전 ranked 종료, 새 세션 대기):
    풀스크린 "다음 랭크전을 기다리는 중" + 마지막 세션 챔피언 카드 (P11 미니)

  ceremony            (시즌 status 변경 감지, E8):
    풀스크린 5초 overlay (z.tv-overlay)
    "🏆 2026 5월 랭크전 종료!" + 챔피언 닉네임 (display-2xl) + 점수 (display-xl)
    motion.slow fade in/out
    종료 후 → archived season leaderboard (read-only, P1 형식)
    새 ranked 시작 감지 시 auto-switch live

  expired (token)     :
    풀스크린 "TV 모드 만료" + body-lg "운영자에게 새 URL 요청" + 크루 로고만
    배경 bg.canvas, 무채색 톤

  revoked (token)     :
    풀스크린 "TV 접속이 취소되었습니다" + 크루 로고
    배경 bg.canvas, 무채색

  SSE-disconnected    :
    P1 보드 + 우상단 작은 "재연결 중…" pill (5s 후 fallback fetch trigger)
    auto-retry, motion.fast pulse

  no-data             :
    P1 헤더는 표시 + 본문 "첫 풀이를 기다리는 중" + 세션 정보
    leaderboard 영역 비움 + 활성 멤버 N명 표시

  error generic       :
    풀스크린 "잠시 문제가 있어요" + 크루 로고 + body-sm 에러 코드
```

---

## P11. OG ImageCards — 시즌 종료 SNS 공유 (CRITICAL viral 시드)

```
용도          : 시즌 종료 후 자동 생성 → SNS 공유
viewport      : 1200x630 (OG image standard ratio)
hierarchy: 숫자 중심 포스터 (codex 권고 — "사진 위 텍스트" 절대 금지)

⚡ 두 종류:

(a) 챔피언 카드 — 시즌 1위만 자동 생성:
  배경: bg.canvas + accent.win subtle radial glow 좌상
  좌상: 작은 ZUGZAG GAME wordmark (label-md)
  중앙 hero:
    body-md text.secondary "2026 5월 랭크전 챔피언"
    display-2xl 닉네임 (accent.win text)
    display-xl 점수 (Inter)
  우하: 크루 로고 + 크루명 (body-md)
  하단 가로 띠: 시즌에 사용된 hold.{color} 8개 dot (장식 X, 시각 시그니처)

(b) 개인 카드 — 멤버별 owner_token으로 발급:
  배경: bg.canvas + accent.ranked subtle radial glow
  좌상: 작은 ZUGZAG GAME wordmark
  중앙 hero:
    body-md text.secondary "내 시즌 결과"
    display-xl 닉네임
    grid 3칸: 순위 (display-md "12위") / 점수 (display-md "1335점") / 완등 (display-md "47건")
  중하: sparkline 14일 성장 그래프 (얇은 line, accent.ranked)
  우하: 크루 로고
  하단: 시즌 이름 + 기간

⚡ 절대 금지:
  - 사진 배경 (텍스처 수준도 X — 데이터 자체가 디자인)
  - 보라 그라데이션
  - 이모지 헤딩 (🏆도 X — text "챔피언"으로)
  - terracotta / cream 톤
```

---

## P12. SharedSeasonLanding — OG 링크 클릭 비인증 landing (신설)

```
경로          : /shared/seasons/{id}  (RLS bypass, service-role read-only, 시즌 종료 후만)
viewport      : 모바일 1080x1920 우선, 데스크탑 가능
hierarchy: 시즌 챔피언 공개 요약 → CTA "내 크루 만들기"

상단:
  큰 챔피언 hero (P11 챔피언 카드와 동일 시스템)
  display-2xl "챔피언: 닉네임"
  display-md 점수
  body-md "2026 5월 랭크전 종료"

중단:
  Top 3 leaderboard (1위 메달 강조)
  body-sm "총 N명 참가, M건 완등"

하단 CTA (sticky):
  "zugzag에서 우리 크루 만들기" (accent.ranked, primary)
  "zugzag 가입" (secondary, 회원 아님 가정)
  본문 1줄 "zugzag-game은 zugzag 크루의 라이브 랭크전 서비스입니다"

비인증 access:
  RLS bypass / 시즌 종료 후만 응답 / 1-3위만 노출 (개인정보 최소화)

state:
  expired link / revoked: "이 시즌 링크는 더이상 유효하지 않습니다"
  before season close: 404 redirect zugzag.com
```

---

# 6. Component Primitives

## Session Kind Badge (CRITICAL, 모든 화면 공통)

```
RANKED:
  solid pill, bg #FF3B5C, text #FFFFFF, label "RANKED"
  type label-sm (11/14/600), padding 4px 8px, radius full

CASUAL:
  outline pill, border 1px text.tertiary (#71717A), text text.secondary (#A1A1AA), label "CASUAL"
  type label-sm, padding 4px 8px, radius full

노출 (강제):
  - P3 SendModal Step 3 상단 고정
  - P1/P10 LiveBoard 각 leaderboard row 우측 (ranked 시즌 보드면 RANKED 생략 OK)
  - P5 GameHome 최근 활동 피드 카드 좌상
  - P9 AdminDash CSV preview 컬럼
  - P10 TVDisplay 헤더 모드 표시
```

## FAB

```
fixed bottom-right, 56×56, radius full, bg accent.ranked
icon "+" + label "기록" (모바일 56), icon-only when sticky scroll (motion.fast)
z.fab (200)
shadow elevation.card
노출: Home + ProblemBoard만
```

## Hold Color Chip

```
size ≥60×60 (a11y.touch-target.game)
bg = hold.{color}
text = 번호 (Inter title-md, weight 700)
white/black: outline 1px add (border.strong)
완등: 우상단 체크 아이콘 16px + opacity 0.8
시도-미완등: outline 점선 dashed
```

## Toast

```
position: top-center 또는 bottom-center (모바일)
max width 480px
bg bg.surface-2, text text.primary
elevation.toast
duration 3000ms (motion.toast)
max 3 stack, FIFO replace on 4th
reduced-motion: instant fade
```

---

# 7. Viewport Breakpoints

```
mobile      320 - 767     PWA, 단일 column
tablet      768 - 1023    bottom sheet 가능, side-by-side 시작
desktop     1024 - 1919   운영자 PC, 데스크탑 layout
tv          1920+         P1/P10/E8 only
```

---

# 8. Accessibility 강제

```
WCAG 2.1 AA:
  키보드 네비게이션 — Tab/Enter/Esc 모든 인터랙션
  스크린 리더 — semantic HTML + aria-label, aria-describedby
  명도 대비 — 4.5:1 (본문), 3:1 (큰 텍스트)
  터치 타겟 — 44px 최소 (게임 인터랙션은 60px)
  포커스 — outline 2px solid #FF3B5C (border.focus), color 단독 정보 금지
  애니메이션 — 깜빡임 3회 이상 X, prefers-reduced-motion 시 motion → 0

Per-screen ARIA landmarks:
  header / nav / main / aside / footer 명시
  P1/P10 LiveBoard: role="status" aria-live="polite" 리더보드 영역
  P3 Modal: role="dialog" aria-modal="true" + aria-labelledby
  Toast: role="alert" aria-live="assertive"

Avatar privacy:
  Default = 닉네임 이니셜 원 + crew color 배경
  사진은 user opt-in (settings 토글)
```

---

# 9. 사용자 여정 (디자인이 풀어야 할 3 path)

## Path A — 멤버 첫 send

```
P5 진입 → casual 첫 풀이 → P3 Step 1 (E1 prefill 없음, 풀 표시)
→ Step 2 → Step 3 (CASUAL badge 상단, "기록만 남아요") → 토스트 "오늘 5건째 풀이 기록!"
→ Live 탭 가도 본인 점수 안 보여서 헤매지 않음 (Me 탭에서 본인 casual 타임라인 명시)
```

## Path B — 호스트 즉석 랭크전 → TV

```
P5 leader hero → "즉석 랭크전 열기" CTA → P7 모달 (어두운 긴장감) → "지금 시작"
→ 같은 모달이 transform → "시작!" + QR 큰 화면 + URL → 호스트 phone으로 TV 가서 입력
→ TV 표시 (P10 live state) → 호스트 phone 닫고 /sessions/{id}/live → 풀이 → 5초 안에 TV 갱신
```

## Path C — 시즌 종료 OG 공유

```
호스트 시즌 close → TV에 P10 ceremony state 5초 overlay → P11 챔피언 카드 자동 생성
→ 멤버 P4 SeasonDetail 하단 "내 카드 공유" CTA → P11 개인 카드 → 공유 sheet
→ 친구가 OG 링크 클릭 → P12 SharedSeasonLanding (비인증) → "zugzag 크루 만들기" CTA
```

---

# 10. 산출물 형식 요청

Claude Design에게 요청:

1. **12 화면(P1-P12) 모두 mockup 생성** — 각 화면당 모바일/태블릿/데스크탑/TV(해당 화면만) variants
2. **상태별 variants** — 최소 P1/P3/P5/P10는 loading/empty/error/success state 모두 표시
3. **컴포넌트 라이브러리** — Session Kind Badge, FAB, Hold Color Chip, Toast 4개 primitives
4. **다크 모드만** (라이트 모드 P2/P4만 옵션 추가)
5. **HTML/Tailwind export** — Claude Code handoff bundle 활성화 (개발 단계 인계용)
6. **iteration 시 우선 영역**: P5 GameHome (state machine — 가장 약한 부분), P11 OG (브랜드 표면)

---

# 11. 첨부 권장 파일 (Claude Design 업로드 슬롯)

이 프롬프트와 함께 다음 파일을 Claude Design에 업로드하면 일관성이 더 올라간다:

- `docs/PRINCIPLES.md` — 5개 원칙, 우선순위
- `docs/FEATURE_SPEC.md` — 데이터 모델, API, 9 화면 비즈니스 규칙
- `docs/DESIGN.md` — 토큰 SSOT (이 프롬프트의 §3과 같은 내용 + 더 자세함)
- `docs/DESIGN_PROMPT.md` — 9 화면 원본 명세 (P10/P11/P12는 본 프롬프트만)

---

# 12. 검증 체크리스트 (Claude Design 결과 받은 후 본인 셀프 체크)

받은 디자인이 다음에 1개라도 해당하면 reroll:

- [ ] cream/off-white/beige 배경 등장
- [ ] serif italic 사용
- [ ] terracotta/amber/warm brown UI chrome
- [ ] 보라 그라데이션
- [ ] 3-column feature grid pattern
- [ ] icon-in-colored-circle 장식
- [ ] centered everything
- [ ] uniform bubbly border-radius
- [ ] decorative blob/circles
- [ ] emoji as design element
- [ ] generic "Welcome to..." 카피
- [ ] P5가 카드 dashboard로 됐음 (state machine 아님)
- [ ] Session Kind Badge가 없거나 일관되지 않음
- [ ] P3 casual 모드가 ranked와 같은 점수 preview 표시 ("거짓말 토스트")
- [ ] /tv/{token} 9-state 중 일부만 다룸
- [ ] OG 카드가 "사진 + 텍스트" 패턴
- [ ] 한국어 UI인데 fallback이 영어로만 보임
