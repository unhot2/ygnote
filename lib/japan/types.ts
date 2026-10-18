export type ScheduleCategory =
  | "airport"
  | "transport"
  | "food"
  | "mart"
  | "lodging"
  | "free";

export interface Schedule {
  id: string;
  date: string;
  time: string | null;
  title: string;
  address: string | null;
  note: string | null;
  preparation: string | null;
  category: ScheduleCategory;
  /**
   * 주소 → 좌표 지오코딩 결과. 지도 API 키가 아직 없어 현재는 항상 null이며,
   * 지오코딩 연동 후 채워진다 (docs/japan-page-design-draft.md 5장 결정사항 2, 3 참고).
   */
  coordinates: { lat: number; lng: number } | null;
}

export interface JapanesePhrase {
  ko: string;
  ja: string;
  reading?: string;
}

export interface CategoryPhraseSet {
  category: ScheduleCategory | "common";
  label: string;
  phrases: JapanesePhrase[];
  /** 숫자·층·교통수단 같은 기초 단어 묶음 (일본어 탭에서만 표시) */
  wordGroups?: Array<{ title: string; words: JapanesePhrase[] }>;
}

/** 상세정보 카드 표시 항목. 영업시간/전화번호는 시트에 없는 데이터라 옵셔널. */
export interface PlaceDetail {
  /** 일정명과 실제 가게 이름이 다를 때 보여줄 가게 이름 (예: "자유시간" → 저스트미트) */
  name?: string;
  /** 시트에 주소가 없을 때 보여줄 주소 */
  address?: string;
  openingHours?: string;
  /** 메뉴와 가격. price는 출처에 적힌 그대로의 문자열 */
  menu?: Array<{ name: string; price: string; note?: string }>;
  phone?: string;
  /** 가격대·할인 등 조사해서 확인된 정보 */
  highlights?: string[];
  sources?: Array<{ label: string; url: string }>;
}

/** 장소 사진. 작가·라이선스·출처를 함께 표시한다. */
export interface PlacePhoto {
  src: string;
  caption: string;
  author: string;
  license: string;
  sourceUrl: string;
  /** 출처 이름. 없으면 Wikimedia Commons */
  sourceName?: string;
  /** 세로 사진처럼 잘리면 안 되는 사진은 "contain"으로 전체를 보여준다. 기본은 칸에 맞춰 자름 */
  fit?: "cover" | "contain";
}

/** 상세정보 카드를 보여줄지 여부를 결정하는 카테고리(디자인 문서 3장 상태 D) */
export const DETAIL_CARD_CATEGORIES: ScheduleCategory[] = ["mart", "food"];
