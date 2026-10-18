import type { PlaceDetail, PlacePhoto } from "@/lib/japan/types";

/**
 * 장소 사진. 기본은 Wikimedia Commons의 자유 라이선스 사진이다 (2026-10 수집).
 * 신신라멘·Iseya 마트는 사용자가 직접 고른 구글 지도 사용자 사진을 public/photos에 넣어 쓴다.
 * 클럽, 에어비앤비는 공개 라이선스 사진이 없어 넣지 않았다.
 * 이런 곳은 지도 패널의 "구글 지도에서 열기"에서 사진을 볼 수 있다.
 */
const PHOTOS = {
  incheon: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/2023-01-27_Incheon_International_Airport.jpg/960px-2023-01-27_Incheon_International_Airport.jpg",
    caption: "인천국제공항",
    author: "Maksym Kozlenko",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:2023-01-27_Incheon_International_Airport.jpg",
  },
  fukuokaAirport: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Fukuoka_Airport_International_Terminal_Departure_Floor.jpg/960px-Fukuoka_Airport_International_Terminal_Departure_Floor.jpg",
    caption: "후쿠오카 공항 국제선 터미널 출발층",
    author: "Chihaya Sta",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Fukuoka_Airport_International_Terminal_Departure_Floor.jpg",
  },
  hakataBusTerminal: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Hakata_Bus_Terminal_20180905.jpg/960px-Hakata_Bus_Terminal_20180905.jpg",
    caption: "하카타 버스터미널",
    author: "そらみみ",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Hakata_Bus_Terminal_20180905.jpg",
  },
  nakasuYatai: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nakasu_Yatai_Stalls_%2819979437930%29.jpg/960px-Nakasu_Yatai_Stalls_%2819979437930%29.jpg",
    caption: "나카스 강변 포장마차",
    author: "Yoshikazu TAKADA",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Nakasu_Yatai_Stalls_(19979437930).jpg",
  },
  tenjinYatai: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Watanabe_D%C5%8Dri_the_Fukuoka_Hakata_Yatai_near_the_Nishinippon_Watanabe_Bldg_Tenjin_1-ch%C5%8Dme_Ch%C5%AB%C5%8D-ku_Fukuoka_20251001.jpg/960px-Watanabe_D%C5%8Dri_the_Fukuoka_Hakata_Yatai_near_the_Nishinippon_Watanabe_Bldg_Tenjin_1-ch%C5%8Dme_Ch%C5%AB%C5%8D-ku_Fukuoka_20251001.jpg",
    caption: "텐진 와타나베도리 포장마차",
    author: "Hirho",
    license: "CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Watanabe_D%C5%8Dri_the_Fukuoka_Hakata_Yatai_near_the_Nishinippon_Watanabe_Bldg_Tenjin_1-ch%C5%8Dme_Ch%C5%AB%C5%8D-ku_Fukuoka_20251001.jpg",
  },
  kurokawa: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Kurokawa_Onsen_-%E6%B8%A9%E6%B3%89%E8%A1%97.jpg/960px-Kurokawa_Onsen_-%E6%B8%A9%E6%B3%89%E8%A1%97.jpg",
    caption: "구로카와 온천 마을",
    author: "hiroooooki",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kurokawa_Onsen_-%E6%B8%A9%E6%B3%89%E8%A1%97.jpg",
  },
  kurokawaRotenburo: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Kurokawa-onsen.jpg/960px-Kurokawa-onsen.jpg",
    caption: "구로카와 온천 노천탕 (예시, 묵는 료칸 아님)",
    author: "Igorberger",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kurokawa-onsen.jpg",
  },
  ryokanBreakfast: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Breakfast_at_Sumiyoshi_ryokan_%283810540426%29.jpg/960px-Breakfast_at_Sumiyoshi_ryokan_%283810540426%29.jpg",
    caption: "료칸 조식 (예시, 호바미소 구이)",
    author: "Andrea Schaffer",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Breakfast_at_Sumiyoshi_ryokan_(3810540426).jpg",
  },
  ryokanKaiseki: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Ikaho_dinner_01.jpg/960px-Ikaho_dinner_01.jpg",
    caption: "료칸 가이세키 석식 (예시)",
    author: "Tomo",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ikaho_dinner_01.jpg",
  },
  // 사용자가 구글 지도에서 직접 골라 준 사진들 (지도 화면 요소는 잘라냄)
  shinshinTenjin: {
    src: "/photos/shinshin-tenjin.jpg",
    caption: "하카타 라멘 ShinShin 텐진 본점",
    author: "yongtack kong",
    license: "구글 지도 사용자 사진",
    sourceUrl: "https://www.google.com/maps/search/?api=1&query=%E5%8D%9A%E5%A4%9A%E3%82%89%E3%83%BC%E3%82%81%E3%82%93%20ShinShin%20%E5%A4%A9%E7%A5%9E%E6%9C%AC%E5%BA%97",
    sourceName: "Google 지도",
  },
  iseyaFoodsClub: {
    src: "/photos/iseya-foods-club.jpg",
    caption: "いせや FOODS CLUB (Iseya 푸드클럽)",
    author: "ts",
    license: "구글 지도 사용자 사진",
    sourceUrl: "https://www.google.com/maps/search/?api=1&query=%E3%81%84%E3%81%9B%E3%82%84%E3%83%95%E3%83%BC%E3%82%BA%E3%82%AF%E3%83%A9%E3%83%96%20%E6%98%A5%E5%90%89",
    sourceName: "Google 지도",
  },
} satisfies Record<string, PlacePhoto>;

