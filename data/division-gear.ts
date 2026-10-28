/**
 * 디비전2 장비 시뮬레이터 장비 데이터. 공식 API가 없어 직접 큐레이션했다.
 * - 브랜드 세트 1/2/3피스: pcgamesn.com/the-division-2/brand-sets-bonuses 목록 순서 기준 (2026-10 확인)
 * - 브랜드 한글 이름: 나무위키 "톰 클랜시의 디비전 2/보호장구" 브랜드 세트 목록 (2026-10 확인)
 * - 기어세트 효과: 나무위키 "톰 클랜시의 디비전 2/보호장구 세트" 기준 (2026-10 확인)
 * - 브랜드 탤런트·속성 최대치: 게임 내 수치를 기억에 의존한 근사치. 타이틀 업데이트로 바뀌면 여기만 고친다.
 * 조건부 효과(스택형 탤런트 등)는 "최대 스택/상시 발동"을 가정한 값으로 넣었다.
 */

/** 시뮬레이터가 합산하는 스탯 종류. 값은 모두 % 단위(방어도·스킬 티어만 정수) */
export type StatKey =
  | "wd" // 무기 피해 (가산)
  | "chc" // 치명타 확률
  | "chd" // 치명타 피해
  | "hsd" // 헤드샷 피해
  | "wh" // 무기 조작
  | "rof" // 연사력
  | "reload" // 재장전 속도
  | "dta" // 방어도 피해
  | "dth" // 체력 피해
  | "dtooc" // 엄폐 밖 표적 피해
  | "arDmg"
  | "smgDmg"
  | "lmgDmg"
  | "rifleDmg"
  | "mmrDmg"
  | "shotgunDmg"
  | "pistolDmg"
  | "armor" // 방어도 (고정값)
  | "armorPct" // 전체 방어도 %
  | "armorRegen" // 방어도 재생 (고정값/초)
  | "armorRegenPct" // 방어도 재생 (전체 방어도의 %/초)
  | "armorOnKill"
  | "health"
  | "hazard"
  | "explosiveRes"
  | "pulseRes"
  | "incomingRepairs"
  | "skillTier"
  | "skillDmg"
  | "skillHaste"
  | "skillDur"
  | "repair"
  | "status"
  | "explosiveDmg"
  | "accuracy"
  | "stability"
  | "ammo";

export interface StatInfo {
  label: string;
  /** 표시 단위. "%"가 아니면 정수로 보여준다 */
  unit: "%" | "" | "/초";
  group: "offense" | "defense" | "skill" | "handling";
}

