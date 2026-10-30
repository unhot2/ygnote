/**
 * 추천 장비 세트. 출처: Overgear "The Division 2 Best Builds for Any Activities" (2026-10 확인)
 * https://overgear.com/guides/division-2/best-builds-for-any-activities/
 * 출처에 없는 코어·부가 속성·무기 속성/모드는 빌드 의도에 맞는 일반적인 값(공격 빌드는 치명타 위주)으로 채웠다.
 * 시뮬레이터에 없는 장비·특수효과는 가장 가까운 것으로 대신하고 note에 적는다.
 */
import type { CoreId, GearSlotId } from "./division-gear";
import { findExoticGear } from "./division-exotic-gear";
import { findWeapon } from "./division-weapons";
import {
  createEmptyBuild,
  emptyGearPiece,
  weaponBuildFrom,
  type Build,
  type GearPiece,
  type WeaponBuild,
  type WeaponSlotId,
} from "@/lib/division/build";

export interface BuildPreset {
  id: string;
  name: string;
  /** 용도 (PvE DPS, 스킬, 상태이상 등) */
  tag: string;
  desc: string;
  /** 출처와 다르게 넣은 부분 */
  note?: string;
  build: () => Build;
}

export const PRESET_SOURCE = {
  label: "Overgear · Best Builds for Any Activities",
  url: "https://overgear.com/guides/division-2/best-builds-for-any-activities/",
};

type Piece = [source: GearPiece["source"], id: string, core: CoreId, minors: (string | null)[], mod?: string | null, talent?: string | null];
type Weapon = [id: string, talent?: string | null];

function gear(piece: Piece): GearPiece {
  const [source, id, core, minors, mod = null, talent = null] = piece;
  const base = emptyGearPiece(source, id);
  // 특급 장비의 고정 코어·속성은 emptyGearPiece가 채워 두므로, 고를 수 있는 칸("any"로 비어 있는 칸)만 채운다
  if (source === "exotic") {
    return {
      ...base,
      core: findExoticGear(id)?.core === "any" ? core : base.core,
      minors: base.minors.map((m, i) => m ?? minors[i] ?? null),
      mod: base.mod === null && mod ? mod : base.mod,
    };
  }
  return { ...base, core, minors: base.minors.map((_, i) => minors[i] ?? null), mod, talent };
}

function weapon([id, talent = null]: Weapon): WeaponBuild {
  const base = weaponBuildFrom(id);
  const item = findWeapon(id);
  // 네임드·특급은 고유 속성·특수효과가 고정이고, 특급은 부착물도 고정이다
  if (item?.kind === "exotic") return base;
  if (item?.kind === "named") return { ...base, attr: item.perfectAttr ? null : "chd", mods: ["chc", "chd"] };
  return { ...base, attr: "chd", talent, mods: ["chc", "chd"] };
}

function preset(gearList: Record<GearSlotId, Piece>, weapons: Record<WeaponSlotId, Weapon>, hsRate = 20): () => Build {
  return () => {
    const empty = createEmptyBuild();
    return {
      ...empty,
      gear: Object.fromEntries(Object.entries(gearList).map(([slot, piece]) => [slot, gear(piece)])) as Build["gear"],
      weapons: { primary: weapon(weapons.primary), secondary: weapon(weapons.secondary), sidearm: weapon(weapons.sidearm) },
      conditions: { ...empty.conditions, hsRate },
    };
  };
}

