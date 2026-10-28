/**
 * 디비전2 장비 시뮬레이터 무기 데이터. 출처: 나무위키 (2026-10 확인)
 * - 일반 무기 기본 수치·핵심 속성 최대치: "톰 클랜시의 디비전 2/무기"
 * - 네임드 무기: "톰 클랜시의 디비전 2/네임드 장비" 무기 항목
 * - 특급 무기: "톰 클랜시의 디비전 2/특급 장비" 무기 항목
 * 기본 수치는 레벨 40 기준이며 화면에서 직접 고쳐 쓸 수 있다.
 * 조건부 효과(스택형 특수효과 등)는 최대 스택/상시 발동 또는 평균값을 가정하고, 단일 표적 DPS로
 * 환산하기 어려운 효과는 desc로만 보여준다.
 */
import type { Bonus, StatEffect, StatKey } from "./division-gear";

export type WeaponClassId = "ar" | "smg" | "lmg" | "rifle" | "mmr" | "shotgun" | "pistol";

/** 무기 종류별 핵심 속성: 무기군 대미지 15% + 무기군 고유 속성 */
export const WEAPON_CLASSES: Record<
  WeaponClassId,
  { label: string; typeDmgStat: StatKey; core: StatEffect | null; coreLabel: string }
> = {
  ar: { label: "돌격소총", typeDmgStat: "arDmg", core: { stat: "dth", value: 21 }, coreLabel: "생명력 대미지 +21%" },
  smg: { label: "기관단총", typeDmgStat: "smgDmg", core: { stat: "chc", value: 21 }, coreLabel: "치명타 확률 +21%" },
  lmg: { label: "경기관총", typeDmgStat: "lmgDmg", core: { stat: "dtooc", value: 12 }, coreLabel: "비엄폐 대상 대미지 +12%" },
  rifle: { label: "소총", typeDmgStat: "rifleDmg", core: { stat: "chd", value: 34 }, coreLabel: "치명타 대미지 +34%" },
  mmr: { label: "지정사수소총", typeDmgStat: "mmrDmg", core: { stat: "hsd", value: 111 }, coreLabel: "헤드샷 대미지 +111%" },
  shotgun: { label: "산탄총", typeDmgStat: "shotgunDmg", core: { stat: "dta", value: 12 }, coreLabel: "방어도 대상 대미지 +12%" },
  pistol: { label: "권총", typeDmgStat: "pistolDmg", core: null, coreLabel: "고유 핵심 속성 없음" },
};

/** 무기군 대미지 핵심 속성 (모든 무기 공통) */
export const WEAPON_TYPE_CORE = 15;

export type WeaponKind = "normal" | "named" | "exotic";

export interface WeaponItem {
  id: string;
  /** 한글판 이름 */
  name: string;
  en?: string;
  kind: WeaponKind;
  cls: WeaponClassId;
  /** 발당 기본 피해 (산탄총은 펠릿 합계) */
  damage: number;
  rpm: number;
  mag: number;
  /** 재장전 시간(초). 0이면 재장전이 필요 없다 */
  reload: number;
  /** 네임드·특급의 기반 무기 */
  base?: string;
  /** 네임드 고유 속성. 무기 속성 자리를 고정으로 차지한다 */
  perfectAttr?: { desc: string; bonus: Bonus };
  /** 네임드·특급 고유 특수효과. 탤런트 자리를 고정으로 차지한다 */
  fixedTalent?: { name: string; desc: string; bonus: Bonus };
  /** 특급 부착물·네임드 고유 능력치처럼 칸을 차지하지 않고 항상 붙는 효과 */
  fixed?: { desc: string; bonus: Bonus };
  /** 무기군 고유 핵심 속성이 다른 특급 무기 */
  coreOverride?: StatEffect;
}

const stat = (s: StatKey, value: number): Bonus => ({ stats: [{ stat: s, value }] });
const stats = (...list: [StatKey, number][]): Bonus => ({ stats: list.map(([s, value]) => ({ stat: s, value })) });
const amp = (label: string, value: number): Bonus => ({ amps: [{ label, value }] });
const none: Bonus = {};

// ── 일반 무기 ─────────────────────────────────────────────

type NormalRow = [id: string, name: string, damage: number, rpm: number, mag: number, reload: number];

function normals(cls: WeaponClassId, list: NormalRow[]): WeaponItem[] {
  return list.map(([id, name, damage, rpm, mag, reload]) => ({ id, name, kind: "normal", cls, damage, rpm, mag, reload }));
}

