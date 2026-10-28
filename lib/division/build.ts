import {
  BASE_CHD,
  BRANDS,
  CHC_CAP,
  CORE_ATTRIBUTES,
  GEAR_SETS,
  GEAR_SLOTS,
  GEAR_TALENTS,
  MINOR_ATTRIBUTES,
  SHD_BONUS,
  STAT_INFO,
  type AmpEffect,
  type Bonus,
  type CoreId,
  type GearSlotId,
  type StatEffect,
  type StatKey,
} from "@/data/division-gear";
import { EXOTIC_GEAR, findExoticGear, NINJABIKE_BACKPACK_ID } from "@/data/division-exotic-gear";
import { NAMED_ITEMS, type NamedItem } from "@/data/division-named";
import {
  findWeapon,
  WEAPON_ATTRIBUTES,
  WEAPON_CLASSES,
  WEAPON_ITEMS,
  WEAPON_MODS,
  WEAPON_TALENTS,
  WEAPON_TYPE_CORE,
  type WeaponClassId,
} from "@/data/division-weapons";

export interface GearPiece {
  /** 브랜드 / 기어세트 / 네임드 / 특급 장비 */
  source: "brand" | "set" | "named" | "exotic";
  /** BRANDS, GEAR_SETS, NAMED_ITEMS 또는 EXOTIC_GEAR의 id */
  id: string;
  core: CoreId;
  /** 부가 속성 id. 칸 수는 minorSlotCount()를 따른다 */
  minors: (string | null)[];
  /** 장비 모드 (마스크·조끼·배낭만) */
  mod: string | null;
  /** 브랜드 조끼·배낭 탤런트. 기어세트 조끼·배낭은 세트 탤런트가 자동으로 붙는다 */
  talent: string | null;
  /** 프로토타입 속성 key ("core", "minor-0", "minor-1", "mod"). 수치가 1.5배가 된다 */
  proto?: string[];
}

/** 프로토타입 속성은 일반 최대치의 1.5배 */
export const PROTO_MULTIPLIER = 1.5;

export function protoMultiplier(piece: GearPiece, key: string): number {
  return piece.proto?.includes(key) ? PROTO_MULTIPLIER : 1;
}

export interface WeaponBuild {
  weaponId: string;
  cls: WeaponClassId;
  damage: number;
  rpm: number;
  mag: number;
  reload: number;
  attr: string | null;
  talent: string | null;
  mods: (string | null)[];
}

export interface Conditions {
  /** 헤드샷 비율 0~100 */
  hsRate: number;
  target: "armor" | "health";
  outOfCover: boolean;
  /** 탤런트·4세트 같은 조건부 효과를 켤지 */
  conditional: boolean;
  shd: boolean;
}

export interface Build {
  gear: Record<GearSlotId, GearPiece | null>;
  weapon: WeaponBuild;
  conditions: Conditions;
}

export function findNamed(id: string): NamedItem | undefined {
  return NAMED_ITEMS.find((item) => item.id === id);
}

/** 네임드 장비가 속한 브랜드 (BRANDS에 없는 브랜드면 undefined) */
export function namedBrand(item: NamedItem) {
  return BRANDS.find((b) => b.name === item.brand);
}

/**
 * 부가 속성 칸 수. 브랜드 2칸, 기어세트 1칸.
 * 네임드는 고유 속성이 한 칸을 차지해 1칸이고, 조끼·배낭 네임드는 탤런트 자리가 고정이라 2칸이다.
 */
export function minorSlotCount(source: GearPiece["source"], id: string): number {
  if (source === "brand") return 2;
  if (source === "set") return 1;
  if (source === "exotic") return findExoticGear(id)?.attrs.length ?? 2;
  const item = findNamed(id);
  return item?.kind === "talent" && (item.slot === "chest" || item.slot === "backpack") ? 2 : 1;
}

export function emptyGearPiece(source: GearPiece["source"], id: string): GearPiece {
  return applyExoticFixed({ source, id, core: "red", minors: Array(minorSlotCount(source, id)).fill(null), mod: null, talent: null });
}