export const STAT_INFO: Record<StatKey, StatInfo> = {
  wd: { label: "무기 피해", unit: "%", group: "offense" },
  chc: { label: "치명타 확률", unit: "%", group: "offense" },
  chd: { label: "치명타 피해", unit: "%", group: "offense" },
  hsd: { label: "헤드샷 피해", unit: "%", group: "offense" },
  dta: { label: "방어도 피해", unit: "%", group: "offense" },
  dth: { label: "체력 피해", unit: "%", group: "offense" },
  dtooc: { label: "엄폐 밖 표적 피해", unit: "%", group: "offense" },
  arDmg: { label: "돌격소총 피해", unit: "%", group: "offense" },
  smgDmg: { label: "기관단총 피해", unit: "%", group: "offense" },
  lmgDmg: { label: "경기관총 피해", unit: "%", group: "offense" },
  rifleDmg: { label: "소총 피해", unit: "%", group: "offense" },
  mmrDmg: { label: "지정사수소총 피해", unit: "%", group: "offense" },
  shotgunDmg: { label: "산탄총 피해", unit: "%", group: "offense" },
  pistolDmg: { label: "권총 피해", unit: "%", group: "offense" },
  explosiveDmg: { label: "폭발 피해", unit: "%", group: "offense" },
  wh: { label: "무기 조작", unit: "%", group: "handling" },
  rof: { label: "연사력", unit: "%", group: "handling" },
  reload: { label: "재장전 속도", unit: "%", group: "handling" },
  accuracy: { label: "정확도", unit: "%", group: "handling" },
  stability: { label: "안정성", unit: "%", group: "handling" },
  ammo: { label: "탄약 용량", unit: "%", group: "handling" },
  armor: { label: "방어도", unit: "", group: "defense" },
  armorPct: { label: "전체 방어도", unit: "%", group: "defense" },
  armorRegen: { label: "방어도 재생", unit: "/초", group: "defense" },
  armorRegenPct: { label: "방어도 재생(%)", unit: "%", group: "defense" },
  armorOnKill: { label: "처치 시 방어도", unit: "%", group: "defense" },
  health: { label: "체력", unit: "%", group: "defense" },
  hazard: { label: "위험 보호", unit: "%", group: "defense" },
  explosiveRes: { label: "폭발 저항", unit: "%", group: "defense" },
  pulseRes: { label: "펄스 저항", unit: "%", group: "defense" },
  incomingRepairs: { label: "받는 수리량", unit: "%", group: "defense" },
  skillTier: { label: "스킬 티어", unit: "", group: "skill" },
  skillDmg: { label: "스킬 피해", unit: "%", group: "skill" },
  skillHaste: { label: "스킬 가속", unit: "%", group: "skill" },
  skillDur: { label: "스킬 지속시간", unit: "%", group: "skill" },
  repair: { label: "수리 스킬", unit: "%", group: "skill" },
  status: { label: "상태 이상 효과", unit: "%", group: "skill" },
};

export interface StatEffect {
  stat: StatKey;
  value: number;
}

/**
 * 곱연산(증폭) 피해. 글래스 캐논·하트브레이커처럼 무기 피해 버킷과 따로 곱해지는 효과.
 * value는 % 단위
 */
export interface AmpEffect {
  label: string;
  value: number;
}

/** 장비 효과 묶음: 가산 스탯과 증폭 피해를 함께 담는다 */
export interface Bonus {
  stats?: StatEffect[];
  amps?: AmpEffect[];
  /** 수치로 계산하지 않는 효과 설명 */
  note?: string;
}

export type GearSlotId = "mask" | "backpack" | "chest" | "gloves" | "holster" | "kneepads";

export const GEAR_SLOTS: { id: GearSlotId; label: string; icon: string; hasMod: boolean; hasTalent: boolean }[] = [
  { id: "mask", label: "마스크", icon: "😷", hasMod: true, hasTalent: false },
  { id: "chest", label: "조끼", icon: "🦺", hasMod: true, hasTalent: true },
  { id: "backpack", label: "배낭", icon: "🎒", hasMod: true, hasTalent: true },
  { id: "gloves", label: "장갑", icon: "🧤", hasMod: false, hasTalent: false },
  { id: "holster", label: "권총집", icon: "🔫", hasMod: false, hasTalent: false },
  { id: "kneepads", label: "무릎보호대", icon: "🦵", hasMod: false, hasTalent: false },
];

export type CoreId = "red" | "blue" | "yellow";

export const CORE_ATTRIBUTES: Record<CoreId, { label: string; effect: StatEffect; color: string }> = {
  red: { label: "무기 피해 +15%", effect: { stat: "wd", value: 15 }, color: "bg-red-500" },
  blue: { label: "방어도 +170,370", effect: { stat: "armor", value: 170370 }, color: "bg-sky-500" },
  yellow: { label: "스킬 티어 +1", effect: { stat: "skillTier", value: 1 }, color: "bg-amber-400" },
};