const NORMAL_WEAPONS: WeaponItem[] = [
  ...normals("ar", [
    ["police-m4", "경찰용 M4", 46900, 850, 30, 2.24],
    ["akm", "AK-M", 67200, 600, 30, 2.26],
    ["akm-bm", "블랙마켓 AK-M", 64700, 600, 30, 2.26],
    ["acr", "ACR", 58900, 650, 30, 1.91],
    ["fal", "FAL", 57600, 700, 20, 2.14],
    ["ctar21", "CTAR-21", 44800, 900, 30, 2.39],
    ["f2000", "F2000", 49100, 850, 30, 2.4],
    ["aug-cqc", "AUG A3-CQC", 57200, 680, 42, 2.16],
    ["p416", "P416", 47400, 850, 30, 2.34],
    ["g36", "G36", 52600, 750, 30, 2.34],
    ["famas", "FAMAS 2010", 45300, 900, 30, 2.49],
    ["mk16", "Mk16", 59200, 650, 30, 2.02],
    ["carbine7", "Carbine 7", 49800, 790, 30, 2.02],
    ["honey-badger", "Honey Badger", 51300, 800, 30, 2.06],
    ["sig556", "SIG 556", 55900, 700, 30, 2.17],
    ["pdr", "PDR", 57600, 700, 30, 2.04],
    ["tkb408", "TKB-408", 63500, 600, 30, 1.87],
  ]),
  ...normals("smg", [
    ["aug", "AUG A3P", 58700, 725, 25, 2.31],
    ["t821", "T821", 76900, 550, 32, 1.47],
    ["ump45", "UMP-45", 63700, 650, 25, 1.67],
    ["mp5", "MP5", 53900, 800, 30, 1.79],
    ["mp7", "MP7", 46400, 950, 40, 1.45],
    ["mpx", "SIG MPX", 51000, 850, 30, 2.09],
    ["p90", "P90", 39500, 1100, 50, 1.43],
    ["smg9", "SMG-9", 48500, 1000, 32, 2.26],
    ["pp19", "PP-19", 63600, 700, 53, 1.33],
    ["vector", "Vector SBR 9mm", 39300, 1200, 33, 2.38],
    ["vector-45", "Vector SBR .45 ACP", 38300, 1200, 25, 2.06],
    ["vector-tac", "전술용 Vector SBR 9mm", 40500, 1200, 19, 1.69],
    ["m1928", "M1928", 78400, 600, 30, 1.46],
    ["tommy", "Tommy Gun", 50600, 900, 50, 1.4],
    ["banshee", "CMMG Banshee", 47800, 900, 32, 1.92],
  ]),
  ...normals("lmg", [
    ["m60", "M60", 65200, 600, 100, 3.5],
    ["m60-classic", "클래식 M60", 67700, 600, 100, 3.41],
    ["m249", "M249", 48300, 850, 100, 4.13],
    ["l86", "L86", 61100, 700, 30, 3.18],
    ["rpk", "RPK-74", 71500, 600, 40, 4],
    ["mg5", "MG5", 54300, 800, 50, 2.69],
    ["mg5-inf", "보병용 MG5", 52300, 800, 50, 2.74],
    ["stoner", "Stoner LAMG", 62400, 580, 200, 2.73],
    ["negev", "IWI Negev", 54600, 750, 100, 3.64],
    ["gr9", "GR9", 49500, 750, 200, 3.3],
  ]),
  ...normals("shotgun", [
    ["db", "더블 배럴 산탄총", 678100, 200, 2, 3.54],
    ["m870", "M870", 703700, 75, 5, 3.04],
    ["super90", "Super 90", 389900, 160, 8, 4.23],
    ["sasg", "SASG-12", 349800, 180, 7, 2.77],
    ["acs12", "ACS-12", 180800, 300, 20, 3.05],
    ["spas12", "SPAS-12", 716000, 70, 8, 4.23],
    ["ksg", "KSG", 678900, 70, 12, 7.26],
    ["six12", "SIX12", 409600, 130, 7, 2.73],
    ["sawed-off", "더블 배럴 소드 오프", 635700, 200, 2, 2.28],
  ]),
  ...normals("mmr", [
    ["m700", "M700 Carbon", 412500, 55, 7, 3.62],
    ["model700", "Model 700", 441600, 55, 7, 6.41],
    ["srs", "SRS", 409400, 60, 7, 3.9],
    ["m44", "M44 Carbine", 417700, 55, 5, 3.9],
    ["m44-classic", "클래식 M44 Carbine", 433600, 55, 5, 3.9],
    ["sr1", "SR-1", 409400, 60, 5, 2.86],
    ["svd", "SVD", 156700, 260, 10, 2.59],
    ["mk20", "SOCOM Mk20 SSR", 145900, 275, 20, 4.99],
    ["g28", "G28", 206400, 180, 20, 3.6],
    ["tac308", "전술용 .308", 403800, 70, 7, 2.76],
  ]),
  ...normals("rifle", [
    ["lw-m4", "경량형 M4", 107300, 360, 30, 2.03],
    ["lvoa", "LVOA-C", 100600, 380, 30, 2.08],
    ["mdr", "도심 MDR", 103000, 380, 20, 2.85],
    ["acr-ss", "ACR SS", 92400, 420, 30, 2.63],
    ["m1a", "M1A", 129200, 320, 10, 2.11],
    ["m1a-classic", "클래식 M1A", 231300, 180, 10, 2.36],
    ["mk17", "Mk17", 145900, 275, 10, 2.45],
    ["usc", "USC .45 ACP", 97700, 420, 20, 2.88],
    ["m16a2", "M16A2", 107000, 400, 30, 2.44],
    // 1886은 한 발씩 장전한다 (발당 0.65초 × 8발)
    ["r1886", "1886", 387000, 100, 8, 5.2],
    ["sig716", "SIG 716", 121300, 320, 20, 2.68],
    ["sig716-cqb", "SIG 716 CQB", 125900, 320, 20, 2.63],
    ["uic15", "UIC15", 150300, 240, 30, 1.73],
    ["mk47", "Resolute MK47", 124900, 300, 30, 1.94],
  ]),
  ...normals("pistol", [
    ["diceros", "Diceros", 204800, 180, 6, 1.75],
    ["magnum586", "586 Magnum", 233300, 160, 6, 2.31],
    ["m45a1", "M45A1", 117400, 310, 7, 2.12],
    ["m1911", "M1911", 129900, 310, 7, 2.04],
    ["pf45", "PF45", 100700, 370, 10, 1.58],
    ["pf45-custom", "커스텀 PF45", 94000, 370, 10, 1.61],
    ["m9", "M9", 102600, 350, 15, 1.73],
    ["m9-officer", "장교용 M9", 95700, 350, 15, 1.78],
    ["px4", "Px4 Storm", 91700, 380, 14, 1.48],
    ["x45", "X-45", 88300, 400, 15, 1.81],
    ["93r", "93R", 53000, 700, 20, 1.55],
    ["d50", "D50", 189200, 200, 8, 2.04],
    ["p320", "P320 XCompact", 87500, 380, 17, 1.61],
    ["maxim9", "Maxim 9", 125400, 280, 17, 1.26],
    ["kard45", "KARD-45", 114300, 310, 10, 1.55],
  ]),
];

function baseOf(id: string): WeaponItem {
  const found = NORMAL_WEAPONS.find((w) => w.id === id);
  if (!found) throw new Error(`알 수 없는 기반 무기: ${id}`);
  return found;
}

// ── 네임드 무기 ───────────────────────────────────────────

/**
 * T: 고유 특수효과(탤런트 고정), A: 고유 속성(무기 속성 고정), F: 고유 능력치(칸 차지 없음)
 * override: 기본 수치가 기반 무기와 다른 네임드 (예: 렉싱턴 +3.8% 기본 대미지)
 */
type NamedRow = [
  id: string,
  name: string,
  en: string,
  base: string,
  tag: "T" | "A" | "F",
  effectName: string | null,
  desc: string,
  bonus: Bonus,
  override?: Partial<Pick<WeaponItem, "damage" | "rpm" | "mag" | "reload">>,
];

function nameds(list: NamedRow[]): WeaponItem[] {
  return list.map(([id, name, en, baseId, tag, effectName, desc, bonus, override]) => {
    const base = baseOf(baseId);
    const item: WeaponItem = {
      id,
      name,
      en,
      kind: "named",
      cls: base.cls,
      damage: base.damage,
      rpm: base.rpm,
      mag: base.mag,
      reload: base.reload,
      base: base.name,
      ...override,
    };
    if (tag === "T") item.fixedTalent = { name: effectName ?? name, desc, bonus };
    else if (tag === "A") item.perfectAttr = { desc, bonus };
    else item.fixed = { desc, bonus };
    return item;
  });
}

