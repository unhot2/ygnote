"use client";

import type { WeaponClassId, WeaponKind } from "@/data/division-weapons";

const CLASS_SHORT: Record<WeaponClassId, string> = {
  ar: "AR",
  smg: "SMG",
  lmg: "LMG",
  rifle: "RF",
  mmr: "MMR",
  shotgun: "SG",
  pistol: "PT",
};

/** 무기 아이콘 대신 쓰는 무기군 약어 타일. 네임드는 금색, 특급은 주황 테두리 */
export function WeaponTile({ cls, kind, className = "h-10 w-10" }: { cls: WeaponClassId; kind: WeaponKind; className?: string }) {
  const ring = kind === "named" ? "ring-2 ring-amber-400" : kind === "exotic" ? "ring-2 ring-orange-500" : "";
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-lg bg-[#0b111d] text-[11px] font-bold text-white ${ring} ${className}`}>
      {CLASS_SHORT[cls]}
    </span>
  );
}

export const WEAPON_KIND_BADGE: Record<WeaponKind, { label: string; className: string; text: string }> = {
  normal: { label: "일반", className: "bg-gray-100 text-gray-600", text: "text-gray-900" },
  named: { label: "네임드", className: "bg-amber-100 text-amber-700", text: "text-amber-700" },
  exotic: { label: "특급", className: "bg-orange-100 text-orange-700", text: "text-orange-600" },
};
