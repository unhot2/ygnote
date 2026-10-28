"use client";

import { useEffect, useMemo, useState } from "react";
import { ConditionPanel } from "@/components/division/ConditionPanel";
import { GearEditor } from "@/components/division/GearEditor";
import { LoadoutPanel } from "@/components/division/LoadoutPanel";
import { ResultPanel, StatTotalsPanel } from "@/components/division/ResultPanel";
import { SectionTabs } from "@/components/division/SectionTabs";
import { CoreIcon } from "@/components/division/CoreIcon";
import { formatNumber } from "@/components/division/ui";
import { WeaponEditor } from "@/components/division/WeaponEditor";
import { GEAR_SLOTS, type GearSlotId } from "@/data/division-gear";
import {
  computeBuild,
  createEmptyBuild,
  equipGear,
  otherExoticGear,
  redAttributeGains,
  type Build,
} from "@/lib/division/build";

// 지금 만들고 있는 빌드를 이 브라우저에만 저장해 둔다. 데이터 구조가 바뀌면 키 버전을 올린다.
const STORAGE_KEY = "ygnote:division-build:v1";

function loadBuild(): Build | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Build) : null;
  } catch {
    return null;
  }
}

/** /division 페이지: 위는 인게임풍 장비 패널, 아래는 스탯·조건과 DPS 결과 */
export function DivisionPageClient() {
  const [build, setBuild] = useState<Build>(createEmptyBuild);
  const [loaded, setLoaded] = useState(false);
  const [editingSlot, setEditingSlot] = useState<GearSlotId | null>(null);
  const [editingWeapon, setEditingWeapon] = useState(false);

  // 서버 렌더링 결과와 어긋나지 않도록 저장된 빌드는 마운트 뒤에 불러온다
  useEffect(() => {
    const saved = loadBuild();
    if (saved) setBuild(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    } catch {
      // 사생활 보호 모드 등에서 저장이 막혀도 시뮬레이터는 그대로 동작한다
    }
  }, [build, loaded]);

  const result = useMemo(() => computeBuild(build), [build]);
  const gains = useMemo(() => redAttributeGains(build), [build]);
  const emptySlots = GEAR_SLOTS.filter((slot) => !build.gear[slot.id]).length;

  const reset = () => {
    if (window.confirm("장비와 무기 설정을 모두 초기화할까요?")) setBuild(createEmptyBuild());
  };

  return (
    <>
      <SectionTabs />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 pb-24 md:pb-4">
        <section id="loadout" className="scroll-mt-16">
          <LoadoutPanel
            build={build}
            result={result}
            onEditSlot={setEditingSlot}
            onEditWeapon={() => setEditingWeapon(true)}
            onReset={reset}
          />
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section id="stats" className="flex scroll-mt-16 flex-col gap-4">
            <StatTotalsPanel result={result} />
            <ConditionPanel
              conditions={build.conditions}
              onChange={(conditions) => setBuild((b) => ({ ...b, conditions }))}
            />
            <p className="px-1 text-xs leading-relaxed text-gray-400">
              브랜드·기어세트·탤런트 수치는 공개 자료와 게임 내 값을 바탕으로 한 근사치예요. 타이틀 업데이트에 따라 실제
              값과 다를 수 있어요.
            </p>
          </section>
          <section id="dps" className="scroll-mt-16">
            <ResultPanel result={result} gains={gains} emptySlots={emptySlots} />
          </section>
        </div>
      </div>

      {/* 휴대폰에서는 결과가 맨 아래에 있어, 핵심 수치를 하단 바에 고정해 보여준다 */}
      <a
        href="#dps"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t bg-[#0f1726] px-4 py-3 text-gray-900 md:hidden"
      >
        <span className="flex flex-col">
          <span className="text-[11px] text-gray-400">지속 DPS</span>
          <b className="tabular-nums">{formatNumber(result.damage.sustainedDps)}</b>
        </span>
        <span className="flex items-center gap-2 text-sm">
          {(["red", "blue", "yellow"] as const).map((core) => (
            <span key={core} className="flex items-center gap-1">
              <CoreIcon kind={core} className="h-4 w-4" />
              {result.cores[core]}
            </span>
          ))}
          <span className="ml-1 text-xs text-gray-400">결과 ↓</span>
        </span>
      </a>

      {editingSlot && (
        <GearEditor
          slotId={editingSlot}
          piece={build.gear[editingSlot]}
          otherExotic={otherExoticGear(build.gear, editingSlot)}
          onChange={(piece) => setBuild((b) => ({ ...b, gear: equipGear(b.gear, editingSlot, piece) }))}
          onClose={() => setEditingSlot(null)}
        />
      )}
      {editingWeapon && (
        <WeaponEditor
          weapon={build.weapon}
          onChange={(weapon) => setBuild((b) => ({ ...b, weapon }))}
          onClose={() => setEditingWeapon(false)}
        />
      )}
    </>
  );
}