const NAMED_WEAPONS: WeaponItem[] = nameds([
  // 돌격소총
  ["invisible-hand", "보이지 않는 손", "Invisible Hand", "aug-cqc", "T", "완벽한 빠르고 경쾌하게", "발사 속도 +15%", stat("rof", 15)],
  ["pyromaniac", "방화광", "Pyromaniac", "police-m4", "T", "완벽한 점화", "화상 상태인 적에 대한 무기 대미지 +30%", stat("wd", 30)],
  ["shield-splinterer", "방패 분쇄기", "Shield Splinterer", "f2000", "T", "완벽한 낙천주의자", "탄창 탄약이 10% 소모될 때마다 무기 대미지 +4.5% (평균 +22.5% 가정)", stat("wd", 22.5)],
  ["railsplitter", "나무꾼", "The Railsplitter", "ctar21", "T", "완벽한 정밀사격", "명중률 +80%", none],
  ["savage-wolverine", "흉포한 이리", "Savage Wolverine", "honey-badger", "T", "완벽한 근접전의 대가", "7m 내 대상 처치 시 10초 동안 무기 대미지 +38%", stat("wd", 38)],
  ["burn-out", "탈진", "Burn Out", "famas", "T", "완벽한 텅 빈 탄창", "빈 탄창을 재장전하면 10초 동안 무기 조작력 +80%", stat("wh", 80)],
  ["glory-daze", "영광의 섬광", "Glory Daze", "p416", "T", "완벽한 근시안", "적정 사거리 -35%, 안정성 +100%", none],
  ["manic", "광증", "Manic", "akm-bm", "T", "완벽한 공급 과잉", "빈 탄창을 2번 재장전할 때마다 기본 탄창 휴대량 +100%", none],
  ["mechanical-animal", "기계 동물", "Mechanical Animal", "sig556", "T", "완벽한 미래", "무기로 처치 시 19초 동안 스킬 등급 +1, 최대 4중첩", none],
  ["test-subject", "실험체", "Test Subject", "pdr", "T", "완벽한 동기화", "적중 시 스킬 대미지 +20%, 스킬 사용 시 무기 대미지 +20% (둘 다면 두 배)", stat("wd", 20)],
  ["kingbreaker", "왕 분쇄자", "Kingbreaker", "tkb408", "T", "완벽한 심정지", "펄스에 탐지된 적에 대한 무기 대미지 +20%", stat("wd", 20)],
  ["born-great", "위대한 혈통", "Born Great", "g36", "T", "완벽한 안정화", "사격할 때마다 명중률·안정성 +1%, 최대 75%", none],
  ["the-drill", "드릴", "The Drill", "carbine7", "T", "완벽한 정밀 타격", "20m 밖 처치로 쌓은 중첩으로 20m 내 적에게 5초 동안 증폭 대미지 +35%", amp("완벽한 정밀 타격", 35)],
  ["lexington", "렉싱턴", "Lexington", "police-m4", "F", null, "+3.8% 기본 대미지 (경찰용 M4 능력치, LVOA-C 외형)", none, { damage: Math.round(46900 * 1.038) }],
  ["first-sight", "첫눈에 반하다", "First Sight", "akm", "F", null, "+30% 헤드샷 대미지", stat("hsd", 30)],
  ["goalie", "골키퍼", "Goalie", "fal", "T", "완벽한 압통점", "상태이상 효과에 걸린 적에 대한 무기 대미지 20% 증폭", amp("완벽한 압통점", 20)],
  ["lud", "루드", "Lud", "mk16", "T", "완벽한 능률화", "재사용 대기시간 중인 스킬이 없을 때 무기 대미지 +47%", stat("wd", 47)],
  ["huntsman", "헌츠맨", "Huntsman", "famas", "T", "완벽한 광란", "빈 탄창 재장전 시 탄창 휴대량 8발당 9초 동안 발사 속도·무기 대미지 +3%", none],
  ["caretaker", "관리자", "Caretaker", "g36", "T", "완벽한 킬러", "치명타로 처치 시 10초 동안 치명타 대미지 +90%", stat("chd", 90)],
  ["first-bloom", "첫 개화", "First Bloom", "pdr", "T", "흐드러진 수확", "적의 남은 방어도·생명력 10%당 무기 대미지 3.3% 증폭 (평균 50% 가정)", amp("흐드러진 수확", 16.5)],
  ["the-archivist", "기록소 관리자", "The Archivist", "acr", "T", "완벽한 레인저", "대상과의 거리 3m마다 무기 대미지 2% 증폭 (25m 가정)", amp("완벽한 레인저", 16)],
  ["steamer", "스티머", "Steamer", "mk16", "T", "완벽한 끓는점", "탄창의 처음 48%는 치명타 확률 -100%, 나머지는 치명타 확률 100%", none],
  // 기관단총
  ["emelines-guard", "에멜린의 수호자", "Emeline's Guard", "p90", "T", "완벽한 보존", "처치 시 5초에 걸쳐 방어도 15% 회복 (헤드샷 처치 시 추가 15%)", none],
  ["safety-distance", "안전 거리", "Safety Distance", "mpx", "T", "완벽한 외부인", "처치 후 10초 동안 적정 사거리 +150%, 명중률 +125%", none],
  ["swap-chain", "스왑 체인", "Swap Chain", "mp7", "T", "완벽한 흔들림 방지", "이 무기로 교체 시 5초 동안 무기 조작력 +400%", none],
  ["the-apartment", "아파트", "The Apartment", "mpx", "T", "완벽한 신중함", "탄창 앞 절반은 발사 속도 +25%·무기 대미지 -30%, 뒤 절반은 발사 속도 -18%·종합 무기 대미지 +38%", none],
  ["sleigher", "슬레이어", "Sleigher", "tommy", "T", "암초", "헤드샷 적중 시 혼란 부여", none],
  ["cold-relations", "냉랭한 관계", "Cold Relations", "pp19", "T", "완벽한 중압감", "사격 시 0.5초마다 치명타 대미지 +10%, 최대 8중첩", stat("chd", 80)],
  ["the-grudge", "원한", "The Grudge", "banshee", "T", "완벽한 앙심", "상태이상 적 처치 시 20초 동안 아군 치명타 확률·치명타 대미지 +21%", stats(["chc", 21], ["chd", 21])],
  ["dark-winter", "칠흑의 겨울", "Dark Winter", "vector-45", "T", "완벽한 킬러", "치명타로 처치 시 10초 동안 치명타 대미지 +90%", stat("chd", 90)],
  ["cabaret", "카바레", "Cabaret", "mp5", "T", "완벽한 천둥벼락", "충격 상태인 적에 대한 무기 대미지 +35%", stat("wd", 35)],
  ["grown-great", "위대한 결실", "Grown Great", "tommy", "T", "완벽한 안정화", "사격할 때마다 명중률·안정성 +1%, 최대 75%", none],
  ["purist", "순수주의자", "Purist", "smg9", "T", "완벽한 능률화", "재사용 대기시간 중인 스킬이 없을 때 무기 대미지 +47%", stat("wd", 47)],
  ["slingshot", "슬링샷", "Slingshot", "ump45", "F", null, "적정 사거리 60m", none],
  ["froth", "거품", "Froth", "vector-tac", "T", "완벽한 포박", "속박 함정 상태인 적에게 무기 대미지 25% 증폭", amp("완벽한 포박", 25)],
  ["interchange", "인터체인지", "Interchange", "aug", "T", "완벽한 왕복", "이 무기로 교체 시 10초 동안 발사 속도 +13%, 무기 대미지 +12%", stats(["rof", 13], ["wd", 12])],
  ["old-glory", "빛바랜 영광", "Old Glory", "t821", "T", "완벽한 근접전의 대가", "7m 내 대상 처치 시 10초 동안 무기 대미지 +38%", stat("wd", 38)],
  // 경기관총
  ["black-friday", "블랙 프라이데이", "Black Friday", "m249", "T", "완벽한 불안정", "안정성·명중률 -25%, 무기 대미지 +22%", stat("wd", 22)],
  ["sleipnir", "슬레이프니르", "Sleipnir", "mg5", "T", "완벽한 광란", "빈 탄창 재장전 시 탄창 휴대량 8발당 9초 동안 발사 속도·무기 대미지 +3%", none],
  ["tabula-rasa", "타뷸라 라사", "Tabula Rasa", "l86", "T", "완벽한 떨리지 않는 손", "적중 시 명중률·안정성 +1%, 75중첩 시 탄창 보충", none],
  ["quiet-roar", "소리 없는 아우성", "Quiet Roar", "stoner", "T", "완벽한 압도적인 화력", "적을 제압하면 12초 동안 무기 대미지 +12%, 최대 4중첩", stat("wd", 48)],
  ["new-reliable", "새로운 기준", "New Reliable", "rpk", "T", "완벽한 최적화", "무기 조작력 +40%", stat("wh", 40)],
  ["good-times", "좋았던 시절", "Good Times", "m60", "T", "완벽한 빠른 손", "치명타 적중 시 재장전 속도 +5%, 최대 40중첩", none],
  ["carnage", "학살극", "Carnage", "negev", "T", "완벽한 새디스트", "출혈 상태인 적에 대한 무기 대미지 +35%", stat("wd", 35)],
  ["dare", "담력", "Dare", "gr9", "T", "완벽한 심정지", "펄스에 탐지된 적에 대한 무기 대미지 +20%", stat("wd", 20)],
  ["the-stinger", "스팅어", "The Stinger", "m249", "T", "전광석화", "엄폐물 간 이동 시 15초 동안 무기 대미지 +20%", stat("wd", 20)],
  ["big-show", "빅 쇼", "Big Show", "mg5", "T", "완벽한 천둥벼락", "충격 상태인 적에 대한 무기 대미지 +35%", stat("wd", 35)],
  ["cricket", "크리켓", "Cricket", "gr9", "T", "완벽한 정밀 타격", "20m 밖 처치로 쌓은 중첩으로 20m 내 적에게 5초 동안 증폭 대미지 +35%", amp("완벽한 정밀 타격", 35)],
  ["rusty", "러스티", "Rusty", "rpk", "T", "완벽한 압통점", "상태이상 효과에 걸린 적에 대한 무기 대미지 20% 증폭", amp("완벽한 압통점", 20)],
  ["bell-ringer", "벨 링어", "Bell Ringer", "mg5-inf", "F", null, "사격 시 종소리가 울림", none],
  ["gear-shift", "보호장구 전환", "Gear Shift", "m249", "T", "완벽한 신중함", "탄창 앞 절반은 발사 속도 +25%·무기 대미지 -30%, 뒤 절반은 발사 속도 -18%·종합 무기 대미지 +38%", none],
  ["headline-grabber", "화제의 주인공", "The Headline-Grabber", "m60", "T", "완벽한 중압감", "사격 시 0.5초마다 치명타 대미지 +10%, 최대 8중첩", stat("chd", 80)],
  ["insult-to-injury", "엎친 데 덮친 꼴", "Insult to Injury", "l86", "T", "완벽한 헤드 스크래처", "혼란 상태인 적에 대한 무기 대미지 35% 증폭", amp("완벽한 헤드 스크래처", 35)],
  // 산탄총
  ["cuelebre", "쿠엘레브레", "Cuélebre", "m870", "T", "완벽한 재즈 핸드", "재장전 속도 +50%", stat("reload", 50)],
  ["rock-n-roll", "로큰롤", "Rock'n Roll", "acs12", "T", "완벽한 여유분", "탄창 휴대량 +50%", none],
  ["the-send-off", "고별사", "The Send-Off", "ksg", "T", "완벽한 사거리", "적정 사거리 +100%", none],
  ["tsunami", "쓰나미", "Tsunami", "sasg", "T", "완벽한 연속 타격", "연속 2회 처치 시 탄창 보충, 10초 동안 무기 대미지 +40%", stat("wd", 40)],
  ["enforcer", "집행자", "Enforcer", "super90", "T", "완벽한 연속 타격", "연속 2회 처치 시 탄창 보충, 10초 동안 무기 대미지 +40%", stat("wd", 40)],
  ["boomstick", "붐스틱", "Boomstick", "db", "T", "완벽한 의기충천", "재장전 시 10초 동안 무기 대미지 +6%, 최대 5중첩", stat("wd", 30)],
  ["the-mop", "밀대", "The Mop", "six12", "A", null, "+10% 적 처치 시 방어도 회복", stat("armorOnKill", 10)],
  ["lefty", "왼손잡이", "Lefty", "acs12", "T", "완벽한 슬레지해머", "수류탄으로 대미지를 주면 대상에게 징표", none],
  ["thorn", "가시나무", "Thorn", "spas12", "T", "완벽한 놋쇠", "산탄 4발 이상 적중 시 적중 산탄당 다음 사격 대미지 3.5% 증폭", none],
  ["like-glue", "강력한 결합", "Like Glue", "super90", "T", "완벽한 놋쇠", "산탄 4발 이상 적중 시 적중 산탄당 다음 사격 대미지 3.5% 증폭", none],
  ["stack-broker", "중첩 브로커", "Stack Broker", "acs12", "F", null, "-17% 기본 대미지, +20% 기본 발사 속도", none, { damage: Math.round(180800 * 0.83), rpm: 360 }],
  ["lockdown", "봉쇄", "Lockdown", "m870", "T", "완벽한 포박", "속박 함정 상태인 적에게 무기 대미지 25% 증폭", amp("완벽한 포박", 25)],
  ["backup-boomstick", "보조 붐스틱", "Backup Boomstick", "sawed-off", "A", null, "+17% 산탄총 대미지", stat("shotgunDmg", 17)],
  ["firestarter", "불씨", "Firestarter", "sawed-off", "T", "뇌관 탄환", "대미지를 주면 5초 동안 화상 저항 50% 감소", none],
  // 지정사수소총
  ["commando", "코만도", "Commando", "svd", "T", "완벽한 벌거숭이", "방어도가 소진된 적 적중 시 8초 동안 헤드샷 대미지 +50%", stat("hsd", 50)],
  ["designated-hitter", "지정 타자", "Designated Hitter", "sr1", "T", "완벽한 혁신", "헤드샷 적중 시 15초 동안 스킬 회복 +80%", none],
  ["ekims-long-stick", "에킴의 장대", "Ekim's Long Stick", "model700", "T", "완벽한 레인저", "대상과의 거리 3m마다 무기 대미지 2% 증폭 (40m 가정)", amp("완벽한 레인저", 26)],
  ["pinprick", "미세침", "Pinprick", "srs", "T", "완벽한 선제공격", "비전투·빈 탄창 재장전 후 처음 2발은 어디에 맞든 헤드샷 대미지", none],
  ["the-darkness", "어둠", "The Darkness", "mk20", "T", "완벽한 맹인", "시력 상실 상태인 적에 대한 무기 대미지 +35%", stat("wd", 35)],
  ["the-white-death", "하얀 사신", "The White Death", "m44-classic", "A", null, "+137% 헤드샷 대미지", stat("hsd", 137)],
  ["scalpel", "수술칼", "Scalpel", "tac308", "T", "완벽한 미래", "무기로 처치 시 19초 동안 스킬 등급 +1, 최대 4중첩", none],
  ["relic", "유물", "Relic", "g28", "T", "완벽한 단호함", "헤드샷 처치 후 다음 사격이 반드시 치명타 헤드샷으로 적중", none],
  ["oh-carol", "오, 캐롤", "Oh, Carol", "m44-classic", "A", null, "+137% 헤드샷 대미지", stat("hsd", 137)],
  ["brutus", "브루투스", "Brutus", "tac308", "T", "완벽한 따가운 뒤통수", "자신을 조준 중이지 않은 적에 대한 무기 대미지 25% 증폭", amp("완벽한 따가운 뒤통수", 25)],
  ["handbasket", "손바구니", "Handbasket", "svd", "F", null, "+147% 기본 대미지, -77% 기본 발사 속도", none, { damage: 387000, rpm: 60, reload: 2.86 }],
  ["instigator", "주모자", "Instigator", "m44", "T", "완벽한 약점", "약점 파괴 시 15초 동안 무기 대미지 +32%", stat("wd", 32)],
  ["incendia", "인센디아", "Incendia", "srs", "T", "완벽한 뜻밖의 행운", "탄창 휴대량 +30%, 엄폐 중 빗나간 탄환 반환", none],
  // 소총
  ["artists-tool", "예술가의 도구", "Artist's Tool", "sig716-cqb", "T", "완벽한 소총수", "헤드샷마다 5초 동안 무기 대미지 +11%, 최대 6중첩", stat("wd", 66)],
  ["the-virginian", "버지니아인", "The Virginian", "r1886", "T", "완벽한 부메랑", "치명타 적중 시 75% 확률로 탄환 반환, 반환 시 다음 사격 대미지 +50%", none],
  ["everlasting-gaze", "영원한 시선", "Everlasting Gaze", "mk17", "T", "완벽한 영속성", "헤드샷 적중 시 다음 상태이상 대미지·지속 시간 +75%", none],
  ["bakers-dozen", "덧거리", "Baker's Dozen", "m1a-classic", "T", "완벽한 뜻밖의 행운", "탄창 휴대량 +30%, 엄폐 중 빗나간 탄환 반환", none],
  ["surge", "쇄도", "Surge", "lvoa", "T", "완벽한 가시", "헤드샷 적중 시 15초 동안 스킬 대미지 +25%", stat("skillDmg", 25)],
  ["harmony", "화합", "Harmony", "mk47", "T", "완벽한 동기화", "적중 시 스킬 대미지 +20%, 스킬 사용 시 무기 대미지 +20% (둘 다면 두 배)", stat("wd", 20)],
  ["stage-left", "질서정연", "Stage Left", "m1a", "T", "완벽한 슬레지해머", "수류탄으로 대미지를 주면 대상에게 징표", none],
  ["whisper", "귓속말", "Whisper", "m16a2", "T", "완벽한 따가운 뒤통수", "자신을 조준 중이지 않은 적에 대한 무기 대미지 25% 증폭", amp("완벽한 따가운 뒤통수", 25)],
  ["achilles", "아킬레스", "Achilles", "usc", "T", "완벽한 약점", "약점 파괴 시 15초 동안 무기 대미지 +32%", stat("wd", 32)],
  ["trader", "트레이더", "Trader", "acr-ss", "T", "완벽한 왕복", "이 무기로 교체 시 10초 동안 발사 속도 +13%, 무기 대미지 +12%", stats(["rof", 13], ["wd", 12])],
  ["brain-break", "뇌 파괴", "Brain Break", "mdr", "T", "완벽한 헤드 스크래처", "혼란 상태인 적에 대한 무기 대미지 35% 증폭", amp("완벽한 헤드 스크래처", 35)],
  ["the-claw", "발톱", "The Claw", "uic15", "T", "완벽한 정밀 타격", "20m 밖 처치로 쌓은 중첩으로 20m 내 적에게 5초 동안 증폭 대미지 +35%", amp("완벽한 정밀 타격", 35)],
  ["teapot", "티팟", "Teapot", "lw-m4", "T", "완벽한 끓는점", "탄창의 처음 48%는 치명타 확률 -100%, 나머지는 치명타 확률 100%", none],
  ["lichtenberg", "리히텐베르크", "Lichtenberg", "m1a-classic", "T", "런앤건", "이동 중 중첩 생성, 헤드샷 시 이동 속도 +20%", none],
  // 권총
  ["diceros-special", "Diceros Special", "Diceros Special", "diceros", "T", "완벽한 낙천주의자", "탄창 탄약이 10% 소모될 때마다 무기 대미지 +4.5% (평균 +22.5% 가정)", stat("wd", 22.5), { damage: 198300 }],
  ["sharpshooter-93r", "명사수용 93R", "Sharpshooter 93R", "93r", "T", "완벽한 흔들림 방지", "이 무기로 교체 시 5초 동안 무기 조작력 +400%", none],
  ["survivalist-d50", "생존 전문가 D50", "Survivalist D50", "d50", "T", "완벽한 새디스트", "출혈 상태인 적에 대한 무기 대미지 +35%", stat("wd", 35)],
  ["orbit", "궤도", "Orbit", "magnum586", "T", "완벽한 확인사살", "처치 후 10초 내 무기 교체 시 15초 동안 치명타 확률 +35%, 치명타 대미지 +40%", stats(["chc", 35], ["chd", 40])],
  ["lightning-rod", "피뢰침", "Lightning Rod", "pf45-custom", "T", "완벽한 회수", "대상 처치 시 85% 확률로 탄약 보충", none],
  ["mozambique-special", "모잠비크 스페셜", "Mozambique Special", "m45a1", "T", "완벽한 브레드바스켓", "바디샷 적중 시 다음 헤드샷의 헤드샷 대미지 +70%, 최대 2중첩", none],
  ["tdi-kard", "맞춤형 TDI \"Kard\"", "TDI \"Kard\" Custom", "kard45", "A", null, "+1 스킬 등급", stat("skillTier", 1)],
  ["prophet", "선지자", "Prophet", "magnum586", "T", "완벽한 단호함", "헤드샷 처치 후 다음 사격이 반드시 치명타 헤드샷으로 적중", none],
  ["harvest", "수확", "Harvest", "magnum586", "F", null, "+10% 기본 대미지, -7.4% 기본 발사 속도", none, { damage: Math.round(233300 * 1.1), rpm: Math.round(160 * 0.926) }],
  ["quickstep", "퀵스텝", "Quickstep", "m45a1", "T", "스피드 모드", "이동 속도 +20%", none],
  ["rabid-d50", "래비드 D50", "Rabid D50", "d50", "T", "게거품", "헤드샷 처치 후 다음 적중 대상에게 속박 함정 적용", none],
]);