// 하카타 호텔 사진은 사용자가 보내 준 숙소 예약 페이지 사진 모음에서 잘라낸 것이다.
const HAKATA_HOTEL_SOURCE = {
  author: "숙소 제공",
  license: "숙소 예약 페이지 사진",
  sourceUrl: "https://www.google.com/maps/search/?api=1&query=%E7%A6%8F%E5%B2%A1%E5%B8%82%E5%8D%9A%E5%A4%9A%E5%8C%BA%E7%BE%8E%E9%87%8E%E5%B3%B63-13-12",
  sourceName: "숙소 예약 페이지",
};

const HAKATA_HOTEL_EXTERIOR: PlacePhoto = {
  src: "/photos/hakata-premier-exterior.jpg",
  caption: "그랜드 호텔 & 레지던스 하카타 프리미어 외관",
  fit: "contain",
  ...HAKATA_HOTEL_SOURCE,
};

const HAKATA_HOTEL_PHOTOS: PlacePhoto[] = [
  HAKATA_HOTEL_EXTERIOR,
  { src: "/photos/hakata-premier-room.jpg", caption: "객실 (더블 + 소파)", ...HAKATA_HOTEL_SOURCE },
  { src: "/photos/hakata-premier-twin.jpg", caption: "객실 (트윈)", ...HAKATA_HOTEL_SOURCE },
  { src: "/photos/hakata-premier-living.jpg", caption: "거실 공간", ...HAKATA_HOTEL_SOURCE },
  { src: "/photos/hakata-premier-kitchen.jpg", caption: "주방 (전자레인지·냉장고)", ...HAKATA_HOTEL_SOURCE },
];

// 저스트미트 사진은 운영사(BAKURO 그룹) 공식 사이트의 매장 소개 사진이다.
const JUSTMEAT_SOURCE = {
  author: "BAKURO",
  license: "공식 사이트 사진",
  sourceUrl: "https://www.bakuro09.com/shop/justmeat/",
  sourceName: "BAKURO 공식 사이트",
};

const JUSTMEAT_PHOTOS: PlacePhoto[] = [
  { src: "/photos/justmeat-counter.jpg", caption: "저스트미트 매장 카운터", ...JUSTMEAT_SOURCE },
  { src: "/photos/justmeat-karaiyatsu.jpg", caption: "카라이야츠 (매운 양념 소창)", ...JUSTMEAT_SOURCE },
  { src: "/photos/justmeat-garlic-rice.jpg", caption: "갈릭 호르몬 라이스", ...JUSTMEAT_SOURCE },
  { src: "/photos/justmeat-motsuni.jpg", caption: "모츠니코미 (곱창 조림)", ...JUSTMEAT_SOURCE },
];

/**
 * 일정(시트 "일정" 텍스트) → 사진(여러 장 가능). 숙소는 실제 묵는 곳 사진이 없어
 * 예시 사진임을 캡션에 밝힌다. 하카타 호텔은 사용자가 준 숙소 사진과 로드뷰(lib/japan/map.ts)를 함께 보여준다.
 */