/** 장비 부가 속성(최대치). 장비 모드도 같은 목록에서 고른다 */
export const MINOR_ATTRIBUTES: { id: string; effect: StatEffect; kind: CoreId }[] = [
  { id: "chc", effect: { stat: "chc", value: 6 }, kind: "red" },
  { id: "chd", effect: { stat: "chd", value: 12 }, kind: "red" },
  { id: "hsd", effect: { stat: "hsd", value: 10 }, kind: "red" },
  { id: "wh", effect: { stat: "wh", value: 8 }, kind: "red" },
  { id: "armorRegen", effect: { stat: "armorRegen", value: 4925 }, kind: "blue" },
  { id: "health", effect: { stat: "health", value: 10 }, kind: "blue" },
  { id: "hazard", effect: { stat: "hazard", value: 10 }, kind: "blue" },
  { id: "explosiveRes", effect: { stat: "explosiveRes", value: 10 }, kind: "blue" },
  { id: "skillDmg", effect: { stat: "skillDmg", value: 10 }, kind: "yellow" },
  { id: "skillHaste", effect: { stat: "skillHaste", value: 12 }, kind: "yellow" },
  { id: "repair", effect: { stat: "repair", value: 20 }, kind: "yellow" },
  { id: "status", effect: { stat: "status", value: 10 }, kind: "yellow" },
];

export interface Brand {
  id: string;
  /** 한글판 게임 내 이름 */
  name: string;
  /** 영문 이름 */
  en: string;
  /** [1피스, 2피스, 3피스] */
  bonuses: [Bonus, Bonus, Bonus];
}

const s = (stat: StatKey, value: number): Bonus => ({ stats: [{ stat, value }] });

export const BRANDS: Brand[] = [
  { id: "511", name: "5.11 Tactical", en: "5.11 Tactical", bonuses: [s("health", 10), s("incomingRepairs", 15), s("hazard", 10)] },
  { id: "airaldi", name: "아이랄디 홀딩", en: "Airaldi Holdings", bonuses: [s("mmrDmg", 10), s("hsd", 10), s("dta", 5)] },
  { id: "alps", name: "알프스 정상 군수산업", en: "Alps Summit Armament", bonuses: [s("repair", 15), s("skillDur", 20), s("skillHaste", 10)] },
  { id: "badger", name: "배저 터프", en: "Badger Tuff", bonuses: [s("shotgunDmg", 10), s("armorPct", 5), s("armorOnKill", 10)] },
  { id: "ceska", name: "체코 중공업 유한회사", en: "Česká Výroba s.r.o.", bonuses: [s("chc", 10), s("hazard", 10), s("health", 10)] },
  { id: "china", name: "차이나 경공업", en: "China Light Industries", bonuses: [s("explosiveDmg", 15), s("skillHaste", 10), s("status", 10)] },
  { id: "douglas", name: "더글라스 & 하딩", en: "Douglas & Harding", bonuses: [s("pistolDmg", 20), s("stability", 10), s("accuracy", 10)] },
  { id: "fenris", name: "펜리르 그룹 AB", en: "Fenris Group AB", bonuses: [s("arDmg", 10), s("reload", 10), s("stability", 10)] },
  { id: "gila", name: "길라 가드", en: "Gila Guard", bonuses: [s("armorPct", 5), s("health", 10), s("armorRegenPct", 1)] },
  { id: "golan", name: "골란 기어 유한회사", en: "Golan Gear Ltd", bonuses: [s("status", 10), s("armorRegenPct", 1), s("armorPct", 5)] },
  { id: "sombra", name: "그루포 솜브라 주식회사", en: "Grupo Sombra S.A.", bonuses: [s("chd", 15), s("explosiveDmg", 15), s("hsd", 10)] },
  { id: "hana", name: "하나-U 기업", en: "Hana-U Corporation", bonuses: [s("skillHaste", 10), s("skillDmg", 10), s("wd", 5)] },
  { id: "murakami", name: "무라카미 산업", en: "Murakami Industries", bonuses: [s("skillDur", 20), s("repair", 15), s("skillDmg", 10)] },
  { id: "overlord", name: "오버로드 군수산업", en: "Overlord Armaments", bonuses: [s("rifleDmg", 10), s("accuracy", 10), s("wh", 10)] },
  { id: "petrov", name: "페트로프 방위 그룹", en: "Petrov Defense Group", bonuses: [s("lmgDmg", 10), s("wh", 10), s("ammo", 20)] },
  { id: "providence", name: "프로비던스 방위산업", en: "Providence Defense", bonuses: [s("hsd", 10), s("chc", 10), s("chd", 15)] },
  { id: "richter", name: "리히터 & 카이저 유한회사", en: "Richter & Kaiser GmbH", bonuses: [s("incomingRepairs", 15), s("explosiveRes", 10), s("repair", 5)] },
  { id: "sokolov", name: "소콜로프 상사", en: "Sokolov Concern", bonuses: [s("smgDmg", 10), s("chd", 15), s("chc", 10)] },
  { id: "walker", name: "워커 해리스", en: "Walker, Harris & Co.", bonuses: [s("wd", 5), s("dta", 5), s("dth", 5)] },
  { id: "wyvern", name: "와이번 웨어", en: "Wyvern Wear", bonuses: [s("skillDur", 10), s("status", 10), s("skillDur", 20)] },
  { id: "yaahl", name: "얄 기어", en: "Yaahl Gear", bonuses: [s("hazard", 10), s("wd", 5), s("pulseRes", 40)] },
];