// ── 특급 무기 ─────────────────────────────────────────────

type ExoticRow = [
  id: string,
  name: string,
  en: string,
  cls: WeaponClassId,
  base: string | null,
  stats: [damage: number, rpm: number, mag: number, reload: number],
  attachDesc: string,
  attach: Bonus,
  talentName: string,
  talentDesc: string,
  talent: Bonus,
  coreOverride?: StatEffect,
];

function exotics(list: ExoticRow[]): WeaponItem[] {
  return list.map(([id, name, en, cls, base, [damage, rpm, mag, reload], attachDesc, attach, talentName, talentDesc, talent, coreOverride]) => ({
    id,
    name,
    en,
    kind: "exotic",
    cls,
    damage,
    rpm,
    mag,
    reload,
    base: base ?? undefined,
    fixed: { desc: `부착물: ${attachDesc}`, bonus: attach },
    fixedTalent: { name: talentName, desc: talentDesc, bonus: talent },
    coreOverride,
  }));
}

// 기본 수치가 문서에 없는 특급 무기는 기반 무기 수치에 탄약 부착물을 더했다
const EXOTIC_WEAPONS: WeaponItem[] = exotics([
  // 돌격소총
  ["eagle-bearer", "독수리를 거느린 자", "Eagle Bearer", "ar", null, [47400, 850, 60, 2.3], "치명타 확률 +15%, 탄약 +30, 무기 조작력 +10%, 치명타 대미지 +20%", stats(["chc", 15], ["wh", 10], ["chd", 20]), "독수리의 공격", "사격할수록 명중률 증가, 헤드샷 처치 시 받은 대미지를 보류하는 집념 버프", none],
  ["chameleon", "카멜레온", "Chameleon", "ar", null, [44700, 900, 50, 2.4], "치명타 확률 +15%, 탄약 +20, 명중률 +20%, 안정성 +10%", stat("chc", 15), "적응 본능", "바디샷 65회 적중 시 45초 동안 무기 대미지 +90% (바디샷 버프 가정)", stat("wd", 90)],
  ["bighorn", "빅혼", "The Bighorn", "ar", null, [57200, 800, 42, 2.2], "헤드샷 대미지 +30%, 재장전 속도 +10%, 명중률 +10%, 안정성 +20%", stats(["hsd", 30], ["reload", 10]), "거물 사냥꾼", "조준경 조준 시 반자동으로 전환되어 각 탄환이 450% 무기 대미지, 헤드샷마다 헤드샷 대미지 +6%", none],
  ["capacitor", "축전기", "Capacitor", "ar", null, [57600, 700, 41, 2.3], "치명타 확률 +10%, 탄약 +11, 무기 조작력 +10%, 치명타 대미지 +30%", stats(["chc", 10], ["wh", 10], ["chd", 30]), "축전", "적중마다 스킬 대미지 +1.5% (최대 40중첩), 스킬 등급 하나당 무기 대미지 +7.5%", none, { stat: "dta", value: 12 }],
  ["st-elmos-engine", "성 엘모의 엔진", "St. Elmo's Engine", "ar", null, [46900, 850, 70, 2.25], "치명타 대미지 +15%, 탄약 +30, 무기 조작력 +10%, 치명타 확률 +15%", stats(["chd", 15], ["wh", 10], ["chc", 15]), "악툼 에스트", "100회 적중 시 다음 탄창이 충격탄으로 보충", none],
  ["strega", "스트레가", "Strega", "ar", null, [57600, 700, 40, 1.9], "치명타 대미지 +5%, 탄약 +20, 무기 조작력 +10%, 치명타 확률 +5%", stats(["chd", 5], ["wh", 10], ["chc", 5]), "불안", "처치 시 20m 내 적에게 징표, 징표 하나당 증폭 대미지 +15% (최대 5개 가정)", amp("불안", 75)],
  ["agitator", "선동가", "Agitator", "ar", "F2000", [49100, 850, 50, 2.4], "치명타 확률 +10%, 탄약 +20, 교체 속도 +50%", stat("chc", 10), "동요", "10초 수납 후 이 무기로 교체하면 20초 동안 발사 속도 +25%, 무기 대미지 +30%", stats(["rof", 25], ["wd", 30])],
  ["caduceus", "카두세우스", "Caduceus", "ar", "Mk16", [59200, 650, 70, 2.02], "치명타 확률 +15%, 탄약 +40, 치명타 대미지 +5%", stats(["chc", 15], ["chd", 5]), "카두세우스", "치명타 적중 시 입힌 대미지의 3%만큼 자신·아군 회복", none],
  // 기관단총
  ["chatterbox", "촉새", "The Chatterbox", "smg", null, [39500, 850, 60, 1.9], "치명타 확률 +15%, 탄약 +10, 무기 조작력 +10%, 치명타 대미지 +15%", stats(["chc", 15], ["wh", 10], ["chd", 15]), "끝없는 수다", "재장전 시 15m 내 적 한 명당 발사 속도 +25% (적 2명 가정), 처치 시 탄창 50% 보충", stat("rof", 50)],
  ["lady-death", "죽음의 귀부인", "Lady Death", "smg", null, [34800, 900, 32, 2], "치명타 확률 +15%, 재장전 속도 +10%, 치명타 대미지 +10%, 근접 대미지 +500%", stats(["chc", 15], ["reload", 10], ["chd", 10]), "안도의 호흡", "이동으로 쌓은 중첩을 탄환마다 소모해 대미지 75% 증폭 (중첩 유지 가정)", amp("안도의 호흡", 75)],
  ["backfire", "역화", "Backfire", "smg", "SIG MPX", [51000, 850, 50, 2.09], "치명타 확률 +15%, 탄약 +20, 안정성 +10%, 치명타 대미지 +15%", stats(["chc", 15], ["chd", 15]), "등가교환", "대미지를 주면 치명타 대미지 +2%, 최대 100중첩 (재장전 시 자신에게 출혈)", stat("chd", 200)],
  ["ouroboros", "우로보로스", "Ouroboros", "smg", "Vector SBR 9mm", [39300, 1200, 50, 2.38], "치명타 대미지 +10%, 재장전 속도 +25%, 치명타 확률 +10%, 발사 속도 +10%", stats(["chd", 10], ["reload", 25], ["chc", 10], ["rof", 10]), "만인지상", "자신이 상태이상에 걸리면 다음 탄창 절반이 같은 상태이상을 부여", none],
  ["oxpecker", "옥스페커", "Oxpecker", "smg", "MP7", [46400, 950, 50, 1.45], "적정 사거리 +50%, 치명타 확률 +15%, 탄약 +10", stat("chc", 15), "공생", "방패 사용 중 이 무기로 입힌 대미지의 25%만큼 방패 회복", none],
  ["underboss", "부두목", "Underboss", "smg", "Tommy Gun", [50600, 900, 50, 1.4], "치명타 확률 +20%", stat("chc", 20), "갱단 히트", "표식이 부여된 적에게 증폭 대미지 +20%", amp("갱단 히트", 20)],
  // 경기관총
  ["pestilence", "역병", "Pestilence", "lmg", null, [48300, 850, 100, 5.1], "발사 속도 +10%, 안정성 +10%, 명중률 +10%", stat("rof", 10), "아웃캐스트의 역병", "적중 시 10초에 걸쳐 100% 무기 대미지를 주는 디버프, 최대 50중첩 (단일 표적 DPS 미반영)", none],
  ["bullet-king", "탄환 제왕", "Bullet King", "lmg", null, [54600, 750, 1000, 0], "치명타 확률 +15%, 안정성 +20%", stat("chc", 15), "탄환 지옥", "재장전이 필요 없음, 100회 적중마다 탄약 보충", none],
  ["bluescreen", "블루스크린", "Bluescreen", "lmg", "Stoner LAMG", [62400, 580, 200, 2.73], "재장전 속도 +20%, 무기 조작력 +15%, 안정성 +10%, 발사 속도 +20%", stats(["reload", 20], ["wh", 15], ["rof", 20]), "교란탄", "징표 중첩을 쌓아 스킬 사용 시 펄스·방해·방향감각 상실 부여", none],
  ["iron-lung", "강철의 허파", "Iron Lung", "lmg", "MG5", [54300, 800, 85, 2.69], "치명타 확률 +10%, 탄약 +35, 치명타 대미지 +20%", stats(["chc", 10], ["chd", 20]), "열렬한 헌신", "열기 미터가 차면 탄환이 적을 불태움", none],
  ["pakhan", "파칸", "Pakhan", "lmg", "RPK-74", [71500, 600, 60, 4], "무기 대미지 +15%, 탄약 +20, 재장전 속도 +10%, 치명타 확률 +15%", stats(["wd", 15], ["reload", 10], ["chc", 15]), "파칸", "처치마다 다음 탄창 용량 +75%, 최대 4중첩", none],
  ["vertigo", "버티고", "Vertigo", "lmg", "GR9", [49500, 750, 250, 3.3], "치명타 확률 +15%, 탄약 +50, 재장전 속도 +15%, 발사 속도 +10%", stats(["chc", 15], ["reload", 15], ["rof", 10]), "대경실색", "제압한 적에게 혼란, 아군 15초 동안 비엄폐 대상 대미지 +30%", stat("dtooc", 30)],
  // 산탄총
  ["sweet-dreams", "달콤한 꿈", "Sweet Dreams", "shotgun", null, [715800, 70, 8, 5.5], "명중률 +15%, 재장전 속도 +15%, 적정 사거리 +25%", stat("reload", 15), "잠귀신", "근접 공격 시 정예가 아닌 적 즉시 처치 (재사용 15초)", none],
  ["scorpio", "스콜피오", "Scorpio", "shotgun", "SIX12", [409600, 130, 7, 3], "치명타 확률 +10%, 재장전 속도 +10%, 무기 조작력 +10%, 안정성 +10%", stats(["chc", 10], ["reload", 10], ["wh", 10]), "패혈증성 쇼크", "맹독 중첩으로 중독·방향감각 상실·충격, 9중첩 시 대상이 받는 모든 대미지 +20%", amp("패혈증성 쇼크", 20)],
  ["overlord", "오버로드", "Overlord", "shotgun", "KSG", [678900, 70, 12, 7.26], "치명타 대미지 +15%, 재장전 속도 +15%, 안정성 +20%", stats(["chd", 15], ["reload", 15]), "굴복", "적중한 산탄 한 발당 이동 속도 -4%", none],
  ["sheriff", "보안관", "Sheriff", "shotgun", "Super 90", [389900, 160, 8, 4.23], "없음", none, "오텐티코", "무기 대미지 +35%, 명중률 +100%, 거리에 따른 대미지 감소 없음 (기본 능력치 포함)", stat("wd", 35)],
  ["fafnir", "파프니르", "Fafnir", "shotgun", "M870", [703700, 75, 10, 3.04], "치명타 확률 +15%, 탄약 +5, 무기 조작력 +10%", stats(["chc", 15], ["wh", 10]), "드래곤 브레스", "사격마다 40% 확률로 화상, 무기 대미지가 상태이상 효과 보너스의 50%만큼 증폭", none],
  // 지정사수소총
  ["nemesis", "네메시스", "Nemesis", "mmr", null, [940200, 50, 5, 3.2], "헤드샷 대미지 +45%, 재장전 속도 +20%, 무기 조작력 +10%", stats(["hsd", 45], ["reload", 20], ["wh", 10]), "전자기 가속기", "방아쇠를 당긴 시간에 비례해 무기 대미지 0~100% (완충 가정)", none],
  ["mantis", "사마귀", "Mantis", "mmr", null, [409200, 60, 7, 4.3], "헤드샷 대미지 +45%, 재장전 속도 +20%, 무기 조작력 +10%", stats(["hsd", 45], ["reload", 20], ["wh", 10]), "등잔 밑", "자신을 겨냥하지 않은 적에 대한 헤드샷·약점 대미지 +65%", stat("hsd", 65)],
  ["dread-edict", "공포의 칙령", "Dread Edict", "mmr", "SVD", [156700, 260, 15, 2.59], "헤드샷 대미지 +45%, 탄약 +5, 무기 조작력 +15%, 치명타 확률 +15%", stats(["hsd", 45], ["wh", 15], ["chc", 15]), "마침표", "적중마다 중첩(최대 20), 중첩당 무기 대미지 +2%, 헤드샷 대미지 +5%", stats(["wd", 40], ["hsd", 100])],
  ["sacrum-imperium", "신성 제국", "Sacrum Imperium", "mmr", "G28", [206400, 180, 20, 3.6], "헤드샷 대미지 +30%, 안정성 +20%, 적정 사거리 +20%", stat("hsd", 30), "덫", "징표 대상 헤드샷 처치 시 다른 대상 이동 속도 감소·화상", none],
  ["shroud", "슈라우드", "Shroud", "mmr", "M700 Carbon", [412500, 55, 7, 3.62], "헤드샷 대미지 +45%, 재장전 속도 +20%, 치명타 대미지 +5%", stats(["hsd", 45], ["reload", 20], ["chd", 5]), "최우선 표적", "가장 높은 등급의 적에 대한 무기 대미지 125% 증폭", amp("최우선 표적", 125)],
  ["prima-donna", "프리마돈나", "Prima Donna", "mmr", "SOCOM Mk20 SSR", [145900, 275, 20, 4.99], "헤드샷 대미지 +45%, 무기 조작력 +15%", stats(["hsd", 45], ["wh", 15]), "보는 건 돼...", "비전투 시 10중첩, 중첩당 무기 대미지 11% 증폭 (최대 중첩 가정)", amp("보는 건 돼...", 110)],
  // 소총
  ["merciless", "무자비", "Merciless", "rifle", null, [102100, 400, 40, 2.6], "치명타 확률 +15%, 재장전 속도 +10%, 무기 조작력 +10%, 안정성 +10%", stats(["chc", 15], ["reload", 10], ["wh", 10]), "이중 방아쇠", "당길 때·놓을 때 발사, 7중첩 시 500% 증폭 대미지와 폭발", none],
  ["diamondback", "다이아몬드백", "Diamondback", "rifle", null, [386900, 100, 8, 3.5], "치명타 대미지 +30%, 재장전 속도 +10%, 안정성 +10%", stats(["chd", 30], ["reload", 10]), "고통의 상흔", "징표 대상 적중 시 20% 증폭 치명타, 이후 5초 동안 모든 사격이 치명타", none],
  ["the-ravenous", "탐식자", "The Ravenous", "rifle", null, [134300, 240, 60, 2.4], "치명타 확률 +15%, 재장전 속도 +10%, 안정성 +10%, 치명타 대미지 +5%", stats(["chc", 15], ["reload", 10], ["chd", 5]), "게리와 프레키", "견착 방향에 따라 공격·방어 뇌관 부여, 반대쪽 적중 시 폭파", none],
  ["doctor-home", "주치의", "Doctor Home", "rifle", "M1A", [129200, 320, 10, 2.11], "명중률 +10%, 재장전 속도 +10%, 치명타 확률 +10%, 무기 조작력 +10%", stats(["reload", 10], ["chc", 10], ["wh", 10]), "주치의", "징표 대상 사망 시 파티 방어도 회복 키트", none],
  ["vindicator", "빈디케이터", "Vindicator", "rifle", "도심 MDR", [103000, 380, 40, 2.85], "치명타 확률 +15%, 탄약 +20, 안정성 +15%, 적정 사거리 +10%", stat("chc", 15), "오티즈 강습 인터페이스", "강조 표시된 신체 부위에 대한 무기 대미지 60% 증폭", amp("오티즈 강습 인터페이스", 60)],
  ["bittersweet", "달콤 쌉싸름", "Bittersweet", "rifle", "클래식 M1A", [231300, 180, 20, 2.36], "치명타 확률 +15%, 탄약 +10, 헤드샷 대미지 +10%", stats(["chc", 15], ["hsd", 10]), "수혈", "헤드샷 중첩으로 아군·스킬 수리", none],
  ["steel-and-sons", "스틸 앤 선즈 ACR", "Steel & Sons ACR", "rifle", "ACR SS", [92400, 420, 40, 2.63], "치명타 확률 +15%, 탄약 +10, 무기 조작력 +10%, 재장전 속도 +10%", stats(["chc", 15], ["wh", 10], ["reload", 10]), "확인과 실행", "바디샷 중첩당 4% 증폭 (최대 4중첩 가정)", amp("확인과 실행", 16)],
  // 권총
  ["liberty", "자유", "Liberty", "pistol", null, [189100, 220, 8, 2.6], "헤드샷 대미지 +5%, 무기 조작력 +15%, 발사 속도 +15%, 치명타 확률 +5%", stats(["hsd", 5], ["wh", 15], ["rof", 15], ["chc", 5]), "자유가 아니면 죽음을", "적중마다 무기 대미지 +2%, 최대 30중첩", stat("wd", 60)],
  ["regulus", "레굴루스", "Regulus", "pistol", null, [282000, 160, 6, 2.8], "재장전 속도 +10%, 치명타 대미지 +5%", stats(["reload", 10], ["chd", 5]), "국왕 시해", "헤드샷 처치 시 5m 폭발로 400% 무기 대미지와 출혈", none],
  ["busy-little-bee", "바쁜 꼬마 벌", "Busy Little Bee", "pistol", "커스텀 PF45", [94000, 370, 10, 1.61], "적정 사거리 +25%, 재장전 속도 +10%, 치명타 확률 +5%, 안정성 +10%", stats(["reload", 10], ["chc", 5]), "바쁜 꼬마 벌", "다른 적 사격마다 중첩, 무기 교체 시 10초 동안 중첩당 무기 대미지 +20% (다른 무기에 적용)", none],
  ["mosquito", "모스키토", "Mosquito", "pistol", "장교용 M9", [95700, 350, 15, 1.78], "재장전 속도 +15%, 명중률 +15%", stat("reload", 15), "모기의 노래", "5중첩 시 대상이 방어도에 받는 대미지 +25%", amp("모기의 노래", 25)],
  ["tempest", "템페스트", "Tempest", "pistol", "93R", [53000, 700, 20, 1.55], "안정성 +50%, 치명타 확률 +15%", stat("chc", 15), "제한 상태", "방패 파괴 후 25초 동안 무기 대미지 25% 증폭", amp("제한 상태", 25)],
  ["whiplash", "위플래쉬", "Whiplash", "pistol", "Diceros", [204800, 180, 6, 1.75], "치명타 대미지 +10%, 치명타 확률 +10%, 교체 속도 +50%", stats(["chd", 10], ["chc", 10]), "재장전보다 빠르게", "5초 수납 후 교체하면 탄창이 빌 때까지 발사 속도 +20%, 무기 대미지 +50%", stats(["rof", 20], ["wd", 50])],
]);

