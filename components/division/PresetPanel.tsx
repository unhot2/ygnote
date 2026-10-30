"use client";

import { useMemo } from "react";
import { GEAR_SLOTS } from "@/data/division-gear";
import { BUILD_PRESETS, PRESET_SOURCE, type BuildPreset } from "@/data/division-presets";
import { findWeapon } from "@/data/division-weapons";
import { computeBuild, gearPieceName, WEAPON_SLOTS, type Build } from "@/lib/division/build";
import { Panel, formatShort } from "./ui";

/** 시뮬레이터 하단의 추천 장비 목록. 이름을 누르면 그 세팅으로 빌드를 바꾼다 */
export function PresetPanel({ onApply }: { onApply: (preset: BuildPreset, build: Build) => void }) {
  // 지금 조건(헤드샷 비율 등)은 빌드마다 다르니 각 추천 세팅 기준 지속 DPS를 미리 계산해 둔다
  const presets = useMemo(
    () =>
      BUILD_PRESETS.map((preset) => {
        const build = preset.build();
        return { preset, build, dps: computeBuild(build).damage.sustainedDps };
      }),
    [],
  );

  return (
    <Panel
      title="추천장비"
      action={
        <a href={PRESET_SOURCE.url} target="_blank" rel="noreferrer" className="text-[11px] text-gray-400 underline hover:text-gray-700">
          출처: {PRESET_SOURCE.label}
        </a>
      }
    >
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map(({ preset, build, dps }) => (
          <li key={preset.id} className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => onApply(preset, preset.build())}
                className="text-left text-sm font-semibold text-orange-600 underline-offset-2 hover:underline"
              >
                {preset.name}
              </button>
              <span className="shrink-0 rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">{preset.tag}</span>
            </div>
            <p>{preset.desc}</p>
            <p className="text-[11px] text-gray-500">
              {GEAR_SLOTS.map((slot) => {
                const piece = build.gear[slot.id];
                return piece ? gearPieceName(piece) : "-";
              }).join(" · ")}
            </p>
            <p className="text-[11px] text-gray-500">
              {WEAPON_SLOTS.map((slot) => findWeapon(build.weapons[slot.id].weaponId)?.name).join(" · ")}
            </p>
            {preset.note && <p className="text-[11px] text-gray-400">※ {preset.note}</p>}
            <p className="mt-auto pt-1 text-[11px] text-gray-400">
              지속 DPS <b className="text-gray-800">{formatShort(dps)}</b> (헤드샷 {build.conditions.hsRate}% 기준)
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
