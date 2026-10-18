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
}

/** 상세정보 카드 표시 항목. 영업시간/전화번호는 시트에 없는 데이터라 옵셔널. */
export interface PlaceDetail {
  openingHours?: string;
  phone?: string;
}

/** 상세정보 카드를 보여줄지 여부를 결정하는 카테고리(디자인 문서 3장 상태 D) */
export const DETAIL_CARD_CATEGORIES: ScheduleCategory[] = ["mart", "food"];
