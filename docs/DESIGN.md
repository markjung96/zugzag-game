# ZUGZAG-GAME 디자인 시스템 (Design Tokens SSOT)

> **이 문서는 디자인의 Single Source of Truth.**
> DESIGN_PROMPT.md의 9 화면 명세는 이 토큰을 reference한다.
> 구현 단계의 `tailwind.config.ts` / `globals.css` 는 이 토큰과 1:1 매핑.

**문서 버전**: 0.1 (Phase 1 초안, /plan-design-review 2026-05-13 산출)

---

## 0. 우선순위 원칙

```
PRINCIPLES > FEATURE_SPEC > DESIGN.md > DESIGN_PROMPT.md
(상위 문서가 하위 문서를 이긴다)
```

DESIGN.md는 토큰 정의만 한다. **'어디에 어떻게 쓸지'는 DESIGN_PROMPT.md.**
zugzag 본체와 충돌 시: 본체 토큰 follow (P4 원칙). 본체에 없는 신규 토큰은 본 문서에 명시 + 사유.

---

## 1. Color

### 1.1 Background Tier (dark mode 기본, 라이트 모드 선택 화면만)

| Token          | Hex                | 용도                              |
| -------------- | ------------------ | --------------------------------- |
| `bg.canvas`    | `#0A0A0B`          | 페이지 최하단 (P1 LiveBoard 전체) |
| `bg.canvas-2`  | `#1A1A1F`          | 그라데이션 종점, surface 들림     |
| `bg.surface`   | `#16161A`          | 카드/모달/시트 1tier              |
| `bg.surface-2` | `#1E1E24`          | 카드 위 카드 (rare)               |
| `bg.overlay`   | `rgba(0,0,0,0.72)` | 모달 backdrop                     |

**금지**: 보라/violet/indigo 그라데이션. blob/혹 장식. `linear-gradient(135deg, #6366F1, #8B5CF6)` 같은 SaaS-template 패턴.

### 1.2 Text Tier

| Token            | Hex       | 용도              | 명도비 (vs `bg.canvas`)            |
| ---------------- | --------- | ----------------- | ---------------------------------- |
| `text.primary`   | `#F4F4F5` | 본문, 헤딩        | 14.6:1 ✓                           |
| `text.secondary` | `#A1A1AA` | 보조, 메타        | 6.7:1 ✓                            |
| `text.tertiary`  | `#71717A` | hint, placeholder | 4.5:1 ✓                            |
| `text.disabled`  | `#52525B` | 비활성            | 2.9:1 ✗ (a11y는 별도 색 + outline) |
| `text.on-accent` | `#FFFFFF` | accent 위 텍스트  | per-accent 검증                    |

### 1.3 Accent (게임 액션, 1순위 강조)

| Token             | Hex       | 용도                                         |
| ----------------- | --------- | -------------------------------------------- |
| `accent.ranked`   | `#FF3B5C` | RANKED badge, 시즌 점수, "지금 시작" 1차 CTA |
| `accent.ranked-2` | `#FF5876` | hover/pressed                                |
| `accent.casual`   | `#71717A` | CASUAL outline pill text                     |
| `accent.win`      | `#FFD24A` | 1위 그로우, 챔피언, 메달 금                  |
| `accent.silver`   | `#D1D5DB` | 메달 은                                      |
| `accent.bronze`   | `#CD7F32` | 메달 동                                      |
| `accent.alert`    | `#EF4444` | 에러, revoke, destructive                    |
| `accent.success`  | `#22C55E` | 성공 토스트, 완등 OK                         |

**rationale**: red `#FF3B5C`을 ranked 1차 색으로 → 클라이밍 짐 어두운 조명에서 가장 잘 튄다 + Strava-like 운동 앱 신뢰감 + 보라 정대 회피.

### 1.4 Climbing Holds Map (실제 홀드 색상, 액센트로 활용)

