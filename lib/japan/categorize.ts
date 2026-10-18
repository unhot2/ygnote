import type { ScheduleCategory } from "./types";

/**
 * 시트에 카테고리 컬럼이 없어 "일정"/"비고" 텍스트 키워드로 추론한다.
 * 규칙 출처: docs/japan-page-design-draft.md 1.3장
 */
// 순서가 중요하다: "호텔 출발"처럼 여러 카테고리 키워드가 섞인 일정은 먼저 걸린 쪽으로 분류된다.
// "인천 → 후쿠오카 출발"처럼 항공편 일정은 "출발/도착"이 들어가므로 airport를 transport보다 먼저 검사하고,
// "온천마을 산책, 카페, 족욕"이 식당으로 빠지지 않도록 free를 food보다 먼저 검사한다.
const CATEGORY_KEYWORDS: Array<{ category: ScheduleCategory; keywords: string[] }> = [
  {
    category: "airport",
    keywords: ["공항", "항공", "비행", "인천"],
  },
  {
    category: "transport",
    keywords: ["출발", "도착", "버스", "택시", "고속버스"],
  },
  {
    category: "lodging",
    keywords: ["체크인", "체크아웃", "에어비앤비", "료칸", "호텔", "노천탕"],
  },
  {
    category: "mart",
    keywords: ["마트", "foods club"],
  },
  {
    category: "free",
    keywords: ["자유시간", "산책", "온천", "족욕"],
  },
  {
    category: "food",
    keywords: ["라멘", "포장마차", "이자카야", "클럽", "가이세키", "식당", "카페"],
  },
];

function findCategory(text: string): ScheduleCategory | null {
  const haystack = text.toLowerCase();

  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
      return category;
    }
  }

  return null;
}

/**
 * 일정명을 먼저 보고, 일정명으로 판단이 안 될 때만 비고를 본다.
 * 비고는 부가 설명이라 "마트 방문 (비고: 료칸에서 먹을 술 구입)"처럼
 * 다른 카테고리 단어가 섞여 있어 일정명과 함께 검사하면 오분류된다.
 */
export function categorizeSchedule(title: string, note: string | null): ScheduleCategory {
  return findCategory(title) ?? (note ? findCategory(note) : null) ?? "free";
}