/**
 * 특급 보호장구는 고정 코어·속성을 장비에 그대로 채워 넣는다.
 * 고를 수 있는 칸("any")은 기존 값을 살리고, 계산하지 않는 속성("text:")은 비워 둔다.
 */
export function applyExoticFixed(piece: GearPiece): GearPiece {
  if (piece.source !== "exotic") return piece;
  const exotic = findExoticGear(piece.id);
  if (!exotic) return piece;
  return {
    ...piece,
    core: exotic.core === "any" ? piece.core : exotic.core,
    minors: exotic.attrs.map((attr, i) => (attr === "any" ? piece.minors[i] ?? null : attr.startsWith("text:") ? null : attr)),
    mod: exotic.mod ? piece.mod : null,
    talent: null,
  };
}

export function weaponBuildFrom(weaponId: string): WeaponBuild {
  const weapon = findWeapon(weaponId) ?? WEAPON_ITEMS[0];
  return {
    weaponId: weapon.id,
    cls: weapon.cls,
    damage: weapon.damage,
    rpm: weapon.rpm,
    mag: weapon.mag,
    reload: weapon.reload,
    attr: null,
    talent: null,
    mods: [null, null],
  };
}

export function createEmptyBuild(): Build {
  return {
    gear: { mask: null, chest: null, backpack: null, gloves: null, holster: null, kneepads: null },
    weapon: weaponBuildFrom("p416"),
    conditions: { hsRate: 20, target: "armor", outOfCover: true, conditional: true, shd: true },
  };
}

/**
 * 장비 한 칸을 바꾼다. 특급 보호장구는 한 번에 하나만 낄 수 있어,
 * 특급을 끼우면 다른 칸에 있던 특급 장비는 빠진다.
 */
export function equipGear(gear: Build["gear"], slotId: GearSlotId, piece: GearPiece | null): Build["gear"] {
  const next = { ...gear, [slotId]: piece };
  if (piece?.source === "exotic") {
    for (const slot of GEAR_SLOTS) {
      if (slot.id !== slotId && next[slot.id]?.source === "exotic") next[slot.id] = null;
    }
  }
  return next;
}

/** slotId가 아닌 다른 칸에 낀 특급 보호장구 (없으면 undefined) */
export function otherExoticGear(gear: Build["gear"], slotId: GearSlotId) {
  const slot = GEAR_SLOTS.find((s) => s.id !== slotId && gear[s.id]?.source === "exotic");
  return slot ? { slotLabel: slot.label, name: gearPieceName(gear[slot.id]!) } : undefined;
}

export function gearPieceName(piece: GearPiece): string {
  const list =
    piece.source === "brand" ? BRANDS : piece.source === "set" ? GEAR_SETS : piece.source === "exotic" ? EXOTIC_GEAR : NAMED_ITEMS;
  return list.find((item) => item.id === piece.id)?.name ?? piece.id;
}

/** 결과 패널에 보여줄 활성 효과 한 줄 */
export interface ActiveBonus {
  title: string;
  detail: string;
  /** 조건부 효과라 토글에 따라 꺼질 수 있는지 */
  conditional?: boolean;
  /** 브랜드·기어세트 세트 효과인지 (결과의 "세트 효과"에는 이것만 보여준다) */
  set?: boolean;
}

export interface StatSource {
  label: string;
  value: number;
}

/** 장착한 브랜드·기어세트 하나의 진행도와 켜진 효과 */
export interface SetProgress {
  id: string;
  name: string;
  kind: "brand" | "set";
  count: number;
  /** 효과가 모두 켜지는 피스 수 (브랜드 3, 기어세트 4) */
  max: number;
  bonuses: ActiveBonus[];
}

export interface BuildResult {
  cores: Record<CoreId, number>;
  /** 세트 효과 진행도 (기어세트 먼저, 많이 낀 순) */
  sets: SetProgress[];
  /** 장비 부가 속성·개조의 공격/방어/스킬 개수 */
  attrs: Record<CoreId, number>;
  stats: Record<StatKey, number>;
  /** 스탯별로 어디서 왔는지 (단계별 펼쳐 보기용) */
  sources: Partial<Record<StatKey, StatSource[]>>;
  amps: AmpEffect[];
  active: ActiveBonus[];
  totalArmor: number;
  chcRaw: number;
  damage: DamageResult;
}