| Token         | Hex       | 텍스트 색 | 비고                                             |
| ------------- | --------- | --------- | ------------------------------------------------ |
| `hold.white`  | `#F8F9FA` | `#0A0A0B` | dark bg에선 outline `1px solid #52525B` 추가     |
| `hold.yellow` | `#FBBF24` | `#0A0A0B` |                                                  |
| `hold.orange` | `#FB923C` | `#0A0A0B` |                                                  |
| `hold.green`  | `#22C55E` | `#FFFFFF` |                                                  |
| `hold.blue`   | `#3B82F6` | `#FFFFFF` |                                                  |
| `hold.red`    | `#EF4444` | `#FFFFFF` |                                                  |
| `hold.purple` | `#A855F7` | `#FFFFFF` | **유일 보라 사용처 — 홀드 색만, UI chrome 금지** |
| `hold.black`  | `#1F2937` | `#F8F9FA` | dark bg에선 outline `1px solid #71717A` 추가     |

**규칙**: 홀드 색 chip은 항상 numeric 텍스트 + 색 배경. white/black 두 색은 dark canvas 위에서 보더 outline 강제 (대비 4.5:1 미달 회피).

### 1.5 Border / Divider

| Token            | Hex                                               |
| ---------------- | ------------------------------------------------- |
| `border.default` | `#27272A`                                         |
| `border.strong`  | `#3F3F46`                                         |
| `border.focus`   | `#FF3B5C` (accent.ranked, focus ring 2px outline) |

---

## 2. Typography

### 2.1 Font Family

```
display, body : Pretendard (한글) → fallback: -apple-system, BlinkMacSystemFont, system-ui
mono, numeric : Inter (영문/숫자) → fallback: ui-monospace, SFMono-Regular, monospace
```

**금지**: `system-ui`만 단독, `Roboto`, `Arial`, default sans (= AI slop signal).

### 2.2 Type Scale

| Token              | Size / Line / Weight | 용도                                         |
| ------------------ | -------------------- | -------------------------------------------- |
| `type.display-2xl` | 96 / 96 / 700        | TV LiveBoard 1위 점수, E8 의식 카드 헤드라인 |
| `type.display-xl`  | 72 / 72 / 700        | TV 카운트다운, OG 챔피언 카드 점수           |
| `type.display-lg`  | 56 / 60 / 700        | TV Top10 점수                                |
| `type.display-md`  | 40 / 44 / 700        | 시즌 헤더, 모달 hero 점수                    |
| `type.title-xl`    | 28 / 32 / 700        | 페이지 헤딩 (모바일 H1)                      |
| `type.title-lg`    | 22 / 28 / 600        | 카드 헤딩, 모달 step 타이틀                  |
| `type.title-md`    | 18 / 24 / 600        | 섹션 헤딩                                    |
| `type.body-lg`     | 17 / 24 / 400        | 본문 (모바일 default)                        |
| `type.body-md`     | 15 / 22 / 400        | 본문 (데스크탑 default)                      |
| `type.body-sm`     | 13 / 18 / 400        | 캡션, 메타                                   |
| `type.label-md`    | 13 / 16 / 600        | 버튼, badge 라벨                             |
| `type.label-sm`    | 11 / 14 / 600        | tag, 작은 chip                               |

**규칙**:

- TV-bound 스크린(P1, P10, E8 overlay)은 최소 `type.display-lg` 이상으로 헤딩.
- 모바일 본문 `type.body-lg` 이상 (a11y).
- 숫자(점수, 카운트다운, 등수)는 항상 Inter (Pretendard 숫자보다 가독성 ↑).

---

## 3. Spacing (4px grid)

```
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128
```

| Token      | Value |
| ---------- | ----- |
| `space.1`  | 4     |
| `space.2`  | 8     |
| `space.3`  | 12    |
| `space.4`  | 16    |
| `space.5`  | 24    |
| `space.6`  | 32    |
| `space.7`  | 48    |
| `space.8`  | 64    |
| `space.9`  | 96    |
| `space.10` | 128   |

**규칙**: 페이지 좌우 padding 모바일 16, 태블릿+ 24, 데스크탑 32.

