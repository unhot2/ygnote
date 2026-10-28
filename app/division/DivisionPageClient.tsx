"use client";

import { useEffect, useMemo, useState } from "react";
import { ConditionPanel } from "@/components/division/ConditionPanel";
import { GearEditor } from "@/components/division/GearEditor";
import { GearSlotCard } from "@/components/division/GearSlotCard";
import { ResultPanel } from "@/components/division/ResultPanel";
import { formatNumber, Panel } from "@/components/division/ui";
import { WeaponPanel } from "@/components/division/WeaponPanel";
import { GEAR_SLOTS, type GearSlotId } from "@/data/division-gear";
import { computeBuild, createEmptyBuild, redAttributeGains, type Build } from "@/lib/division/build";

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

/** /division 페이지: 왼쪽은 장비·무기·조건 편집, 오른쪽은 계산 결과 */
export function DivisionPageClient() {
  const [build, setBuild] = useState<Build>(createEmptyBuild);
  const [loaded, setLoaded] = useState(false);
  const [editingSlot, setEditingSlot] = useState<GearSlotId | null>(null);

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
      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-4 p-4 pb-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:pb-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-4">
          <Panel
            title="🛡️ 장비"
            action={
              <button type="button" onClick={reset} className="text-xs font-medium text-gray-400 hover:text-gray-700">
                초기화
              </button>
            }
          >
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {GEAR_SLOTS.map((slot) => (
                <GearSlotCard
                  key={slot.id}
                  slot={slot}
                  piece={build.gear[slot.id]}
                  onClick={() => setEditingSlot(slot.id)}
                />
              ))}
            </div>
          </Panel>
          <WeaponPanel weapon={build.weapon} onChange={(weapon) => setBuild((b) => ({ ...b, weapon }))} />
          <ConditionPanel
            conditions={build.conditions}
            onChange={(conditions) => setBuild((b) => ({ ...b, conditions }))}
          />
          <p className="px-1 text-xs leading-relaxed text-gray-400">
            브랜드·기어세트·탤런트 수치는 공개 자료와 게임 내 값을 바탕으로 한 근사치예요. 타이틀 업데이트에 따라 실제 값과
            다를 수 있어요.
          </p>
        </div>

        <div id="division-result" className="md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:self-start md:overflow-y-auto">
          <ResultPanel result={result} gains={gains} emptySlots={emptySlots} />
        </div>
      </div>

      {/* 휴대폰에서는 결과가 맨 아래에 있어, 핵심 수치를 하단 바에 고정해 보여준다 */}
      <a
        href="#division-result"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t bg-gray-900 px-4 py-3 text-white md:hidden"
      >
        <span className="flex flex-col">
          <span className="text-[11px] text-gray-400">지속 DPS</span>
          <b className="tabular-nums">{formatNumber(result.damage.sustainedDps)}</b>
        </span>
        <span className="flex items-center gap-2 text-sm">
          <span>🔴 {result.cores.red}</span>
          <span>🔵 {result.cores.blue}</span>
          <span>🟡 {result.cores.yellow}</span>
          <span className="ml-1 text-xs text-gray-400">결과 ↓</span>
        </span>
      </a>

      {editingSlot && (
        <GearEditor
          slotId={editingSlot}
          piece={build.gear[editingSlot]}
          onChange={(piece) => setBuild((b) => ({ ...b, gear: { ...b.gear, [editingSlot]: piece } }))}
          onClose={() => setEditingSlot(null)}
        />
      )}
    </>
  );
}