const SCHEDULE_PHOTOS: Record<string, PlacePhoto | PlacePhoto[]> = {
  "인천 → 후쿠오카 출발": PHOTOS.incheon,
  "인천 → 후쿠오카 도착": PHOTOS.fukuokaAirport,
  "신신라멘 텐진 본점": PHOTOS.shinshinTenjin,
  "Iseya Foods Club 마트 방문": PHOTOS.iseyaFoodsClub,
  "나카스 포장마차 거리": PHOTOS.nakasuYatai,
  "텐진 포장마차 거리": PHOTOS.tenjinYatai,
  "버스터미널로 출발": PHOTOS.hakataBusTerminal,
  "하카타 → 구로카와 출발": PHOTOS.hakataBusTerminal,
  "하카타 → 구로카와 도착": PHOTOS.kurokawa,
  "온천마을 산책, 카페, 족욕": PHOTOS.kurokawa,
  "료칸 체크인": { ...PHOTOS.kurokawa, caption: "구로카와 온천 마을 (료칸 사진 아님)" },
  "노천탕 + 가이세키 석식": [PHOTOS.kurokawaRotenburo, PHOTOS.ryokanKaiseki],
  "조식 + 노천탕": [PHOTOS.ryokanBreakfast, PHOTOS.kurokawaRotenburo],
  "구로카와 → 하카타 출발": PHOTOS.kurokawa,
  "구로카와 → 하카타 도착": PHOTOS.hakataBusTerminal,
  "하카타 호텔 체크인": HAKATA_HOTEL_PHOTOS,
  "호텔 출발": HAKATA_HOTEL_EXTERIOR,
  // 10/26(월) 자유시간에는 저스트미트에 간다
  자유시간: JUSTMEAT_PHOTOS,
  "후쿠오카 국제공항 도착": PHOTOS.fukuokaAirport,
  "후쿠오카 → 인천 출발": PHOTOS.fukuokaAirport,
  "후쿠오카 → 인천 도착": PHOTOS.incheon,
};

/**
 * 가게 상세정보. 키는 시트 "일정" 텍스트.
 * Iseya는 상품별 가격을 공개한 자료가 없어(공식 사이트·리뷰 모두 확인) 가격 대신 리뷰로 확인된 정보만 넣었다.
 */