---

## 4. Radius

| Token         | Value | 용도                    |
| ------------- | ----- | ----------------------- |
| `radius.none` | 0     | 풀브리드 banner, hero   |
| `radius.sm`   | 4     | tag, 작은 input         |
| `radius.md`   | 8     | 버튼, input, chip       |
| `radius.lg`   | 16    | 카드, 모달, 시트        |
| `radius.xl`   | 24    | hero card, OG card      |
| `radius.full` | 9999  | 아바타, pill badge, FAB |

**금지**: 모든 element가 같은 큰 radius (= bubbly AI slop). 위계에 따라 다른 radius 사용.

---

## 5. Elevation (shadow)

dark mode 위주이므로 shadow보다 surface tier로 깊이 표현. 필요 시 최소.

| Token                | Value                                                           | 용도              |
| -------------------- | --------------------------------------------------------------- | ----------------- |
| `elevation.none`     | none                                                            | 기본              |
| `elevation.card`     | `0 1px 2px rgba(0,0,0,0.4)`                                     | 살짝 떠 있는 카드 |
| `elevation.modal`    | `0 10px 30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)` | 모달, 시트        |
| `elevation.toast`    | `0 4px 16px rgba(0,0,0,0.6)`                                    | 토스트            |
| `elevation.glow-1st` | `0 0 24px rgba(255,210,74,0.35)`                                | 1위 그로우 (TV)   |

**금지**: 장식적 그림자. 모든 element에 default shadow. soft "fluffy" 그림자.

---

## 6. Motion

| Token            | Duration | Easing                     | 용도                                  |
| ---------------- | -------- | -------------------------- | ------------------------------------- |
| `motion.instant` | 0ms      | -                          | 즉시 (reduced-motion fallback)        |
| `motion.fast`    | 150ms    | `ease-out`                 | hover, tap feedback                   |
| `motion.base`    | 300ms    | `ease-out`                 | 모달 enter/exit, leaderboard 슬라이드 |
| `motion.slow`    | 500ms    | `cubic-bezier(.2,.8,.2,1)` | E8 의식 카드 페이드                   |
| `motion.toast`   | 3000ms   | -                          | "방금 풀이!" 토스트 자동 fade out     |

**규칙**:

- `prefers-reduced-motion: reduce` 시 모든 motion → `instant`.
- 깜빡임 3회 이상 금지.
- Realtime 보드 reorder는 `motion.base` ease-out (사람이 따라갈 속도).

---

## 7. Z-index

| Token              | Value | 용도                                         |
| ------------------ | ----- | -------------------------------------------- |
| `z.base`           | 0     | 기본                                         |
| `z.sticky`         | 100   | sticky header, sticky nav, sticky bottom bar |
| `z.fab`            | 200   | FAB                                          |
| `z.dropdown`       | 300   | select, dropdown                             |
| `z.modal`          | 400   | 바텀시트, 모달                               |
| `z.toast`          | 500   | 토스트 (모달 위)                             |
| `z.tv-overlay`     | 600   | E8 의식 카드, TV 풀스크린 overlay            |
| `z.error-boundary` | 700   | critical error page                          |

---

## 8. Component Primitives (DESIGN_PROMPT.md에서 reference)

### 8.1 Session Kind Badge (CRITICAL — H1 from outside voice)

casual vs ranked 구분의 단일 시각 단위.

```
RANKED  →  solid pill, bg=accent.ranked (#FF3B5C), text=text.on-accent (#FFFFFF), label="RANKED"
            type=type.label-sm, padding 4 8, radius=full
CASUAL  →  outline pill, border=text.tertiary, text=text.secondary, label="CASUAL"
            type=type.label-sm, padding 4 8, radius=full
```

**노출 위치 (강제)**:

- P3 SendModal Step 3 상단 고정 ("이 풀이는 RANKED" / "이 풀이는 CASUAL")
- P1 LiveBoard 각 leaderboard row 우측 (단, ranked 시즌 보드면 RANKED 생략 OK, casual 섞이면 표기 강제)
- P5 GameHome "최근 활동" 피드 카드 좌상
- P9 AdminDash CSV preview 컬럼
- P10 TVDisplay 헤더 모드 표시