export const WEAPON_ITEMS: WeaponItem[] = [...NORMAL_WEAPONS, ...NAMED_WEAPONS, ...EXOTIC_WEAPONS];

export function findWeapon(id: string): WeaponItem | undefined {
  return WEAPON_ITEMS.find((w) => w.id === id);
}

/** 무기 비핵심 속성 (최대치) */
export const WEAPON_ATTRIBUTES: { id: string; effect: StatEffect }[] = [
  { id: "chc", effect: { stat: "chc", value: 9.5 } },
  { id: "chd", effect: { stat: "chd", value: 10 } },
  { id: "hsd", effect: { stat: "hsd", value: 10 } },
  { id: "dta", effect: { stat: "dta", value: 6 } },
  { id: "dth", effect: { stat: "dth", value: 9.5 } },
  { id: "dtooc", effect: { stat: "dtooc", value: 10 } },
  { id: "rof", effect: { stat: "rof", value: 5 } },
  { id: "reload", effect: { stat: "reload", value: 12 } },
];

/** 무기 모드 (조준경·총구·탄창 등에서 나오는 주요 보너스) */
export const WEAPON_MODS: { id: string; label: string; effect: StatEffect }[] = [
  { id: "chc", label: "치명타 확률 +5%", effect: { stat: "chc", value: 5 } },
  { id: "chd", label: "치명타 피해 +10%", effect: { stat: "chd", value: 10 } },
  { id: "hsd", label: "헤드샷 피해 +10%", effect: { stat: "hsd", value: 10 } },
  { id: "reload", label: "재장전 속도 +20%", effect: { stat: "reload", value: 20 } },
  { id: "rof", label: "연사력 +5%", effect: { stat: "rof", value: 5 } },
];