/**
 * 브랜드·기어세트 이미지. 디비전 팬덤 위키(thedivision.fandom.com)에 올라온 파일을 그대로 링크한다.
 * 값은 static.wikia.nocookie.net/thedivision/images/ 뒤 경로이고, wikiImage()로 원하는 폭의 주소를 만든다.
 * logo는 흰색 투명 배경 로고라 어두운 배경 위에 올린다.
 */
export const BRAND_IMAGES: Record<string, { logo: string }> = {
  "511": { logo: "2/22/TD2_5.11_Tactical_Logo.png" },
  airaldi: { logo: "b/b1/TD2_Airaldi_Holdings_Logo.png" },
  alps: { logo: "e/e3/TD2_Alps_Summit_Armament_Logo.png" },
  badger: { logo: "4/46/TD2_Badger_Tuff_Logo.png" },
  ceska: { logo: "0/01/TD2_%C4%8Cesk%C3%A1_V%C3%BDroba_s.r.o._Logo.png" },
  china: { logo: "c/c4/TD2_China_Light_Industries_Corporation_Logo.png" },
  douglas: { logo: "2/28/TD2_Douglas_%26_Harding_Logo.png" },
  fenris: { logo: "3/3b/TD2_Fenris_Group_AB_Logo.png" },
  gila: { logo: "0/06/TD2_Gila_Guard_Logo.png" },
  golan: { logo: "9/95/TD2_Golan_Gear_Ltd_Logo.png" },
  sombra: { logo: "7/78/TD2_Grupo_Sombra_S.A._Logo.png" },
  hana: { logo: "8/80/TD2_Hana-U_Corporation_Logo.png" },
  murakami: { logo: "a/ab/TD2_Murakami_Industries_Logo.png" },
  overlord: { logo: "9/90/TD2_Overlord_Armaments_Logo.png" },
  petrov: { logo: "3/3a/TD2_Petrov_Defense_Group_Logo.png" },
  providence: { logo: "a/ac/TD2_Providence_Defense_Logo.png" },
  richter: { logo: "2/22/TD2_Richter_%26_Kaiser_GmbH_Logo.png" },
  sokolov: { logo: "4/43/TD2_Sokolov_Concern_Logo.png" },
  walker: { logo: "7/7c/TD2_Walker%2C_Harris_%26_Co._Logo.png" },
  wyvern: { logo: "b/b9/TD2_Wyvern_Wear_Logo.png" },
  yaahl: { logo: "7/7e/TD2_Yaahl_Gear_Logo.png" },
};

/**
 * 기어세트 이미지. banner는 왼쪽에 둥근 세트 엠블럼, 오른쪽에 이름 띠가 있는 525×153 이미지라
 * 엠블럼만 보이게 왼쪽을 잘라 쓴다.
 */