export interface DamageBucket {
  label: string;
  /** 곱해지는 배율 (1.25 = +25%) */
  multiplier: number;
  detail: string;
}

export interface DamageResult {
  buckets: DamageBucket[];
  body: number;
  crit: number;
  headshot: number;
  headshotCrit: number;
  expected: number;
  rpm: number;
  reload: number;
  burstDps: number;
  sustainedDps: number;
  magDamage: number;
  magTime: number;
}

function describeBonus(bonus: Bonus): string {
  const parts = [
    ...(bonus.stats ?? []).map((e) => formatStat(e.stat, e.value)),
    ...(bonus.amps ?? []).map((a) => `증폭 피해 +${a.value}%`),
  ];
  if (bonus.note) parts.push(bonus.note);
  return parts.join(", ") || "-";
}

export function formatStat(stat: StatKey, value: number): string {
  const info = STAT_INFO[stat];
  const num = info.unit === "%" ? `${+value.toFixed(1)}%` : Math.round(value).toLocaleString();
  return `${info.label} +${num}${info.unit === "/초" ? "/초" : ""}`;
}

/** extra: 비교용으로 더해 볼 스탯 (다음 속성 효율 계산에 쓴다) */
export function computeBuild(build: Build, extra: StatEffect[] = []): BuildResult {
  const stats = Object.fromEntries(Object.keys(STAT_INFO).map((k) => [k, 0])) as Record<StatKey, number>;
  const sources: BuildResult["sources"] = {};
  const amps: AmpEffect[] = [];
  const active: ActiveBonus[] = [];
  const cores: Record<CoreId, number> = { red: 0, blue: 0, yellow: 0 };
  const sets: SetProgress[] = [];
  const attrs: Record<CoreId, number> = { red: 0, blue: 0, yellow: 0 };
  const { conditional } = build.conditions;

  const add = (stat: StatKey, value: number, label: string) => {
    stats[stat] += value;
    (sources[stat] ??= []).push({ label, value });
  };
  const applyBonus = (bonus: Bonus, label: string) => {
    bonus.stats?.forEach((e) => add(e.stat, e.value, label));
    bonus.amps?.forEach((a) => amps.push(a));
  };

  // 1. 장비 각 칸: 코어·부가 속성·모드
  const brandCount = new Map<string, number>();
  const setCount = new Map<string, number>();
  for (const slot of GEAR_SLOTS) {
    const piece = build.gear[slot.id];
    if (!piece) continue;
    cores[piece.core] += 1;
    const core = CORE_ATTRIBUTES[piece.core].effect;
    add(core.stat, core.value * protoMultiplier(piece, "core"), `${slot.label} 코어`);
    piece.minors.slice(0, minorSlotCount(piece.source, piece.id)).forEach((minorId, i) => {
      const minor = MINOR_ATTRIBUTES.find((m) => m.id === minorId);
      if (!minor) return;
      add(minor.effect.stat, minor.effect.value * protoMultiplier(piece, `minor-${i}`), `${slot.label} 속성`);
      attrs[minor.kind] += 1;
    });
    if (slot.hasMod && piece.mod) {
      const mod = MINOR_ATTRIBUTES.find((m) => m.id === piece.mod);
      if (mod) {
        add(mod.effect.stat, mod.effect.value * protoMultiplier(piece, "mod"), `${slot.label} 모드`);
        attrs[mod.kind] += 1;
      }
    }

    if (piece.source === "named") {
      // 네임드는 고유 효과를 적용하고, 소속 브랜드 세트 개수에 더한다
      const named = findNamed(piece.id);
      if (!named) continue;
      const title = named.kind === "attr" ? `네임드 ${named.name}` : `네임드 ${named.name}: ${named.effectName}`;
      if (named.kind === "attr" || conditional) applyBonus(named.bonus, title);
      active.push({ title, detail: named.desc, conditional: named.kind === "talent" });
      const brand = namedBrand(named);
      if (brand) brandCount.set(brand.id, (brandCount.get(brand.id) ?? 0) + 1);
      continue;
    }
    if (piece.source === "exotic") {
      // 특급은 세트 개수에 들어가지 않고 고유 특수효과만 붙는다
      const exotic = findExoticGear(piece.id);
      if (!exotic) continue;
      const title = `특급 ${exotic.name}: ${exotic.talentName}`;
      if (conditional) applyBonus(exotic.bonus, title);
      active.push({ title, detail: exotic.desc, conditional: true });
      continue;
    }
    const counter = piece.source === "brand" ? brandCount : setCount;
    counter.set(piece.id, (counter.get(piece.id) ?? 0) + 1);
  }

  // 닌자바이크 메신저 백팩: 장착한 브랜드·기어세트 개수를 각각 1개씩 늘린다
  if (build.gear.backpack?.source === "exotic" && build.gear.backpack.id === NINJABIKE_BACKPACK_ID) {
    for (const counter of [brandCount, setCount]) for (const [id, count] of counter) counter.set(id, count + 1);
  }

  // 2. 브랜드 세트 효과 (1~3피스)
  for (const [brandId, count] of brandCount) {
    const brand = BRANDS.find((b) => b.id === brandId);
    if (!brand) continue;
    const progress: SetProgress = { id: brand.id, name: brand.name, kind: "brand", count, max: 3, bonuses: [] };
    brand.bonuses.slice(0, Math.min(count, 3)).forEach((bonus, i) => {
      const title = `${brand.name} ${i + 1}피스`;
      applyBonus(bonus, title);
      const entry = { title, detail: describeBonus(bonus), set: true };
      active.push(entry);
      progress.bonuses.push({ ...entry, title: `${i + 1}피스` });
    });
    sets.push(progress);
  }

  // 3. 기어세트 효과 (2/3/4피스 + 조끼·배낭 세트 탤런트)
  for (const [setId, count] of setCount) {
    const set = GEAR_SETS.find((g) => g.id === setId);
    if (!set) continue;
    const progress: SetProgress = { id: set.id, name: set.name, kind: "set", count, max: 4, bonuses: [] };
    sets.push(progress);
    if (count >= 2) {
      applyBonus(set.twoPiece, `${set.name} 2피스`);
      active.push({ title: `${set.name} 2피스`, detail: describeBonus(set.twoPiece), set: true });
      progress.bonuses.push({ title: "2피스", detail: describeBonus(set.twoPiece), set: true });
    }
    if (count >= 3) {
      applyBonus(set.threePiece, `${set.name} 3피스`);
      active.push({ title: `${set.name} 3피스`, detail: describeBonus(set.threePiece), set: true });
      progress.bonuses.push({ title: "3피스", detail: describeBonus(set.threePiece), set: true });
    }
    if (count >= 4) {
      const hasChest = build.gear.chest?.source === "set" && build.gear.chest.id === setId;
      const hasBackpack = build.gear.backpack?.source === "set" && build.gear.backpack.id === setId;
      const scaledAmp = set.ampScaling?.(hasChest, hasBackpack);
      const parts = [
        { title: `${set.name} 4피스: ${set.fourPiece.name}`, short: `4피스 ${set.fourPiece.name}`, bonus: set.fourPiece.bonus, on: true },
        { title: `조끼 탤런트: ${set.chest.name}`, short: `조끼 ${set.chest.name}`, bonus: set.chest.bonus, on: hasChest },
        { title: `배낭 탤런트: ${set.backpack.name}`, short: `배낭 ${set.backpack.name}`, bonus: set.backpack.bonus, on: hasBackpack },
      ];
      for (const [i, part] of parts.entries()) {
        if (!part.on) continue;
        if (conditional) applyBonus(part.bonus, part.title);
        // 중첩형 증폭은 조끼·배낭까지 반영한 최종값을 4피스 줄에 보여준다
        const detail =
          i === 0 && scaledAmp !== undefined
            ? `증폭 피해 +${+scaledAmp.toFixed(1)}%, ${describeBonus(part.bonus)}`
            : describeBonus(part.bonus);
        active.push({ title: part.title, detail, conditional: true, set: true });
        progress.bonuses.push({ title: part.short, detail, conditional: true, set: true });
      }
      if (conditional && scaledAmp !== undefined) amps.push({ label: set.fourPiece.name, value: +scaledAmp.toFixed(1) });
    }
  }

  // 4. 브랜드 조끼·배낭 탤런트
  for (const slotId of ["chest", "backpack"] as const) {
    const piece = build.gear[slotId];
    if (piece?.source !== "brand" || !piece.talent) continue;
    const talent = GEAR_TALENTS.find((t) => t.id === piece.talent);
    if (!talent) continue;
    if (conditional) applyBonus(talent.bonus, talent.name);
    active.push({ title: `${slotId === "chest" ? "조끼" : "배낭"} 탤런트: ${talent.name}`, detail: talent.desc, conditional: true });
  }

  // 5. 무기: 핵심 속성 2개(무기군 대미지 + 무기군 고유), 속성, 모드, 탤런트, 네임드·특급 고유 효과
  const { weapon } = build;
  const weaponItem = findWeapon(weapon.weaponId);
  const weaponKind = weaponItem?.kind ?? "normal";
  const weaponClass = WEAPON_CLASSES[weapon.cls];
  add(weaponClass.typeDmgStat, WEAPON_TYPE_CORE, `${weaponClass.label} 코어`);
  const classCore = weaponItem?.coreOverride ?? weaponClass.core;
  if (classCore) add(classCore.stat, classCore.value, `${weaponClass.label} 코어`);

  if (weaponItem?.perfectAttr) {
    applyBonus(weaponItem.perfectAttr.bonus, `네임드 ${weaponItem.name}`);
    active.push({ title: `네임드 ${weaponItem.name}`, detail: weaponItem.perfectAttr.desc });
  } else {
    const attr = WEAPON_ATTRIBUTES.find((a) => a.id === weapon.attr);
    if (attr) add(attr.effect.stat, attr.effect.value, "무기 속성");
  }
  if (weaponItem?.fixed) {
    const title = weaponKind === "exotic" ? `특급 ${weaponItem.name}` : `네임드 ${weaponItem.name}`;
    applyBonus(weaponItem.fixed.bonus, title);
    active.push({ title, detail: weaponItem.fixed.desc });
  }
  // 특급 무기는 부착물이 고정이라 무기 모드를 쓰지 않는다
  if (weaponKind !== "exotic") {
    weapon.mods.forEach((modId) => {
      const mod = WEAPON_MODS.find((m) => m.id === modId);
      if (mod) add(mod.effect.stat, mod.effect.value, "무기 모드");
    });
  }
  const fixedTalent = weaponItem?.fixedTalent;
  const weaponTalent = fixedTalent ?? WEAPON_TALENTS.find((t) => t.id === weapon.talent);
  if (weaponTalent) {
    if (conditional) applyBonus(weaponTalent.bonus, weaponTalent.name);
    active.push({ title: `무기 특수효과: ${weaponTalent.name}`, detail: weaponTalent.desc, conditional: true });
  }

  // 6. SHD 레벨 보너스
  if (build.conditions.shd) SHD_BONUS.forEach((e) => add(e.stat, e.value, "SHD 레벨"));
  extra.forEach((e) => add(e.stat, e.value, "비교용"));

  const chcRaw = stats.chc;
  const totalArmor = stats.armor * (1 + stats.armorPct / 100);

  sets.sort((x, y) => (x.kind === y.kind ? y.count - x.count : x.kind === "set" ? -1 : 1));

  return {
    cores,
    attrs,
    sets,
    stats,
    sources,
    amps,
    active,
    totalArmor,
    chcRaw,
    damage: computeDamage(build, stats, amps),
  };
}

