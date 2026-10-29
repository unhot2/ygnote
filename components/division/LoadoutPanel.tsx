"use client";

import { CHC_CAP, GEAR_SLOTS, type CoreId, type GearSlotId } from "@/data/division-gear";
import type { Build, BuildResult } from "@/lib/division/build";
import { CORE_NAMES, CoreIcon } from "./CoreIcon";
import { GearSlotCard } from "./GearSlotCard";
import { formatNumber, Panel } from "./ui";
import { WeaponSlotCard } from "./WeaponSlotCard";

// 인게임 장비창 순서: 마스크·배낭 / 조끼·장갑 / 권총집·무릎보호대
const SLOT_ORDER: GearSlotId[] = ["mask", "backpack", "chest", "gloves", "holster", "kneepads"];
const CORES: CoreId[] = ["red", "blue", "yellow"];

export function formatShort(value: number): string {
  if (value >= 1_000_000) return `${+(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${+(value / 1_000).toFixed(1)}k`;
  return formatNumber(value);
}

/**
 * 인게임 장비창 구성의 3단 패널.
 * 왼쪽: 지속 DPS 링, 공격·방어·스킬 핵심 속성/속성 개수, 주요 수치
 * 가운데: 무기 1칸과 보호장구 6칸 네모 타일
 * 오른쪽: 세트 효과 진행도와 치명타 확률 상한 바 (좁은 화면에서는 아래로 내려간다)
 */
export function LoadoutPanel({
  build,
  result,
  onEditSlot,
  onEditWeapon,
  onReset,
}: {
  build: Build;
  result: BuildResult;
  onEditSlot: (slot: GearSlotId) => void;
  onEditWeapon: () => void;
  onReset: () => void;
}) {
  const { damage } = result;
  const keyStats: [string, string][] = [
    ["무기 DMG", formatShort(damage.body)],
    ["RPM", String(Math.round(damage.rpm))],
    ["MAG", String(damage.mag)],
    ["방어도", formatShort(result.totalArmor)],
    ["스킬 등급", String(result.stats.skillTier)],
  ];
  const chc = Math.min(result.chcRaw, CHC_CAP);

  return (
    <Panel
      title="🛡️ 장비"
      action={
        <button type="button" onClick={onReset} className="text-xs font-medium text-gray-400 hover:text-gray-700">
          초기화
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)] lg:grid-cols-[8rem_minmax(0,1fr)_13rem] lg:gap-4">
        {/* 왼쪽: DPS 링, 속성 개수, 주요 수치 (휴대폰에서는 타일 폭을 넓히려고 위쪽 가로줄로 올린다) */}
        <aside className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-start gap-2 sm:flex sm:flex-col sm:gap-3">
          <div className="flex flex-col items-center rounded-lg border border-gray-200 px-1 py-2.5">
            <span className="text-[10px] text-gray-400">지속 DPS</span>
            <span className="my-1.5 flex aspect-square w-[4.5rem] items-center justify-center rounded-full border-[3px] border-orange-500 text-sm font-semibold tabular-nums text-gray-900 sm:w-20 sm:text-base">
              {formatShort(damage.sustainedDps)}
            </span>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <div className="mb-1 grid grid-cols-2 text-[10px] font-medium text-gray-400">
              <span>핵심</span>
              <span>속성</span>
            </div>
            {CORES.map((core) => (
              <div key={core} className="grid grid-cols-2 items-center py-0.5" title={CORE_NAMES[core]}>
                <span className="flex items-center gap-1.5">
                  <CoreIcon kind={core} className="h-4 w-4" />
                  <b className="tabular-nums text-gray-900">{result.cores[core]}</b>
                </span>
                <span className="flex items-center gap-1.5">
                  <CoreIcon kind={core} variant="attr" className="h-4 w-4" />
                  <b className="tabular-nums text-gray-900">{result.attrs[core]}</b>
                </span>
              </div>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-right sm:flex sm:flex-col sm:gap-1.5 sm:border-t sm:border-gray-200 sm:pt-2">
            {keyStats.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] text-gray-400">{label}</dt>
                <dd className="text-sm font-semibold tabular-nums text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        {/* 가운데: 무기 + 보호장구 네모 타일 */}
        <div className="flex min-w-0 flex-col gap-2">
          <h3 className="text-[11px] font-semibold text-gray-400">무기</h3>
          <div className="grid grid-cols-2 gap-2">
            <WeaponSlotCard weapon={build.weapon} onClick={onEditWeapon} />
          </div>
          <h3 className="mt-1 text-[11px] font-semibold text-gray-400">보호장구</h3>
          <div className="grid grid-cols-2 gap-2">
            {SLOT_ORDER.map((id) => {
              const slot = GEAR_SLOTS.find((s) => s.id === id)!;
              return <GearSlotCard key={id} slot={slot} piece={build.gear[id]} onClick={() => onEditSlot(id)} />;
            })}
          </div>
        </div>

        {/* 오른쪽: 세트 효과 진행도 */}
        <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
          <h3 className="text-[11px] font-semibold text-gray-400">세트 효과</h3>
          {result.sets.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-400">브랜드 1피스부터 세트 효과가 켜져요.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {result.sets.map((set) => (
                <li
                  key={`${set.kind}:${set.id}`}
                  className={`border-l-[3px] bg-gray-50 px-2.5 py-2 ${set.kind === "set" ? "border-emerald-500" : "border-yellow-400"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-gray-900">{set.name}</span>
                    <span
                      className={`shrink-0 text-xs font-semibold tabular-nums ${set.count >= set.max ? "text-orange-600" : "text-gray-400"}`}
                    >
                      {Math.min(set.count, set.max)}/{set.max}
                    </span>
                  </div>
                  {set.bonuses.length === 0 ? (
                    <p className="mt-1 text-[11px] text-gray-400">2피스부터 효과가 켜져요.</p>
                  ) : (
                    <ul className="mt-1 flex flex-col gap-1">
                      {set.bonuses.map((b) => (
                        <li key={b.title} className="text-[11px] leading-snug text-gray-500">
                          <b className="font-semibold text-gray-700">{b.title}</b>
                          {b.conditional && <span className="ml-1 text-orange-600">조건부</span>}
                          <br />
                          {b.detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto rounded-lg border border-gray-200 p-2.5">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>치명타 확률</span>
              <span className="tabular-nums">
                {+chc.toFixed(1)}% / {CHC_CAP}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${(chc / CHC_CAP) * 100}%` }} />
            </div>
            {result.chcRaw > CHC_CAP && (
              <p className="mt-1 text-[11px] text-amber-700">{+(result.chcRaw - CHC_CAP).toFixed(1)}% 낭비 중</p>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
