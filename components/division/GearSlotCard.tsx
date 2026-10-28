"use client";

import {
  CORE_ATTRIBUTES,
  GEAR_SETS,
  GEAR_TALENTS,
  MINOR_ATTRIBUTES,
  type GEAR_SLOTS,
} from "@/data/division-gear";
import { findNamed, formatStat, gearPieceName, type GearPiece } from "@/lib/division/build";
import { GearLogo } from "./GearLogo";

const SOURCE_BADGE: Record<GearPiece["source"], { label: string; className: string }> = {
  brand: { label: "브랜드", className: "bg-gray-100 text-gray-600" },
  named: { label: "네임드", className: "bg-amber-100 text-amber-700" },
  set: { label: "기어세트", className: "bg-emerald-100 text-emerald-700" },
};

export function minorLabel(id: string): string {
  const minor = MINOR_ATTRIBUTES.find((m) => m.id === id);
  return minor ? formatStat(minor.effect.stat, minor.effect.value) : id;
}

/** 장비 칸 요약 카드. 누르면 편집 시트를 연다 */
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

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-28 flex-col gap-1.5 rounded-xl border border-gray-200 bg-white p-3 text-left transition-colors hover:border-orange-400 hover:bg-orange-50/40"
    >
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <span aria-hidden>{slot.icon}</span>
        {slot.label}
        {piece && (
          <span
            className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold ${SOURCE_BADGE[piece.source].className}`}
          >
            {SOURCE_BADGE[piece.source].label}
          </span>
        )}
      </span>
      {piece ? (
        <>
          <span className="flex items-center gap-2">
            <GearLogo source={piece.source} id={piece.id} name={gearPieceName(piece)} className="h-8 w-8" />
            <span className="flex min-w-0 flex-col">
              <span className={`text-sm font-semibold leading-tight ${named ? "text-amber-700" : "text-gray-900"}`}>
                {gearPieceName(piece)}
              </span>
              {named && <span className="truncate text-[11px] text-gray-400">{named.brand}</span>}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-700">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${CORE_ATTRIBUTES[piece.core].color}`} aria-hidden />
            {CORE_ATTRIBUTES[piece.core].label}
          </span>
          {named?.kind === "attr" && <span className="text-xs font-medium text-amber-700">· {named.desc}</span>}
          {[...piece.minors, slot.hasMod ? piece.mod : null]
            .filter((id): id is string => id !== null)
            .map((id, i) => (
              <span key={i} className="text-xs text-gray-500">
                · {minorLabel(id)}
              </span>
            ))}
          {talentName && <span className="text-xs font-medium text-orange-600">★ {talentName}</span>}
        </>
      ) : (
        <span className="flex flex-1 items-center justify-center text-sm text-gray-400">+ 장비 선택</span>
      )}
    </button>
  );
}
