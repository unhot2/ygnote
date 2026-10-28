"use client";

import { findWeapon, WEAPON_ATTRIBUTES, WEAPON_CLASSES, WEAPON_TALENTS } from "@/data/division-weapons";
import { formatStat, type WeaponBuild } from "@/lib/division/build";
import { formatNumber } from "./ui";
import { WEAPON_KIND_BADGE, WeaponTile } from "./WeaponTile";

const KIND_STRIPE = { normal: "bg-gray-300", named: "bg-amber-400", exotic: "bg-orange-500" } as const;

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
      className="col-span-2 flex overflow-hidden rounded-lg border border-gray-200 bg-[#1a2438] text-left transition-colors hover:border-orange-400 hover:bg-orange-50/40"
    >
      <span className={`w-1.5 shrink-0 ${KIND_STRIPE[kind]}`} aria-hidden />
      <span className="flex min-w-0 flex-1 items-center gap-2.5 p-2">
        <WeaponTile cls={weapon.cls} kind={kind} className="h-11 w-11" />
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
