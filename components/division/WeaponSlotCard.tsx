"use client";

import { findWeapon, WEAPON_ATTRIBUTES, WEAPON_CLASSES, WEAPON_TALENTS } from "@/data/division-weapons";
import { formatStat, type WeaponBuild } from "@/lib/division/build";
import { formatShort } from "./ui";
import { WEAPON_KIND_BADGE, WeaponImage } from "./WeaponTile";

// 인게임 등급색: 일반 노랑, 네임드 주황, 특급 빨강 (왼쪽 띠와 옅어지는 배경)
const KIND_STYLE = {
  normal: { stripe: "bg-yellow-400", tint: "from-yellow-500/30" },
  named: { stripe: "bg-orange-500", tint: "from-orange-500/35" },
  exotic: { stripe: "bg-red-500", tint: "from-red-500/35" },
} as const;

/**
 * 무기 칸 타일 (주무기·보조 무기·권총). 누르면 무기 편집 시트를 연다.
 * active인 칸이 DPS 계산 기준이고, 다른 칸은 "기준" 버튼으로 바꾼다.
 */
export function WeaponSlotCard({
  label,
  weapon,
  active,
  onClick,
  onActivate,
}: {
  label: string;
  weapon: WeaponBuild;
  active: boolean;
  onClick: () => void;
  onActivate: () => void;
}) {
  const item = findWeapon(weapon.weaponId);
  const kind = item?.kind ?? "normal";
  const attr =
    item?.perfectAttr?.desc ??
    (() => {
      const found = WEAPON_ATTRIBUTES.find((a) => a.id === weapon.attr);
      return found ? formatStat(found.effect.stat, found.effect.value) : null;
    })();
  const talent = item?.fixedTalent?.name ?? WEAPON_TALENTS.find((t) => t.id === weapon.talent)?.name ?? null;

  return (
    <div
      className={`relative flex overflow-hidden rounded-lg border bg-[#1a2438] bg-linear-to-r ${KIND_STYLE[kind].tint} to-transparent ${
        active ? "border-orange-500" : "border-gray-200"
      }`}
    >
      <span className={`w-1 shrink-0 ${KIND_STYLE[kind].stripe}`} aria-hidden />
      <button type="button" onClick={onClick} className="flex min-w-0 flex-1 flex-col gap-1 p-2 text-left transition-colors hover:bg-white/5">
        <span className="pr-10 text-[10px] font-medium text-gray-400">{label}</span>
        <WeaponImage weaponId={weapon.weaponId} cls={weapon.cls} kind={kind} width={240} className="h-10 w-full" />
        <span className={`truncate text-xs font-semibold ${WEAPON_KIND_BADGE[kind].text}`}>{item?.name ?? weapon.weaponId}</span>
        <span className="truncate text-[10px] text-gray-400">
          {WEAPON_CLASSES[weapon.cls].label} · {formatShort(weapon.damage)} · {weapon.rpm}RPM
        </span>
        {attr && <span className={`truncate text-[10px] ${item?.perfectAttr ? "text-amber-700" : "text-gray-500"}`}>{attr}</span>}
        {talent && <span className="truncate text-[10px] font-medium text-orange-600">★ {talent}</span>}
      </button>
      {/* DPS 계산 기준 무기 표시·전환 */}
      <button
        type="button"
        onClick={onActivate}
        aria-pressed={active}
        title={active ? "지금 DPS 계산 기준 무기예요" : "이 무기로 DPS 계산"}
        className={`absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
          active ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-400 hover:border-orange-400 hover:text-orange-600"
        }`}
      >
        {active ? "● 기준" : "기준"}
      </button>
    </div>
  );
}
