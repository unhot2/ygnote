import type { Schedule } from "./types";

export interface MapLocation {
  /** 구글 지도 검색어 */
  query: string;
  /** 사람이 읽는 위치 이름 */
  label: string;
  /** true면 정확한 장소가 아니라 그 일대를 보여주는 대략적인 위치 */
  approximate: boolean;
}

/**
 * 시트에 주소가 없는 일정의 지도 검색어. 키는 시트의 "일정" 텍스트 그대로다.
 * 숙소(료칸 야마노유, 하카타 호텔)는 정확한 위치를 확인할 수 없어 지역 단위로만 잡았다.
 * 시트 "주소" 컬럼에 값이 들어오면 이 매핑보다 시트 주소가 우선한다.
 */
const FALLBACK_LOCATIONS: Record<string, MapLocation> = {
  "인천 → 후쿠오카 출발": { query: "인천국제공항", label: "인천국제공항", approximate: false },
  "인천 → 후쿠오카 도착": { query: "福岡空港 国際線ターミナル", label: "후쿠오카 공항 국제선 터미널", approximate: false },
  "텐진 포장마차 거리": { query: "天神 屋台", label: "텐진 포장마차 거리", approximate: true },
  "버스터미널로 출발": { query: "博多バスターミナル", label: "하카타 버스터미널", approximate: false },
  "하카타 → 구로카와 출발": { query: "博多バスターミナル", label: "하카타 버스터미널", approximate: false },
  "하카타 → 구로카와 도착": { query: "黒川温泉 バス停", label: "구로카와 온천 버스정류장", approximate: false },
  "온천마을 산책, 카페, 족욕": { query: "黒川温泉", label: "구로카와 온천 마을", approximate: true },
  "료칸 체크인": { query: "黒川温泉", label: "구로카와 온천 일대 (료칸 주소 미입력)", approximate: true },
  "노천탕 + 가이세키 석식": { query: "黒川温泉", label: "구로카와 온천 일대 (료칸 주소 미입력)", approximate: true },
  "조식 + 노천탕": { query: "黒川温泉", label: "구로카와 온천 일대 (료칸 주소 미입력)", approximate: true },
  "구로카와 → 하카타 출발": { query: "黒川温泉 バス停", label: "구로카와 온천 버스정류장", approximate: false },
  "구로카와 → 하카타 도착": { query: "博多バスターミナル", label: "하카타 버스터미널", approximate: false },
  "하카타 호텔 체크인": { query: "博多駅", label: "하카타역 일대 (호텔 주소 미입력)", approximate: true },
  자유시간: {
    query: "ジャストミート 大名店 福岡市中央区大名1-14-5",
    label: "저스트미트 다이묘점 (福岡市中央区大名1-14-5)",
    approximate: false,
  },
  "호텔 출발": { query: "博多駅", label: "하카타역 일대 (호텔 주소 미입력)", approximate: true },
  "후쿠오카 국제공항 도착": { query: "福岡空港 国際線ターミナル", label: "후쿠오카 공항 국제선 터미널", approximate: false },
  "후쿠오카 → 인천 출발": { query: "福岡空港 国際線ターミナル", label: "후쿠오카 공항 국제선 터미널", approximate: false },
  "후쿠오카 → 인천 도착": { query: "인천국제공항", label: "인천국제공항", approximate: false },
};

/** 일정의 지도 위치. 시트 주소 → 매핑 순으로 찾고, 둘 다 없으면 null. */
export function getMapLocation(schedule: Schedule): MapLocation | null {
  if (schedule.address) {
    return { query: schedule.address, label: schedule.address, approximate: false };
  }

  return FALLBACK_LOCATIONS[schedule.title] ?? null;
}

export interface StreetViewSpot {
  lat: number;
  lng: number;
  /** 카메라가 바라보는 방향(도). 0 = 북쪽 */
  heading: number;
}

/**
 * 로드뷰(스트리트뷰)를 보여줄 일정. 키는 시트의 "일정" 텍스트.
 * 좌표는 국토지리원(GSI) 주소 검색 API로 주소를 변환한 값이다.
 */
const STREET_VIEW_SPOTS: Record<string, StreetViewSpot> = {
  // 春吉三丁目13-31 イル・レガーロ天神
  "에어비앤비 체크인": { lat: 33.589664, lng: 130.406631, heading: 0 },
};

export function getStreetViewSpot(title: string): StreetViewSpot | null {
  return STREET_VIEW_SPOTS[title] ?? null;
}

/** API 키 없이 쓸 수 있는 스트리트뷰 임베드 URL (iframe 안에서만 열린다) */
export function getStreetViewEmbedUrl({ lat, lng, heading }: StreetViewSpot): string {
  return `https://www.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=12,${heading},0,0,0&output=svembed`;
}

/** 구글 지도 앱/웹에서 스트리트뷰로 여는 URL (Maps URLs, API 키 불필요) */
export function getStreetViewOpenUrl({ lat, lng, heading }: StreetViewSpot): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&heading=${heading}`;
}

/** API 키 없이 쓸 수 있는 구글 지도 임베드 URL */
export function getMapEmbedUrl(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=ko&z=15&output=embed`;
}

/** 구글 지도 앱/웹에서 여는 URL (Maps URLs, API 키 불필요) */
export function getMapOpenUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
