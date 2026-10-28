/**
 * 디비전2 장비 시뮬레이터 무기 데이터. 기본 피해·RPM·탄창·재장전은 레벨 40 기준 근사치라
 * 화면에서 직접 고쳐 쓸 수 있게 했다. 무기 종류별 코어 속성은 게임 고정값이다.
 */
import type { Bonus, StatEffect, StatKey } from "./division-gear";

export type WeaponClassId = "ar" | "smg" | "lmg" | "rifle" | "mmr" | "shotgun" | "pistol";

export const WEAPON_CLASSES: Record<
  WeaponClassId,
  { label: string; typeDmgStat: StatKey; core: StatEffect | null; coreLabel: string }
> = {
  ar: { label: "돌격소총", typeDmgStat: "arDmg", core: { stat: "dth", value: 15 }, coreLabel: "체력 피해 +15%" },
  smg: { label: "기관단총", typeDmgStat: "smgDmg", core: { stat: "chc", value: 21 }, coreLabel: "치명타 확률 +21%" },
  lmg: { label: "경기관총", typeDmgStat: "lmgDmg", core: { stat: "dtooc", value: 12 }, coreLabel: "엄폐 밖 표적 피해 +12%" },
  rifle: { label: "소총", typeDmgStat: "rifleDmg", core: { stat: "chd", value: 17 }, coreLabel: "치명타 피해 +17%" },
  mmr: { label: "지정사수소총", typeDmgStat: "mmrDmg", core: { stat: "hsd", value: 111 }, coreLabel: "헤드샷 피해 +111%" },
  shotgun: { label: "산탄총", typeDmgStat: "shotgunDmg", core: { stat: "dta", value: 45 }, coreLabel: "방어도 피해 +45%" },
  pistol: { label: "권총", typeDmgStat: "pistolDmg", core: null, coreLabel: "코어 속성 없음" },
};

export interface Weapon {
  id: string;
  name: string;
  cls: WeaponClassId;
  /** 발당 기본 피해 (산탄총은 펠릿 합계) */
  damage: number;
  rpm: number;
  mag: number;
  /** 재장전 시간(초) */
  reload: number;
}

export const WEAPONS: Weapon[] = [
  { id: "p416", name: "P416", cls: "ar", damage: 42000, rpm: 750, mag: 30, reload: 2.2 },
  { id: "police-m4", name: "Police M4", cls: "ar", damage: 40000, rpm: 750, mag: 30, reload: 2.2 },
  { id: "famas", name: "FAMAS 2010", cls: "ar", damage: 33000, rpm: 900, mag: 25, reload: 2.3 },
  { id: "akm", name: "AK-M", cls: "ar", damage: 55000, rpm: 600, mag: 30, reload: 2.4 },
  { id: "acr", name: "ACR", cls: "ar", damage: 39000, rpm: 850, mag: 30, reload: 2.1 },
  { id: "vector", name: "Vector .45 ACP", cls: "smg", damage: 22000, rpm: 1100, mag: 25, reload: 1.9 },
  { id: "mpx", name: "MPX", cls: "smg", damage: 30000, rpm: 850, mag: 30, reload: 1.9 },
  { id: "mp5", name: "MP5A2", cls: "smg", damage: 29000, rpm: 800, mag: 30, reload: 2.0 },
  { id: "p90", name: "P90", cls: "smg", damage: 26000, rpm: 900, mag: 50, reload: 2.6 },
  { id: "aug", name: "AUG A3P", cls: "smg", damage: 31000, rpm: 725, mag: 31, reload: 2.1 },
  { id: "m60", name: "M60", cls: "lmg", damage: 55000, rpm: 550, mag: 100, reload: 4.5 },
  { id: "rpk", name: "RPK-74", cls: "lmg", damage: 41000, rpm: 600, mag: 60, reload: 3.3 },
  { id: "m249", name: "M249 Para", cls: "lmg", damage: 36000, rpm: 750, mag: 100, reload: 5.0 },
  { id: "mg5", name: "MG5", cls: "lmg", damage: 42000, rpm: 800, mag: 50, reload: 3.8 },
  { id: "m1a", name: "M1A", cls: "rifle", damage: 110000, rpm: 360, mag: 10, reload: 2.5 },
  { id: "mk17", name: "Mk17", cls: "rifle", damage: 74000, rpm: 400, mag: 20, reload: 2.4 },
  { id: "sig716", name: "SIG 716", cls: "rifle", damage: 90000, rpm: 400, mag: 20, reload: 2.4 },
  { id: "m700", name: "Model 700 Carbon", cls: "mmr", damage: 520000, rpm: 55, mag: 5, reload: 3.0 },
  { id: "srs", name: "SRS", cls: "mmr", damage: 600000, rpm: 50, mag: 7, reload: 3.4 },
  { id: "m44", name: "M44 Carbine", cls: "mmr", damage: 540000, rpm: 50, mag: 5, reload: 3.2 },
  { id: "m870", name: "M870 Express", cls: "shotgun", damage: 330000, rpm: 75, mag: 5, reload: 4.5 },
  { id: "sasg", name: "SASG-12", cls: "shotgun", damage: 200000, rpm: 200, mag: 7, reload: 3.0 },
  { id: "super90", name: "Super 90", cls: "shotgun", damage: 250000, rpm: 150, mag: 6, reload: 4.0 },
  { id: "d50", name: "D50", cls: "pistol", damage: 120000, rpm: 280, mag: 6, reload: 1.8 },
  { id: "m1911", name: "M1911", cls: "pistol", damage: 60000, rpm: 400, mag: 7, reload: 1.5 },
  { id: "93r", name: "93R", cls: "pistol", damage: 25000, rpm: 1100, mag: 20, reload: 1.8 },
];

/** 무기 두 번째 속성 (최대치) */
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

/** 무기 탤런트 (조건부 효과는 평균 또는 최대 가동을 가정) */
export const WEAPON_TALENTS: WeaponTalent[] = [
  { id: "optimist", name: "Optimist", desc: "탄창이 10% 빌 때마다 무기 피해 +3% (평균 +15% 가정)", bonus: { stats: [{ stat: "wd", value: 15 }] } },
  { id: "strained", name: "Strained", desc: "방어도가 깎일수록 치명타 피해 증가 (평균 +25% 가정)", bonus: { stats: [{ stat: "chd", value: 25 }] } },
  { id: "killer", name: "Killer", desc: "치명타 처치 시 치명타 피해 +40%", bonus: { stats: [{ stat: "chd", value: 40 }] } },
  { id: "rifleman", name: "Rifleman", desc: "연속 명중마다 무기 피해 +10%, 최대 50% (평균 +30% 가정)", bonus: { stats: [{ stat: "wd", value: 30 }] } },
  { id: "ranger", name: "Ranger", desc: "거리 5m마다 증폭 피해 +2% (25m 기준 +10%)", bonus: { amps: [{ label: "레인저", value: 10 }] } },
  { id: "in-sync", name: "In Sync", desc: "스킬·무기 교대 사용 시 증폭 피해 +15%", bonus: { amps: [{ label: "인 싱크", value: 15 }] } },
  { id: "vindictive", name: "Vindictive", desc: "상태 이상 적 처치 시 팀 치확·치피 증가 (+15%/+20%)", bonus: { stats: [{ stat: "chc", value: 15 }, { stat: "chd", value: 20 }] } },
  { id: "close-personal", name: "Close & Personal", desc: "7m 이내 처치 시 무기 피해 +30%", bonus: { stats: [{ stat: "wd", value: 30 }] } },
];