export const GEAR_SET_IMAGES: Record<string, { banner: string }> = {
  striker: { banner: "7/70/Striker%27s_Battlegear.png" },
  heartbreaker: { banner: "8/8e/Heartbreaker.png" },
  "hunters-fury": { banner: "9/90/Hunter%27s_Fury.png" },
  negotiator: { banner: "2/21/Negotiator%27s_Dilemma.png" },
  aces: { banner: "0/0d/Aces_%26_Eights.png" },
  "hard-wired": { banner: "8/8c/Hard_Wired.png" },
  foundry: { banner: "a/a6/Foundry_Bulwark.png" },
};

export function wikiImage(path: string, width: number): string {
  return `https://static.wikia.nocookie.net/thedivision/images/${path}/revision/latest/scale-to-width-down/${width}`;
}

export interface GearSet {
  id: string;
  /** 한글판 게임 내 이름 */
  name: string;
  /** 영문 이름 */
  en: string;
  /** 2피스, 3피스 보너스 */
  twoPiece: Bonus;
  threePiece: Bonus;
  /** 4피스 세트 효과 이름과 효과 */
  fourPiece: { name: string; bonus: Bonus };
  /** 조끼·배낭 세트 탤런트. 장착하면 4피스 효과를 강화한다 (4피스가 켜져 있을 때만 적용) */
  chest: { name: string; bonus: Bonus };
  backpack: { name: string; bonus: Bonus };
  /**
   * 중첩형 4피스 증폭 피해. 조끼(최대 중첩 증가)와 배낭(중첩당 효과 증가)이 서로 곱해지므로
   * 따로따로 증폭을 더하지 않고 한 번에 계산한다. 반환값은 % 단위
   */
  ampScaling?: (hasChest: boolean, hasBackpack: boolean) => number;
}

