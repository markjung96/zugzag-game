/**
 * 점수 정책 기본 템플릿 — FEATURE_SPEC §3.1
 *
 * Policy는 운영자가 UI(P1.2-PolicyCRUD)에서 자유롭게 만든다.
 * 이 모듈은 "**기본값 불러오기**" 버튼이나 첫 정책 생성 시 prefill에 쓰는 상수.
 *
 * DB seed 아님 — 시스템 invariant가 아니라 사용자 편의 default.
 *
 * 사용 예 (P1.2):
 *   const draft = { ...DEFAULT_POLICY_TEMPLATE, color_scores: mapByProviderColors(providerColors) };
 */

import type { HoldColor } from "@/types";

/**
 * 색명 → 권장 점수 (FEATURE_SPEC §3.1).
 * 실제 INSERT 시에는 provider_colors row의 uuid 키로 변환해 jsonb에 넣는다.
 */
export const DEFAULT_COLOR_SCORES: Record<HoldColor, number> = {
  white: 10,
  yellow: 20,
  orange: 35,
  green: 60,
  blue: 95,
  red: 140,
  purple: 195,
  black: 260,
};

/**
 * 한/영 라벨 alias — provider_colors.label과 매칭할 때 사용.
 * UI에서 "기본값 불러오기"가 provider_colors 인벤토리와 자동 매핑할 때 참고.
 */
export const LABEL_ALIASES: Record<HoldColor, string[]> = {
  white: ["white", "흰색", "흰", "백색"],
  yellow: ["yellow", "노란색", "노랑", "노란", "노"],
  orange: ["orange", "주황색", "주황", "주"],
  green: ["green", "초록색", "초록", "초"],
  blue: ["blue", "파란색", "파랑", "파"],
  red: ["red", "빨간색", "빨강", "빨"],
  purple: ["purple", "보라색", "보라", "보"],
  black: ["black", "검은색", "검정색", "검정", "검"],
};

/**
 * 정책 jsonb의 메타 default (color_scores 매핑은 호출자가 채움).
 */
export const DEFAULT_POLICY_META = {
  first_send_only: true,
  team_top_n: null as number | null,
} as const;
