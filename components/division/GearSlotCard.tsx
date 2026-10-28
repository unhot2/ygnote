"use client";

import {
  CORE_ATTRIBUTES,
  GEAR_SETS,
  GEAR_TALENTS,
  MINOR_ATTRIBUTES,
  type CoreId,
  type GEAR_SLOTS,
} from "@/data/division-gear";
import { findExoticGear } from "@/data/division-exotic-gear";
import {
  findNamed,
  formatStat,
  gearPieceName,
  PROTO_MULTIPLIER,
  protoMultiplier,
  type GearPiece,
} from "@/lib/division/build";
import { GearLogo } from "./GearLogo";
import { ExoticGearImage } from "./ExoticGearImage";
import { GearSlotIcon } from "./GearSlotIcon";

export function minorLabel(id: string): string {
  const minor = MINOR_ATTRIBUTES.find((m) => m.id === id);
  return minor ? formatStat(minor.effect.stat, minor.effect.value) : id;
}

/**
 * 장비 종류별 타일 색. 인게임 등급색처럼 일반(브랜드)은 노랑, 네임드는 주황, 기어세트는 초록이다.
 * tint는 왼쪽에서 오른쪽으로 옅어지는 배경, stripe는 왼쪽 띠.
 */
export const SOURCE_STYLE: Record<GearPiece["source"], { label: string; tint: string; stripe: string }> = {
  brand: { label: "브랜드", tint: "from-yellow-500/30", stripe: "bg-yellow-400" },
  named: { label: "네임드", tint: "from-orange-500/35", stripe: "bg-orange-500" },
  set: { label: "기어세트", tint: "from-emerald-500/30", stripe: "bg-emerald-500" },
  exotic: { label: "특급", tint: "from-red-500/35", stripe: "bg-red-500" },
};

/** 공격·방어·스킬 속성 글자색 */
const CORE_TEXT: Record<CoreId, string> = { red: "text-red-400", blue: "text-sky-400", yellow: "text-yellow-400" };
/** 프로토타입(1.5배) 속성 글자색 */
const PROTO_TEXT = "font-semibold text-purple-400";

/**
 * 장비 칸 네모 타일. 누르면 편집 시트를 연다.
 * 왼쪽에 브랜드 로고를 크게, 오른쪽에 핵심 속성·속성·보호장구 개조를 글자로 보여준다.
 */
export function GearSlotCard({
  slot,
  piece,
  onClick,
}: {
  slot: (typeof GEAR_SLOTS)[number];
  piece: GearPiece | null;
  onClick: () => void;
}) {
  const named = piece?.source === "named" ? findNamed(piece.id) : undefined;
  const exotic = piece?.source === "exotic" ? findExoticGear(piece.id) : undefined;
  const talentName = (() => {
    if (named) return named.kind === "talent" ? named.effectName ?? null : null;
    if (exotic) return exotic.talentName;
    if (!piece || !slot.hasTalent) return null;
    if (piece.source === "set") {
      const set = GEAR_SETS.find((g) => g.id === piece.id);
      return set ? (slot.id === "chest" ? set.chest.name : set.backpack.name) : null;
    }
    return GEAR_TALENTS.find((t) => t.id === piece.talent)?.name ?? null;
  })();
  // 오른쪽에 글자로 늘어놓는 줄: 핵심 속성, 네임드 고유 속성, 부가 속성, 보호장구 개조
  const lines: { text: string; className: string }[] = [];
  if (piece) {
    const core = CORE_ATTRIBUTES[piece.core];
    const coreProto = protoMultiplier(piece, "core") > 1;
    lines.push({
      text: coreProto ? formatStat(core.effect.stat, core.effect.value * PROTO_MULTIPLIER) : core.label,
      className: `font-semibold ${coreProto ? PROTO_TEXT : CORE_TEXT[piece.core]}`,
    });
    if (named?.kind === "attr") lines.push({ text: named.desc, className: "font-medium text-amber-700" });
    const attrLine = (id: string | null, key: string, prefix = "") => {
      const attr = MINOR_ATTRIBUTES.find((m) => m.id === id);
      if (!attr) return;
      const mult = protoMultiplier(piece, key);
      lines.push({
        text: `${prefix}${formatStat(attr.effect.stat, attr.effect.value * mult)}`,
        className: mult > 1 ? PROTO_TEXT : CORE_TEXT[attr.kind],
      });
    };
    piece.minors.forEach((id, i) => {
      // 특급 장비의 계산하지 않는 고정 속성은 이름만 보여준다
      const text = exotic?.attrs[i]?.startsWith("text:") ? exotic.attrs[i].slice(5) : null;
      if (text) lines.push({ text, className: "text-gray-500" });
      else attrLine(id, `minor-${i}`);
    });
    if (slot.hasMod) attrLine(piece.mod, "mod", "개조 · ");
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-h-28 overflow-hidden rounded-lg border border-gray-200 bg-[#1a2438] text-left transition-colors hover:border-orange-400 ${
        piece ? `bg-linear-to-r ${SOURCE_STYLE[piece.source].tint} to-transparent` : "hover:bg-orange-50/40"
      }`}
    >
      <span className={`w-1.5 shrink-0 ${piece ? SOURCE_STYLE[piece.source].stripe : "bg-gray-100"}`} aria-hidden />
      {piece ? (
        <span className="flex min-w-0 flex-1 gap-2 p-2">
          {/* 왼쪽: 큰 브랜드 로고 (기어세트는 엠블럼) */}
          <span className="flex shrink-0 flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-gray-400">{slot.label}</span>
            {exotic ? (
              // 특급 장비는 브랜드 로고 대신 장비 이미지(없으면 빨간 부위 실루엣)를 보여준다
              <ExoticGearImage id={piece.id} slot={slot.id} className="h-14 w-14 sm:h-16 sm:w-16" />
            ) : (
              <GearLogo source={piece.source} id={piece.id} name={gearPieceName(piece)} bare className="h-14 w-14 sm:h-16 sm:w-16" />
            )}
          </span>
          {/* 오른쪽: 이름과 속성 글자 */}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span
              className={`line-clamp-2 text-xs font-semibold leading-tight ${exotic ? "text-red-400" : named ? "text-amber-700" : "text-gray-900"}`}
            >
              {gearPieceName(piece)}
            </span>
            {named && <span className="truncate text-[10px] text-gray-400">{named.brand}</span>}
            <span className="mt-0.5 flex flex-col text-[11px] leading-snug">
              {lines.map((line, i) => (
                <span key={i} className={`truncate ${line.className}`} title={line.text}>
                  {line.text}
                </span>
              ))}
            </span>
            {talentName && (
              <span className="truncate text-[11px] font-medium text-orange-600" title={talentName}>
                ★ {talentName}
              </span>
            )}
          </span>
        </span>
      ) : (
        <span className="relative flex min-w-0 flex-1 flex-col p-2">
          <GearSlotIcon
            slot={slot.id}
            className="pointer-events-none absolute right-2 top-1/2 h-16 w-16 -translate-y-1/2 text-gray-300"
          />
          <span className="text-[11px] font-medium text-gray-400">{slot.label}</span>
          <span className="flex flex-1 items-center text-xs text-gray-400">+ 장비 선택</span>
        </span>
      )}
    </button>
  );
}