const PLACE_DETAILS: Record<string, PlaceDetail> = {
  "Iseya Foods Club 마트 방문": {
    openingHours: "24시간 영업",
    phone: "092-725-0768",
    highlights: [
      "도시락·반찬(惣菜) 코너가 충실하다는 평이 가장 많다 (야후 지도 추천 포인트 1위).",
      "고기·도시락·채소·과일이 싸다는 리뷰가 많고, 아이스크림은 비싼 편이라는 의견도 있다.",
      "이른 아침에 반찬·도시락을 반값에 파는 경우가 있다는 리뷰가 있다 (2021년 리뷰).",
      "리뷰에 나온 가격 예시: 와사비맛 바삭 베이컨 반찬 216엔 (2025년 8월 리뷰)",
      "도시락·초밥의 상품별 가격은 공개된 자료가 없어 현장에서 확인해야 한다. 할인 상품에는 반값(半額)·할인(割引) 스티커가 붙는다.",
      "가끔 오래된 반찬이 있다는 리뷰가 있으니 유통기한(消費期限) 라벨을 확인한다.",
    ],
    sources: [
      { label: "야후 지도 리뷰", url: "https://map.yahoo.co.jp/v3/place/Z9g-yOZi2q2/review" },
      { label: "타베로그 리뷰", url: "https://tabelog.com/en/fukuoka/A4001/A400103/40045709/dtlrvwlst/" },
      { label: "포트래블", url: "https://4travel.jp/dm_shisetsu/11680970" },
    ],
  },
  "하카타 호텔 체크인": {
    name: "그랜드 호텔 & 레지던스 하카타 프리미어 (Grand Residence Hotel Hakata Premier)",
    address: "3-13-12, Minoshima, 하카타 구, 812-0017 후쿠오카시, 후쿠오카 현, 일본 (福岡市博多区美野島3-13-12)",
    highlights: [
      "체크인 15:00, 체크아웃 11:00 (예약 사이트 기준)",
      "객실에 주방(전자레인지·냉장고)과 세탁기가 있는 레지던스형 숙소다. Iseya 마트 등에서 산 음식을 데워 먹을 수 있다.",
      "하카타역 지하철역·하카타 버스터미널에서 도보 약 23~26분이라 짐이 많으면 택시가 편하다 (구글 지도 기준).",
      "이름이 비슷한 'The Grand Residence Hotel Hakata'(히가시히에 4-4-12)는 다른 곳이니 택시 탈 때 주소로 안내한다.",
    ],
    sources: [{ label: "로손 투어 숙소 정보", url: "https://tour.l-tike.com/hotels/domestic/hotel/91345966/" }],
  },
  // 사용자가 참고한 네이버 블로그는 도구에서 열리지 않아, 공식 사이트·예약 페이지·리뷰로 교차 확인했다 (2026-10-18).
  // 메뉴 가격은 공식 가격표가 공개돼 있지 않아 리뷰·소개글에 나온 가격을 시점과 함께 적었다.
  자유시간: {
    name: "저스트미트 다이묘점 (ジャストミート 大名店)",
    address: "福岡市中央区大名1-14-5 有光ビル1F B号室 (후쿠오카시 주오구 다이묘)",
    openingHours: "17:00~25:00 (L.O. 24:00)",
    phone: "092-791-3429",
    menu: [
      { name: "白盛り合わせ (시로 모둠, 호르몬 모둠)", price: "3,580엔", note: "가게 대표 메뉴" },
      { name: "赤白盛り (아카시로 모둠, 살코기+호르몬)", price: "2,980엔 (세금 별도)", note: "2020~2021년 리뷰 가격" },
      { name: "レバー (간)", price: "580엔", note: "2021년 리뷰 가격" },
      { name: "もつ煮込み (모츠니코미)", price: "380엔 (세금 별도)", note: "2020~2021년 리뷰 가격" },
      { name: "カライヤツ (카라이야츠, 매운 양념 소창)", price: "가격 미확인", note: "공식 추천 메뉴" },
      { name: "ガーリックホルモンライス (갈릭 호르몬 라이스)", price: "가격 미확인", note: "공식 추천 메뉴, 마무리용" },
      { name: "お通し (오토시, 양배추)", price: "-", note: "리필 무료 (2024년 후기)" },
    ],
    highlights: [
      "10/26(월)에도 영업한다. 공식 사이트에는 아직 '월요일 휴무'로 적혀 있지만, 예약 페이지(TableCheck)에서 10/26 17:00~23:00 예약 시간대가 열려 있는 것을 확인했다 (2026-10-18 조회).",
      "좌석이 16석(카운터 8, 테이블 8)뿐이라 예약을 추천한다. 예약은 TableCheck에서 하고, 10분 넘게 늦으면 취소될 수 있다.",
      "예산은 1인 약 6,000~7,000엔(예약 사이트 기준)이다. 2024년 후기에서는 2명이 술 포함 약 13,000엔이 나왔다.",
      "목장 직영 'BAKURO' 그룹의 호르몬(곱창) 야키니쿠 전문점이다. 소를 통째로 사들여 질 좋은 부위를 싸게 낸다고 한다.",
      "굽는 법(가게 추천): 두꺼운 하라미·우설은 천천히, 쓰라미(볼살)는 양면을 살짝만 굽는다.",
      "가게 안이 덥고 연기가 많으니 냄새가 배도 괜찮은 옷을 입는다. 카드 결제가 가능하다.",
      "가는 길: 지하철 나나쿠마선 텐진미나미역에서 도보 약 10분. 니시테츠 후쿠오카(텐진)역에서도 걸어갈 수 있다.",
    ],
    sources: [
      { label: "BAKURO 공식 사이트", url: "https://www.bakuro09.com/shop/justmeat/" },
      { label: "TableCheck 예약", url: "https://www.tablecheck.com/ja/justmeat" },
      { label: "후쿠오카 관광 가이드", url: "https://www.tourist-guide.net/fukuoka/archives/7914" },
      { label: "Retty 리뷰", url: "https://retty.me/area/PRE40/ARE122/SUB12301/100001408315/" },
      { label: "방문 후기(2024)", url: "https://shonokunblog.com/justmeat-daimyo_tenjin" },
    ],
  },
};

export function getSchedulePhotos(title: string): PlacePhoto[] {
  const photos = SCHEDULE_PHOTOS[title];
  if (!photos) {
    return [];
  }
  return Array.isArray(photos) ? photos : [photos];
}

export function getPlaceDetail(title: string): PlaceDetail | null {
  return PLACE_DETAILS[title] ?? null;
}
