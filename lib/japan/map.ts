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
 * 료칸 야마노유는 정확한 위치를 확인할 수 없어 지역 단위로만 잡았다.
 * 시트 "주소" 컬럼에 값이 들어오면 이 매핑보다 시트 주소가 우선한다.
 */
const FALLBACK_LOCATIONS: Record<string, MapLocation> = {
  // 출발·도착을 합친 "이동" 일정: 비행기는 도착 공항, 버스는 타는 곳을 보여준다
  "인천 → 후쿠오카 이동": { query: "福岡空港 国際線ターミナル", label: "도착: 후쿠오카 공항 국제선 터미널", approximate: false },
  "텐진 포장마차 거리": { query: "天神 屋台", label: "텐진 포장마차 거리", approximate: true },
  "버스터미널로 출발": { query: "博多バスターミナル", label: "하카타 버스터미널", approximate: false },
  "하카타 → 구로카와 이동": { query: "博多バスターミナル", label: "타는 곳: 하카타 버스터미널", approximate: false },
  "온천마을 산책, 카페, 족욕": { query: "黒川温泉", label: "구로카와 온천 마을", approximate: true },
  "료칸 체크인": { query: "黒川温泉", label: "구로카와 온천 일대 (료칸 주소 미입력)", approximate: true },
  "노천탕 + 가이세키 석식": { query: "黒川温泉", label: "구로카와 온천 일대 (료칸 주소 미입력)", approximate: true },
  "조식 + 노천탕": { query: "黒川温泉", label: "구로카와 온천 일대 (료칸 주소 미입력)", approximate: true },
  "구로카와 → 하카타 이동": { query: "黒川温泉 バス停", label: "타는 곳: 구로카와 온천 버스정류장", approximate: false },
  // 주소(美野島3-13-12)로 검색하면 핀이 건물에서 조금 벗어나서, 구글 지도에 등록된 숙소 이름으로 검색한다.
  "하카타 호텔 체크인": { query: "Grand Residence Hotel Hakata Premier", label: "그랜드 호텔 & 레지던스 하카타 프리미어 (3-13-12, Minoshima)", approximate: false },
  자유시간: {
    query: "ジャストミート 大名店 福岡市中央区大名1-14-5",
    label: "저스트미트 다이묘점 (福岡市中央区大名1-14-5)",
    approximate: false,
  },
  "호텔 출발": { query: "Grand Residence Hotel Hakata Premier", label: "그랜드 호텔 & 레지던스 하카타 프리미어 (3-13-12, Minoshima)", approximate: false },
  "후쿠오카 국제공항 도착": { query: "福岡空港 国際線ターミナル", label: "후쿠오카 공항 국제선 터미널", approximate: false },
  "후쿠오카 → 인천 이동": { query: "인천국제공항", label: "도착: 인천국제공항", approximate: false },
};

/** 일정의 지도 위치. 시트 주소 → 매핑 순으로 찾고, 둘 다 없으면 null. */
export function getMapLocation(schedule: Schedule): MapLocation | null {
  if (schedule.address) {
    return { query: schedule.address, label: schedule.address, approximate: false };
  }

  return FALLBACK_LOCATIONS[schedule.title] ?? null;
}

/** API 키 없이 쓸 수 있는 구글 지도 임베드 URL */
export function getMapEmbedUrl(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=ko&z=15&output=embed`;
}

/** 구글 지도 앱/웹에서 여는 URL (Maps URLs, API 키 불필요) */
export function getMapOpenUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
