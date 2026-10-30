"use client";

import { GEAR_SLOTS, type CoreId, type GearSlotId } from "@/data/division-gear";
import { WEAPON_SLOTS, type Build, type BuildResult, type WeaponSlotId } from "@/lib/division/build";
import { CORE_NAMES, CoreIcon } from "./CoreIcon";
import { GearSlotCard } from "./GearSlotCard";
import { Panel } from "./ui";
import { WeaponSlotCard } from "./WeaponSlotCard";

// 인게임 장비창 순서: 마스크·배낭 / 조끼·장갑 / 권총집·무릎보호대
const SLOT_ORDER: GearSlotId[] = ["mask", "backpack", "chest", "gloves", "holster", "kneepads"];
const CORES: CoreId[] = ["red", "blue", "yellow"];

/**
 * 장비 패널: 머리에 공격·방어·스킬 핵심/속성 개수, 무기 3칸(주무기 2 + 권총), 보호장구 6칸.
 * DPS·세트 효과는 결과 영역과 빌드 바에서 보여주므로 여기서는 장비만 다룬다.
 */
export function LoadoutPanel({
  build,
  result,
  onEditSlot,
  onEditWeapon,
  onActivateWeapon,
  onReset,
}: {
  build: Build;
  result: BuildResult;
  onEditSlot: (slot: GearSlotId) => void;
  onEditWeapon: (slot: WeaponSlotId) => void;
  onActivateWeapon: (slot: WeaponSlotId) => void;
  onReset: () => void;
}) {
  return (
    <Panel
      title="장비"
      action={
        <span className="flex items-center gap-3">
          {/* 핵심 속성 개수 / 속성 개수 */}
          <span className="flex items-center gap-2 text-xs">
            {CORES.map((core) => (
              <span key={core} className="flex items-center gap-1" title={`${CORE_NAMES[core]} 핵심 ${result.cores[core]} · 속성 ${result.attrs[core]}`}>
                <CoreIcon kind={core} className="h-3.5 w-3.5" />
                <b className="tabular-nums text-gray-900">{result.cores[core]}</b>
                <span className="tabular-nums text-gray-400">/{result.attrs[core]}</span>
              </span>
            ))}
          </span>
          <button type="button" onClick={onReset} className="text-xs font-medium text-gray-400 hover:text-gray-700">
            초기화
          </button>
        </span>
      }
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-[11px] font-semibold text-gray-400">무기 · 주무기 2 + 권총</h3>
        <div className="grid grid-cols-3 gap-2">
          {WEAPON_SLOTS.map((slot) => (
            <WeaponSlotCard
              key={slot.id}
              label={slot.label}
              weapon={build.weapons[slot.id]}
              active={build.activeWeapon === slot.id}
              onClick={() => onEditWeapon(slot.id)}
              onActivate={() => onActivateWeapon(slot.id)}
            />
          ))}
        </div>
        <h3 className="mt-1 text-[11px] font-semibold text-gray-400">보호장구</h3>
        <div className="grid grid-cols-2 gap-2">
          {SLOT_ORDER.map((id) => {
            const slot = GEAR_SLOTS.find((s) => s.id === id)!;
            return <GearSlotCard key={id} slot={slot} piece={build.gear[id]} onClick={() => onEditSlot(id)} />;
          })}
        </div>
      </div>
    </Panel>
  );
}