/** 빨간 속성 한 칸을 더 얻는다면 지속 DPS가 몇 % 오르는지 비교한다 */
export function redAttributeGains(build: Build): { label: string; gain: number }[] {
  const baseDps = computeBuild(build).damage.sustainedDps;
  const candidates: { label: string; effect: StatEffect }[] = [
    { label: "무기 피해 코어 +15%", effect: CORE_ATTRIBUTES.red.effect },
    ...MINOR_ATTRIBUTES.filter((m) => m.kind === "red" && m.id !== "wh").map((m) => ({
      label: formatStat(m.effect.stat, m.effect.value),
      effect: m.effect,
    })),
  ];
  return candidates
    .map(({ label, effect }) => {
      const dps = computeBuild(build, [effect]).damage.sustainedDps;
      return { label, gain: baseDps > 0 ? (dps / baseDps - 1) * 100 : 0 };
    })
    .sort((a, b) => b.gain - a.gain);
}

/**
 * 디비전2 피해 공식 (커뮤니티 정리 기준 근사):
 * 기본 피해 × (1 + 무기 피해 + 무기 종류 피해) × (1 + 방어도/체력 피해) × (1 + 엄폐 밖 피해)
 *          × (1 + 치명타 피해) × (1 + 헤드샷 피해) × Π(1 + 증폭 피해)
 * 같은 버킷 안은 더하고, 버킷끼리는 곱한다.
 */