// 세트 이름·수치 출처: 나무위키 "톰 클랜시의 디비전 2/보호장구 세트" (2026-10 확인)
export const GEAR_SETS: GearSet[] = [
  {
    id: "striker",
    name: "기동타격대 전투 장비",
    en: "Striker's Battlegear",
    twoPiece: s("wh", 15),
    threePiece: s("rof", 15),
    fourPiece: { name: "기동타격대의 도박", bonus: { note: "명중마다 종합 무기 피해 0.65% 증폭, 최대 100중첩 (최대 중첩 가정)" } },
    chest: { name: "여세 몰이", bonus: { note: "최대 중첩 100 → 200" } },
    backpack: { name: "위기 관리", bonus: { note: "중첩당 증폭 0.65% → 0.90%" } },
    ampScaling: (hasChest, hasBackpack) => (hasChest ? 200 : 100) * (hasBackpack ? 0.9 : 0.65),
  },
  {
    id: "heartbreaker",
    name: "하트브레이커",
    en: "Heartbreaker",
    twoPiece: { stats: [{ stat: "arDmg", value: 15 }, { stat: "lmgDmg", value: 15 }] },
    threePiece: s("wh", 15),
    fourPiece: {
      name: "경악",
      bonus: { note: "헤드샷 시 펄스, 펄스된 적 명중마다 피해 1.1% 증폭·보너스 방어도 1%, 최대 50중첩 (최대 중첩 가정)" },
    },
    chest: { name: "최대 BPM", bonus: { note: "최대 중첩 50 → 100" } },
    backpack: { name: "추위", bonus: { note: "중첩당 보너스 방어도 1% → 2%" } },
    ampScaling: (hasChest) => (hasChest ? 100 : 50) * 1.1,
  },
  {
    id: "hunters-fury",
    name: "사냥꾼의 격노",
    en: "Hunter's Fury",
    twoPiece: { stats: [{ stat: "smgDmg", value: 15 }, { stat: "shotgunDmg", value: 15 }] },
    threePiece: { stats: [{ stat: "armorOnKill", value: 20 }], note: "처치 시 생명력 회복 +50%" },
    fourPiece: {
      name: "최상위 포식자",
      bonus: {
        amps: [
          { label: "최상위 포식자 (15m 이내)", value: 20 },
          // 처치 시 무기 피해 5% 증폭이 복리로 최대 5중첩: 1.05^5
          { label: "최상위 포식자 처치 중첩 (5중첩)", value: 27.6 },
        ],
        note: "15m 이내 적 피해 20% 증폭, 처치 시 5% 증폭 최대 5중첩 (최대 중첩 가정)",
      },
    },
    chest: { name: "무한한 허기", bonus: { note: "처치 중첩 지속시간 10초 → 30초" } },
    backpack: { name: "압도적인 힘", bonus: { note: "처치 시 방향감각 상실 반경 5m → 10m" } },
  },
  {
    id: "negotiator",
    name: "협상가의 딜레마",
    en: "Negotiator's Dilemma",
    twoPiece: s("chc", 15),
    threePiece: s("chd", 20),
    fourPiece: {
      name: "적대적 교섭",
      bonus: {
        stats: [{ stat: "chd", value: 100 }],
        note: "치명타로 징표를 남긴 적들에게 피해 60% 전파 (단일 표적 DPS 미반영), 징표 대상 처치 시 전투 종료까지 치명타 피해 +10%, 최대 10중첩 (최대 중첩 가정)",
      },
    },
    chest: { name: "물 반 고기 반", bonus: { note: "징표 개수 3개 → 5개" } },
    backpack: { name: "임계 수치", bonus: { note: "징표 대상 전파 피해 60% → 112%" } },
  },
  {
    id: "aces",
    name: "에이스 & 에이트",
    en: "Aces & Eights",
    twoPiece: { stats: [{ stat: "mmrDmg", value: 30 }, { stat: "rifleDmg", value: 30 }] },
    threePiece: { stats: [{ stat: "hsd", value: 30 }, { stat: "wh", value: 30 }] },
    fourPiece: {
      name: "망자의 손패",
      bonus: { note: "소총·지정사수소총 명중마다 카드 1장, 5장을 뒤집으면 다음 2~4발 피해 75% 증폭 (평균 3발, 평균값으로 환산)" },
    },
    chest: { name: "무제한", bonus: { note: "증폭 75% → 100%" } },
    backpack: { name: "비장의 패", bonus: { note: "강화 사격 +1발" } },
    // 카드 5장 + 강화 사격 n발이 한 주기라고 보고, 강화 사격 비율만큼 평균 증폭으로 환산한다
    ampScaling: (hasChest, hasBackpack) => {
      const boosted = hasBackpack ? 4 : 3;
      return (hasChest ? 100 : 75) * (boosted / (5 + boosted));
    },
  },
  {
    id: "hard-wired",
    name: "하드 와이어드",
    en: "Hard Wired",
    twoPiece: s("skillHaste", 15),
    threePiece: { stats: [{ stat: "skillDmg", value: 15 }, { stat: "repair", value: 30 }] },
    fourPiece: {
      name: "피드백 루프",
      bonus: {
        stats: [{ stat: "skillDmg", value: 10 }, { stat: "repair", value: 10 }],
        note: "스킬 사용·취소 시 다른 스킬 재사용 대기시간 30초 감소, 20초간 스킬 피해·회복 +10%",
      },
    },
    chest: {
      name: "긍정적 강화",
      bonus: { stats: [{ stat: "skillDmg", value: 15 }, { stat: "repair", value: 15 }], note: "피드백 루프 보너스 10% → 25%" },
    },
    backpack: { name: "단락 회로", bonus: { note: "피드백 루프 재사용 대기시간 10초 → 5초" } },
  },
  {
    id: "foundry",
    name: "주조소의 방패",
    en: "Foundry Bulwark",
    twoPiece: s("armorPct", 10),
    threePiece: { stats: [{ stat: "armorRegenPct", value: 1 }], note: "방패 생명력 +50%" },
    fourPiece: { name: "현장 수리", bonus: { note: "자신·방패가 받은 피해의 25%를 10초에 걸쳐 양쪽 모두 회복" } },
    chest: { name: "개선된 재료", bonus: { note: "현장 수리 회복 25% → 35%" } },
    backpack: { name: "정제 공정", bonus: { note: "현장 수리 시간 10초 → 5초" } },
  },
];