export interface WeaponTalent {
  id: string;
  name: string;
  desc: string;
  bonus: Bonus;
}

/**
 * 일반 무기 특수효과 (나무위키 "무기" 문서 특수효과 항목의 일반 수치).
 * 상태이상 대상 보너스는 대상이 해당 상태라고 가정한다.
 */
export const WEAPON_TALENTS: WeaponTalent[] = [
  { id: "killer", name: "킬러", desc: "치명타로 처치 시 10초 동안 치명타 대미지 +70%", bonus: stat("chd", 70) },
  { id: "optimist", name: "낙천주의자", desc: "탄창 탄약이 10% 소모될 때마다 무기 대미지 +3.5% (평균 +17.5% 가정)", bonus: stat("wd", 17.5) },
  { id: "strained", name: "중압감", desc: "사격 시 0.5초마다 치명타 대미지 +10%, 최대 5중첩", bonus: stat("chd", 50) },
  { id: "close-personal", name: "근접전의 대가", desc: "7m 내 대상 처치 시 10초 동안 무기 대미지 +30%", bonus: stat("wd", 30) },
  { id: "vindictive", name: "앙심", desc: "상태이상 적 처치 시 20초 동안 아군 치명타 확률·치명타 대미지 +16%", bonus: stats(["chc", 16], ["chd", 16]) },
  { id: "ranger", name: "레인저", desc: "대상과의 거리 4m마다 무기 대미지 2% 증폭 (25m 가정)", bonus: amp("레인저", 12) },
  { id: "in-sync", name: "동기화", desc: "적중 시 스킬 대미지 +15%, 스킬 사용 시 무기 대미지 +15% (둘 다면 두 배)", bonus: stat("wd", 15) },
  { id: "flatline", name: "심정지", desc: "펄스에 탐지된 적에 대한 무기 대미지 +15%", bonus: stat("wd", 15) },
  { id: "sadist", name: "새디스트", desc: "출혈 상태인 적에 대한 무기 대미지 +30%", bonus: stat("wd", 30) },
  { id: "ignited", name: "점화", desc: "화상 상태인 적에 대한 무기 대미지 +25%", bonus: stat("wd", 25) },
  { id: "thunder-strike", name: "천둥벼락", desc: "충격 상태인 적에 대한 무기 대미지 +30%", bonus: stat("wd", 30) },
  { id: "eyeless", name: "맹인", desc: "시력 상실 상태인 적에 대한 무기 대미지 +30%", bonus: stat("wd", 30) },
  { id: "pressure-point", name: "압통점", desc: "상태이상 효과에 걸린 적에 대한 무기 대미지 15% 증폭", bonus: amp("압통점", 15) },
  { id: "streamline", name: "능률화", desc: "재사용 대기시간 중인 스킬이 없을 때 무기 대미지 +42%", bonus: stat("wd", 42) },
  { id: "soft-spot", name: "약점", desc: "약점 파괴 시 10초 동안 무기 대미지 +27%", bonus: stat("wd", 27) },
  { id: "immobilize", name: "포박", desc: "속박 함정 상태인 적에게 무기 대미지 20% 증폭", bonus: amp("포박", 20) },
  { id: "breadbasket", name: "브레드바스켓", desc: "바디샷 적중 시 다음 헤드샷의 헤드샷 대미지 +55%, 최대 3중첩 (DPS 미반영)", bonus: none },
  { id: "fast-hands", name: "빠른 손", desc: "치명타 적중 시 재장전 속도 +3%, 최대 40중첩 (평균 +60% 가정)", bonus: stat("reload", 60) },
  { id: "spike", name: "가시", desc: "헤드샷 적중 시 15초 동안 스킬 대미지 +20%", bonus: stat("skillDmg", 20) },
  { id: "rifleman", name: "소총수", desc: "헤드샷마다 무기 대미지 증가, 최대 중첩 가정", bonus: stat("wd", 50) },
  { id: "preservation", name: "보존", desc: "처치 시 5초에 걸쳐 방어도 10% 회복", bonus: none },
  { id: "future-perfect", name: "완벽한 미래", desc: "무기로 처치 시 15초 동안 스킬 등급 +1, 최대 3중첩", bonus: none },
];
