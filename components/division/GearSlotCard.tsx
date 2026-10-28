"use client";

import { GEAR_SETS, GEAR_TALENTS, MINOR_ATTRIBUTES, type GEAR_SLOTS } from "@/data/division-gear";
import { findNamed, formatStat, gearPieceName, type GearPiece } from "@/lib/division/build";
import { CoreIcon } from "./CoreIcon";
import { GearLogo } from "./GearLogo";

export function minorLabel(id: string): string {
  const minor = MINOR_ATTRIBUTES.find((m) => m.id === id);
  return minor ? formatStat(minor.effect.stat, minor.effect.value) : id;
}

/** 장비 종류별 왼쪽 띠 색 (인게임처럼 네임드는 금색, 기어세트는 보라색) */
export const SOURCE_STYLE: Record<GearPiece["source"], { label: string; badge: string; stripe: string }> = {
  brand: { label: "브랜드", badge: "bg-gray-100 text-gray-600", stripe: "bg-gray-300" },
  named: { label: "네임드", badge: "bg-amber-100 text-amber-700", stripe: "bg-amber-400" },
  set: { label: "기어세트", badge: "bg-violet-100 text-violet-700", stripe: "bg-violet-500" },
};

/**
 * 장비 칸 네모 타일. 누르면 편집 시트를 연다.
 * 아래쪽에 인게임처럼 핵심 속성·속성·개조 아이콘을 늘어놓는다.
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
  const talentName = (() => {
    if (named) return named.kind === "talent" ? named.effectName ?? null : null;
    if (!piece || !slot.hasTalent) return null;
    if (piece.source === "set") {
      const set = GEAR_SETS.find((g) => g.id === piece.id);
      return set ? (slot.id === "chest" ? set.chest.name : set.backpack.name) : null;
    }
    return GEAR_TALENTS.find((t) => t.id === piece.talent)?.name ?? null;
  })();
  // 타일 아래 아이콘 줄: 부가 속성과 개조 (네임드 고유 속성은 금색 별)
  const attrIds = piece ? [...piece.minors, slot.hasMod ? piece.mod : null].filter((id): id is string => id !== null) : [];
  const attrTitle = piece
    ? [named?.kind === "attr" ? named.desc : null, ...attrIds.map(minorLabel), talentName && `★ ${talentName}`]
        .filter(Boolean)
        .join("\n")
    : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      title={attrTitle}
      className="relative flex min-h-28 overflow-hidden rounded-lg border border-gray-200 bg-[#1a2438] text-left transition-colors hover:border-orange-400 hover:bg-orange-50/40"
    >
      <span className={`w-1.5 shrink-0 ${piece ? SOURCE_STYLE[piece.source].stripe : "bg-gray-100"}`} aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col gap-1 p-2">
        <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
          <span aria-hidden>{slot.icon}</span>
          {slot.label}
        </span>
        {piece ? (
          <>
            <span className="flex items-center gap-1.5">
              <GearLogo source={piece.source} id={piece.id} name={gearPieceName(piece)} className="h-9 w-9" />
              <span className="flex min-w-0 flex-col">
                <span className={`line-clamp-2 text-xs font-semibold leading-tight ${named ? "text-amber-700" : "text-gray-900"}`}>
                  {gearPieceName(piece)}
                </span>
                {named && <span className="truncate text-[10px] text-gray-400">{named.brand}</span>}
              </span>
            </span>
            {talentName && <span className="truncate text-[11px] font-medium text-orange-600">★ {talentName}</span>}
            <span className="mt-auto flex flex-wrap items-center gap-1">
              <CoreIcon kind={piece.core} className="h-4 w-4" />
              {named?.kind === "attr" && <span className="text-xs leading-none text-amber-500">★</span>}
              {attrIds.map((id, i) => {
                const minor = MINOR_ATTRIBUTES.find((m) => m.id === id);
                return minor ? <CoreIcon key={i} kind={minor.kind} variant="attr" className="h-3.5 w-3.5" /> : null;
              })}
            </span>
          </>
        ) : (
          <span className="flex flex-1 items-center justify-center text-xs text-gray-400">+ 장비 선택</span>
        )}
      </span>
    </button>
  );
}