export interface Talent {
  id: string;
  name: string;
  slot: "chest" | "backpack";
  desc: string;
  bonus: Bonus;
}

/** 브랜드 조끼·배낭에 붙는 탤런트 (조건부 효과는 상시 발동 가정) */
export const GEAR_TALENTS: Talent[] = [
  { id: "glass-cannon", name: "Glass Cannon", slot: "chest", desc: "모든 피해 증폭 +25%, 받는 피해 +50%", bonus: { amps: [{ label: "글래스 캐논", value: 25 }] } },
  { id: "obliterate", name: "Obliterate", slot: "chest", desc: "치명타마다 무기 피해 +1%, 최대 25스택", bonus: { stats: [{ stat: "wd", value: 25 }] } },
  { id: "focus", name: "Focus", slot: "chest", desc: "8배율 이상 조준 시 초당 무기 피해 +5%, 최대 50%", bonus: { stats: [{ stat: "wd", value: 50 }] } },
  { id: "spotter", name: "Spotter", slot: "chest", desc: "펄스된 적에게 증폭 피해 +15%", bonus: { amps: [{ label: "스포터", value: 15 }] } },
  { id: "intimidate", name: "Intimidate", slot: "chest", desc: "보너스 방어도 상태에서 10m 이내 증폭 피해 +35%", bonus: { amps: [{ label: "인티미데이트", value: 35 }] } },
  { id: "headhunter", name: "Headhunter", slot: "chest", desc: "헤드샷 처치 후 다음 헤드샷에 피해 이전 (단일 표적 DPS 미반영)", bonus: {} },
  { id: "unbreakable", name: "Unbreakable", slot: "chest", desc: "방어도가 깨지면 방어도 즉시 회복 (방어 탤런트)", bonus: {} },
  { id: "vigilance", name: "Vigilance", slot: "backpack", desc: "무기 피해 +25%, 피해를 받으면 4초간 해제", bonus: { stats: [{ stat: "wd", value: 25 }] } },
  { id: "composure", name: "Composure", slot: "backpack", desc: "엄폐 중 증폭 피해 +15%", bonus: { amps: [{ label: "컴포저", value: 15 }] } },
  { id: "companion", name: "Companion", slot: "backpack", desc: "5m 이내 아군·스킬이 있으면 증폭 피해 +15%", bonus: { amps: [{ label: "컴패니언", value: 15 }] } },
  { id: "wicked", name: "Wicked", slot: "backpack", desc: "상태 이상 적용 시 증폭 피해 +18%", bonus: { amps: [{ label: "위키드", value: 18 }] } },
  { id: "bloodsucker", name: "Bloodsucker", slot: "backpack", desc: "처치 시 보너스 방어도 (방어 탤런트)", bonus: {} },
  { id: "concussion", name: "Concussion", slot: "backpack", desc: "헤드샷 시 1.5초간 무기 피해 +10%", bonus: { stats: [{ stat: "wd", value: 10 }] } },
];

/** SHD 레벨 최대 보너스 */
export const SHD_BONUS: StatEffect[] = [
  { stat: "wd", value: 10 },
  { stat: "hsd", value: 10 },
  { stat: "chc", value: 10 },
  { stat: "chd", value: 20 },
  { stat: "armorPct", value: 10 },
  { stat: "health", value: 10 },
  { stat: "hazard", value: 10 },
  { stat: "explosiveRes", value: 10 },
];

/** 치명타 확률 상한 */
export const CHC_CAP = 60;
/** 치명타 피해 기본값 */
export const BASE_CHD = 25;
