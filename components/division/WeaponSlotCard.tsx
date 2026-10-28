"use client";

import { findWeapon, WEAPON_ATTRIBUTES, WEAPON_CLASSES, WEAPON_TALENTS } from "@/data/division-weapons";
import { formatStat, type WeaponBuild } from "@/lib/division/build";
import { formatNumber } from "./ui";
import { WEAPON_KIND_BADGE, WeaponImage } from "./WeaponTile";

// 인게임 등급색: 일반 노랑, 네임드 주황, 특급 빨강 (왼쪽 띠와 옅어지는 배경)
const KIND_STYLE = {
  normal: { stripe: "bg-yellow-400", tint: "from-yellow-500/30" },
  named: { stripe: "bg-orange-500", tint: "from-orange-500/35" },
  exotic: { stripe: "bg-red-500", tint: "from-red-500/35" },
} as const;

/** 무기 칸 타일 (인게임 장비창 맨 위 무기 줄). 누르면 무기 편집 시트를 연다 */
export function WeaponSlotCard({ weapon, onClick }: { weapon: WeaponBuild; onClick: () => void }) {
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
    <button
      type="button"
      onClick={onClick}
      className={`col-span-2 flex overflow-hidden rounded-lg border border-gray-200 bg-[#1a2438] bg-linear-to-r ${KIND_STYLE[kind].tint} to-transparent text-left transition-colors hover:border-orange-400`}
    >
      <span className={`w-1.5 shrink-0 ${KIND_STYLE[kind].stripe}`} aria-hidden />
      <span className="flex min-w-0 flex-1 items-center gap-2.5 p-2">
        <WeaponImage weaponId={weapon.weaponId} cls={weapon.cls} kind={kind} width={320} className="h-16 w-32 sm:w-40" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-1.5">
            <span className={`truncate text-sm font-semibold ${WEAPON_KIND_BADGE[kind].text}`}>{item?.name ?? weapon.weaponId}</span>
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${WEAPON_KIND_BADGE[kind].className}`}>
              {WEAPON_KIND_BADGE[kind].label}
            </span>
          </span>
          <span className="truncate text-[11px] text-gray-400">
            {[WEAPON_CLASSES[weapon.cls].label, item?.base && `기반 ${item.base}`].filter(Boolean).join(" · ")}
          </span>
          <span className="truncate text-[11px] text-gray-500">
            {formatNumber(weapon.damage)} · {weapon.rpm} RPM · {weapon.mag}발
            {attr && <span className={item?.perfectAttr ? "text-amber-700" : ""}> · {attr}</span>}
          </span>
          {talent && <span className="truncate text-[11px] font-medium text-orange-600">★ {talent}</span>}
        </span>
      </span>
    </button>
  );
}
