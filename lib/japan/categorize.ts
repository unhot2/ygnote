import type { ScheduleCategory } from "./types";

/**
 * 시트에 카테고리 컬럼이 없어 "일정"/"비고" 텍스트 키워드로 추론한다.
 * 규칙 출처: docs/japan-page-design-draft.md 1.3장
 */
// 순서가 중요하다: "후쿠오카 국제공항 도착 (비고: 체크인)"처럼 공항 체크인과
// 숙박 체크인이 같은 단어를 쓰므로, transport를 lodging보다 먼저 검사해야 한다.
const CATEGORY_KEYWORDS: Array<{ category: ScheduleCategory; keywords: string[] }> = [
  {
    category: "transport",
    keywords: ["출발", "도착", "버스", "공항", "비행", "택시", "고속버스"],
  },
  {
    category: "lodging",
    keywords: ["체크인", "체크아웃", "에어비앤비", "료칸", "호텔"],
  },
  {
    category: "mart",
    keywords: ["마트", "foods club"],
  },
  {
    category: "food",
    keywords: ["라멘", "포장마차", "이자카야", "클럽", "가이세키", "식당", "카페"],
  },
  {
    category: "free",
    keywords: ["자유시간", "산책", "온천", "족욕"],
  },
];

export function categorizeSchedule(title: string, note: string | null): ScheduleCategory {
  const haystack = `${title} ${note ?? ""}`.toLowerCase();

  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
      return category;
    }
  }

  return "free";
}
