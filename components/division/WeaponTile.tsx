"use client";

import { useState } from "react";
import { wikiImage } from "@/data/division-gear";
import { weaponImageById } from "@/data/division-weapon-images";
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

/** 무기 이미지가 없을 때 쓰는 무기군 약어 타일. 네임드는 금색, 특급은 주황 테두리 */
export function WeaponTile({ cls, kind, className = "h-10 w-10" }: { cls: WeaponClassId; kind: WeaponKind; className?: string }) {
  const ring = kind === "named" ? "ring-2 ring-amber-400" : kind === "exotic" ? "ring-2 ring-orange-500" : "";
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-lg bg-[#0b111d] text-[11px] font-bold text-white ${ring} ${className}`}>
      {CLASS_SHORT[cls]}
    </span>
  );
}

/**
 * 무기 이미지 (위키 이미지, 없으면 기반 무기 이미지). 끝내 없거나 못 불러오면 약어 타일로 대신한다.
 * className으로 크기를 정한다 (가로로 긴 비율 권장).
 */
export function WeaponImage({
  weaponId,
  cls,
  kind,
  className = "h-10 w-20",
  width = 240,
}: {
  weaponId: string;
  cls: WeaponClassId;
  kind: WeaponKind;
  className?: string;
  width?: number;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const path = weaponImageById(weaponId);
  const src = path ? wikiImage(path, width) : null;

  if (!src || failedSrc === src) return <WeaponTile cls={cls} kind={kind} className={className} />;
  return (
    // 외부(팬덤 위키) 이미지라 next/image 최적화 설정 없이 그대로 쓴다
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" onError={() => setFailedSrc(src)} className={`shrink-0 object-contain ${className}`} />
  );
}

export const WEAPON_KIND_BADGE: Record<WeaponKind, { label: string; className: string; text: string }> = {
  normal: { label: "일반", className: "bg-gray-100 text-gray-600", text: "text-gray-900" },
  named: { label: "네임드", className: "bg-amber-100 text-amber-700", text: "text-amber-700" },
  exotic: { label: "특급", className: "bg-orange-100 text-orange-700", text: "text-orange-600" },
};