function computeDamage(build: Build, stats: Record<StatKey, number>, amps: AmpEffect[]): DamageResult {
  const { weapon, conditions } = build;
  const weaponClass = WEAPON_CLASSES[weapon.cls];
  const typeDmg = stats[weaponClass.typeDmgStat];
  const chc = Math.min(stats.chc, CHC_CAP) / 100;
  const chd = (BASE_CHD + stats.chd) / 100;
  const hsd = stats.hsd / 100;
  const hsRate = conditions.hsRate / 100;
  const targetDmg = conditions.target === "armor" ? stats.dta : stats.dth;
  const ampProduct = amps.reduce((acc, a) => acc * (1 + a.value / 100), 1);

  const buckets: DamageBucket[] = [
    {
      label: "무기 피해",
      multiplier: 1 + (stats.wd + typeDmg) / 100,
      detail: `무기 피해 ${+stats.wd.toFixed(1)}% + ${weaponClass.label} 피해 ${+typeDmg.toFixed(1)}%`,
    },
    {
      label: conditions.target === "armor" ? "방어도 피해" : "체력 피해",
      multiplier: 1 + targetDmg / 100,
      detail: `표적이 ${conditions.target === "armor" ? "방어도" : "체력"} 상태`,
    },
    {
      label: "엄폐 밖 표적 피해",
      multiplier: conditions.outOfCover ? 1 + stats.dtooc / 100 : 1,
      detail: conditions.outOfCover ? "표적이 엄폐 밖" : "표적이 엄폐 중 (미적용)",
    },
    {
      label: "증폭 피해",
      multiplier: ampProduct,
      detail: amps.length ? amps.map((a) => `${a.label} ${a.value}%`).join(" × ") : "없음",
    },
  ];

  const body = weapon.damage * buckets.reduce((acc, b) => acc * b.multiplier, 1);
  const crit = body * (1 + chd);
  const headshot = body * (1 + hsd);
  const headshotCrit = headshot * (1 + chd);
  // 치명타·헤드샷은 서로 독립인 확률로 보고 기대값을 낸다
  const expected = body * (1 + chc * chd) * (1 + hsRate * hsd);

  const rpm = weapon.rpm * (1 + stats.rof / 100);
  const reload = weapon.reload / (1 + stats.reload / 100);
  const shotsPerSec = rpm / 60;
  const magTime = shotsPerSec > 0 ? weapon.mag / shotsPerSec : 0;
  const magDamage = expected * weapon.mag;

  return {
    buckets,
    body,
    crit,
    headshot,
    headshotCrit,
    expected,
    rpm,
    reload,
    burstDps: expected * shotsPerSec,
    sustainedDps: magTime + reload > 0 ? magDamage / (magTime + reload) : 0,
    magDamage,
    magTime,
  };
}
