import type { CategoryPhraseSet } from "@/lib/japan/types";

/**
 * 카테고리별 일본어 표현 세트. 구글 스프레드시트에는 없는 데이터라 직접 큐레이션했다.
 * 출처: docs/japan-page-design-draft.md 4.4장
 */
export const JAPAN_PHRASE_SETS: CategoryPhraseSet[] = [
  {
    category: "common",
    label: "공통 표현",
    phrases: [
      { ko: "안녕하세요", ja: "こんにちは", reading: "콘니치와" },
      { ko: "감사합니다", ja: "ありがとうございます", reading: "아리가토 고자이마스" },
      { ko: "죄송합니다", ja: "すみません", reading: "스미마센" },
      { ko: "이거 얼마예요?", ja: "これ、いくらですか", reading: "코레 이쿠라데스카" },
      { ko: "카드로 결제할 수 있나요?", ja: "カードで払えますか", reading: "카도데 하라에마스카" },
      { ko: "영수증 주세요", ja: "レシートください", reading: "레시토 쿠다사이" },
    ],
  },
  {
    category: "transport",
    label: "교통/이동",
    phrases: [
      { ko: "여기로 가주세요 (주소 보여주며)", ja: "ここに行ってください", reading: "코코니 잇테 쿠다사이" },
      { ko: "표는 어디서 사나요?", ja: "きっぷはどこで買えますか", reading: "킵푸와 도코데 카에마스카" },
      { ko: "이 버스가 ○○에 가나요?", ja: "このバスは○○に行きますか", reading: "코노 바스와 ○○니 이키마스카" },
      { ko: "공항까지 얼마나 걸려요?", ja: "空港までどのくらいかかりますか", reading: "쿠코마데 도노쿠라이 카카리마스카" },
    ],
  },
  {
    category: "food",
    label: "식당/주점",
    phrases: [
      { ko: "추천 메뉴가 뭐예요?", ja: "おすすめは何ですか", reading: "오스스메와 난데스카" },
      { ko: "몇 분이세요? (들었을 때 대답용) 2명이요", ja: "2人です", reading: "후타리데스" },
      { ko: "맥주 하나 주세요", ja: "ビール一つください", reading: "비루 히토츠 쿠다사이" },
      { ko: "이거 맵나요?", ja: "これ辛いですか", reading: "코레 카라이데스카" },
      { ko: "계산해 주세요", ja: "お会計お願いします", reading: "오카이케이 오네가이시마스" },
    ],
  },
  {
    category: "mart",
    label: "마트/상점",
    phrases: [
      { ko: "이거 얼마예요?", ja: "これ、いくらですか", reading: "코레 이쿠라데스카" },
      { ko: "봉투 필요해요", ja: "袋お願いします", reading: "후쿠로 오네가이시마스" },
      { ko: "면세 받을 수 있나요?", ja: "免税できますか", reading: "멘제이 데키마스카" },
      { ko: "시식해볼 수 있나요?", ja: "試食できますか", reading: "시쇼쿠 데키마스카" },
    ],
  },
  {
    category: "lodging",
    label: "숙박",
    phrases: [
      { ko: "체크인 하려고요", ja: "チェックインお願いします", reading: "첵쿠인 오네가이시마스" },
      { ko: "짐을 맡길 수 있나요?", ja: "荷物を預けられますか", reading: "니모츠오 아즈케라레마스카" },
      { ko: "체크아웃은 몇 시예요?", ja: "チェックアウトは何時ですか", reading: "첵쿠아우토와 난지데스카" },
      { ko: "와이파이 비밀번호가 뭐예요?", ja: "Wi-Fiのパスワードは何ですか", reading: "와이파이노 파스와도와 난데스카" },
    ],
  },
  {
    category: "free",
    label: "관광/자유시간",
    phrases: [
      { ko: "사진 좀 찍어주실 수 있나요?", ja: "写真を撮っていただけますか", reading: "샤신오 톳테 이타다케마스카" },
      { ko: "화장실이 어디예요?", ja: "トイレはどこですか", reading: "토이레와 도코데스카" },
      { ko: "여기서 멀어요?", ja: "ここから遠いですか", reading: "코코카라 토오이데스카" },
    ],
  },
];

export function getPhraseSetByCategory(category: CategoryPhraseSet["category"]): CategoryPhraseSet | undefined {
  return JAPAN_PHRASE_SETS.find((set) => set.category === category);
}