### 8.2 Casual Mode Modal Copy (T-M4 fix)

P3 Step 3에 ranked vs casual 분기:

```
RANKED 모드:
  점수 미리보기: type.display-md "+95점"
  보조 라인:    type.body-md "시즌 1240 → 1335" + "3위 → 2위"
  메인 버튼:    "기록하기" (accent.ranked)

CASUAL 모드:
  badge:       CASUAL pill 상단 고정
  설명 라인:    type.body-md text.secondary "기록만 남아요 — 시즌 점수에 미반영"
  보조 라인:    type.body-sm "오늘 누적 5건째 풀이"
  메인 버튼:    "기록하기" (text.primary 배경 = bg.surface-2, outline 1px border.strong)
```

**rationale**: casual에서 score preview "+95점 시즌 3위" 거짓말 제거. 사용자가 ranked vs casual 차이를 modal 진입 첫 1초에 인식.

### 8.3 Score Preview State Machine (H3 fix)

P3 Step 3 점수 프리뷰의 4 상태:

| State        | Trigger                                            | UI                                     |
| ------------ | -------------------------------------------------- | -------------------------------------- |
| `confident`  | 0-30s 직전 fetch                                   | "+95점, 시즌 1240→1335" 그대로         |
| `tentative`  | 30s-2min cache                                     | 그대로 (warning 없음)                  |
| `stale`      | 2min+ cache 또는 동시 다른 멤버 send Realtime 감지 | 접두 "예상 +95점" + 미세한 노란 dot    |
| `suppressed` | offline 또는 known stale                           | 점수 라인 숨김 + "기록 후 점수 갱신됨" |

### 8.4 Empty/Loading/Error 기본값 (Pass 2)

| State            | 기본                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Loading skeleton | dark `bg.surface` 위 3-layer shimmer rectangle, 800ms 안에 본문 또는 명시 placeholder 전환 |
| Empty (data 0)   | type.title-md 헤딩 + type.body-md 설명 + 1차 inline CTA                                    |
| Error 500        | type.title-md "잠시 문제가 있어요" + "다시 시도" 버튼 + 상세는 collapsible                 |
| Error network    | toast 8s + 재시도 버튼 + (POST 였다면) 모달 유지                                           |

---

## 9. Viewport Breakpoints

```
mobile      : 320 - 767  (모바일 PWA)
tablet      : 768 - 1023 (태블릿 가로)
desktop     : 1024 - 1919 (운영자 PC)
tv          : 1920+ (TV/대형)
```

---

## 10. Accessibility 토큰

| Token                    | Value                                                         |
| ------------------------ | ------------------------------------------------------------- |
| `a11y.touch-target.min`  | 44px (WCAG 권장)                                              |
| `a11y.touch-target.game` | 60px (DESIGN_PROMPT 정책)                                     |
| `a11y.contrast.body`     | 4.5:1                                                         |
| `a11y.contrast.large`    | 3:1                                                           |
| `a11y.focus-ring`        | `outline: 2px solid var(--border-focus); outline-offset: 2px` |
| `a11y.reduced-motion`    | 모든 motion duration → 0                                      |

---

## 11. zugzag 본체 매핑 (Phase 0 첫 작업)

zugzag 본체의 `src/app/globals.css` + `tailwind.config.ts` 토큰을 검토 후 매핑 표를 본 절에 추가. 본체 토큰 우선, 없는 토큰만 본 문서로 신규 정의 (P4 원칙).

**Phase 0 체크리스트 추가 권장**:

- [ ] zugzag 본체 token snapshot
- [ ] 본 문서와 매핑 표 작성 (`zugzag.color.primary` ↔ `accent.ranked` 등)
- [ ] 충돌 토큰 reconciliation
- [ ] DESIGN.md §11에 매핑 표 commit