export const BUILD_PRESETS: BuildPreset[] = [
  {
    id: "st-elmos-striker",
    name: "성 엘모 공격세트",
    tag: "PvE DPS · 만능",
    desc: "스트라이커 4피스 + 메멘토로 지속 화력을 쌓는 가장 무난한 최상위 빌드",
    build: preset(
      {
        mask: ["set", "striker", "red", ["chc"], "chd"],
        chest: ["brand", "sombra", "red", ["chc", "chd"], "chd", "obliterate"],
        backpack: ["exotic", "memento", "red", ["chc", "chd"], "chd"],
        gloves: ["set", "striker", "red", ["chc"]],
        holster: ["set", "striker", "red", ["chd"]],
        kneepads: ["set", "striker", "red", ["chd"]],
      },
      { primary: ["st-elmos-engine"], secondary: ["gr9", "fast-hands"], sidearm: ["m45a1", "killer"] },
    ),
    note: "GR9 특수효과 Frenzy는 없어서 빠른 손으로 대신했어요.",
  },
  {
    id: "heartbreaker",
    name: "하트브레이커 방어세트",
    tag: "PvE DPS · 돌격소총",
    desc: "하트브레이커 4피스에 청부업자의 장갑·여우의 기도로 보너스 방어도와 대미지를 함께 챙기는 빌드",
    build: preset(
      {
        mask: ["set", "heartbreaker", "blue", ["chd"], "chd"],
        chest: ["set", "heartbreaker", "blue", ["chc"], "chd"],
        backpack: ["set", "heartbreaker", "blue", ["chd"], "chd"],
        gloves: ["named", "contractors-glove", "blue", ["chc"]],
        holster: ["set", "heartbreaker", "blue", ["chd"]],
        kneepads: ["named", "foxs-prayer", "blue", ["chd"]],
      },
      { primary: ["police-m4", "flatline"], secondary: ["acs12", "flatline"], sidearm: ["m45a1", "killer"] },
    ),
  },
  {
    id: "kingbreaker-spotter",
    name: "킹브레이커 펄스세트",
    tag: "PvE DPS · 돌격소총",
    desc: "하트브레이커에 완벽한 스포터 조끼(밀착점)와 왕 분쇄자를 쓰는 변형",
    build: preset(
      {
        mask: ["set", "heartbreaker", "blue", ["chd"], "chd"],
        chest: ["named", "closer", "blue", ["chc", "chd"], "chd"],
        backpack: ["set", "heartbreaker", "blue", ["chd"], "chd"],
        gloves: ["set", "heartbreaker", "blue", ["chc"]],
        holster: ["set", "heartbreaker", "blue", ["chd"]],
        kneepads: ["named", "foxs-prayer", "blue", ["chd"]],
      },
      { primary: ["kingbreaker"], secondary: ["acs12", "flatline"], sidearm: ["m45a1", "killer"] },
    ),
  },
  {
    id: "hunters-fury-ouroboros",
    name: "헌터스 퓨리 근접세트",
    tag: "파밍 · 기관단총",
    desc: "가까이 붙어 처치하며 생존하는 헌터스 퓨리 4피스 + 인티미데이트 조끼",
    build: preset(
      {
        mask: ["set", "hunters-fury", "red", ["chc"], "chd"],
        chest: ["brand", "sokolov", "red", ["chc", "chd"], "chd", "intimidate"],
        backpack: ["exotic", "memento", "red", ["chc", "chd"], "chd"],
        gloves: ["set", "hunters-fury", "red", ["chc"]],
        holster: ["set", "hunters-fury", "red", ["chd"]],
        kneepads: ["set", "hunters-fury", "red", ["chd"]],
      },
      { primary: ["ouroboros"], secondary: ["m870", "close-personal"], sidearm: ["m45a1", "killer"] },
    ),
  },
  {
    id: "iron-will-hotshot",
    name: "핫샷 저격세트",
    tag: "파밍 · 저격",
    desc: "강철의 의지로 바디샷을 헤드샷으로 바꾸는 핫샷 4피스 저격 빌드",
    build: preset(
      {
        mask: ["set", "hotshot", "red", ["hsd"], "hsd"],
        chest: ["exotic", "iron-will", "red", [], "hsd"],
        backpack: ["named", "melon-baller", "red", ["chd", "hsd"], "hsd"],
        gloves: ["set", "hotshot", "red", ["hsd"]],
        holster: ["set", "hotshot", "red", ["chd"]],
        kneepads: ["set", "hotshot", "red", ["hsd"]],
      },
      { primary: ["prima-donna"], secondary: ["model700", "ranger"], sidearm: ["d50", "killer"] },
      60,
    ),
  },
  {
    id: "negotiator-focus",
    name: "협상가 광역세트",
    tag: "PvE DPS · 전설",
    desc: "협상가 4피스로 표식 적에게 대미지를 퍼뜨리고 완벽한 포커스 조끼(훌륭한 귀감)로 원거리 화력을 올리는 빌드",
    build: preset(
      {
        mask: ["set", "negotiator", "red", ["chc"], "chd"],
        chest: ["named", "pristine-example", "red", ["chc", "chd"], "chd"],
        backpack: ["set", "negotiator", "red", ["chd"], "chd"],
        gloves: ["named", "contractors-glove", "red", ["chc"]],
        holster: ["set", "negotiator", "red", ["chd"]],
        kneepads: ["set", "negotiator", "red", ["chd"]],
      },
      { primary: ["famas", "fast-hands"], secondary: ["m1a", "ranger"], sidearm: ["m45a1", "killer"] },
    ),
  },
  {
    id: "tipping-scales-lmg",
    name: "저울 경기관총세트",
    tag: "PvE DPS · 경기관총",
    desc: "기울어진 저울 4피스와 코요테의 마스크로 경기관총 치명타를 끌어올리는 빌드",
    build: preset(
      {
        mask: ["exotic", "coyotes-mask", "red", [], "chd"],
        chest: ["set", "tipping-scales", "red", ["chc"], "chd"],
        backpack: ["set", "tipping-scales", "red", ["chd"], "chd"],
        gloves: ["named", "contractors-glove", "red", ["chc"]],
        holster: ["set", "tipping-scales", "red", ["chd"]],
        kneepads: ["set", "tipping-scales", "red", ["chd"]],
      },
      { primary: ["mg5", "strained"], secondary: ["gr9", "fast-hands"], sidearm: ["m45a1", "killer"] },
    ),
    note: "네임드 Big Alejandro와 Steady Handed·Frenzy는 없어서 MG5(중압감)·GR9(빠른 손)로 대신했어요.",
  },
  {
    id: "ember-engine-fafnir",
    name: "엠버 엔진 화상세트",
    tag: "상태이상 · 화상",
    desc: "엠버 엔진 4피스와 불쾌 마스크로 화상을 퍼뜨리는 상태이상 빌드",
    build: preset(
      {
        mask: ["exotic", "vile", "yellow", [], "status"],
        chest: ["set", "ember-engine", "yellow", ["status"], "status"],
        backpack: ["set", "ember-engine", "yellow", ["status"], "status"],
        gloves: ["set", "ember-engine", "yellow", ["status"]],
        holster: ["brand", "golan", "blue", ["status", "armorRegen"]],
        kneepads: ["set", "ember-engine", "yellow", ["status"]],
      },
      { primary: ["fafnir"], secondary: ["pyromaniac"], sidearm: ["m45a1", "killer"] },
    ),
    note: "출처의 보호장구 개조 '스킬 가속' 대신 상태이상 효과를 넣었어요.",
  },
  {
    id: "refactor-skill",
    name: "리팩터 스킬세트",
    tag: "스킬",
    desc: "리팩터 4피스와 완벽한 연합 공격 배낭(충격량 증폭기)으로 무기와 스킬 대미지를 번갈아 올리는 스킬 빌드",
    build: preset(
      {
        mask: ["set", "refactor", "yellow", ["skillDmg"], "skillDmg"],
        chest: ["brand", "hana", "yellow", ["skillDmg", "skillHaste"], "skillDmg", "glass-cannon"],
        backpack: ["named", "force-multiplier", "yellow", ["skillDmg", "skillHaste"], "skillDmg"],
        gloves: ["set", "refactor", "yellow", ["skillDmg"]],
        holster: ["set", "refactor", "yellow", ["skillHaste"]],
        kneepads: ["set", "refactor", "yellow", ["skillDmg"]],
      },
      { primary: ["capacitor"], secondary: ["harmony"], sidearm: ["m45a1", "in-sync"] },
    ),
    note: "와이번 조끼의 Kinetic Momentum은 없어서 출처의 대안인 하나-U 글래스 캐논을 넣었어요.",
  },
];
