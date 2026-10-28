"use client";

import type { Conditions } from "@/lib/division/build";
import { Panel, Toggle } from "./ui";

/** DPS 계산 전제 조건 (헤드샷 비율, 표적 상태, 조건부 효과) */
export function ConditionPanel({ conditions, onChange }: { conditions: Conditions; onChange: (c: Conditions) => void }) {
  const update = (patch: Partial<Conditions>) => onChange({ ...conditions, ...patch });

  return (
    <Panel title="🎯 전투 조건">
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className="flex justify-between text-sm text-gray-900">
            헤드샷 비율 <b>{conditions.hsRate}%</b>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={conditions.hsRate}
            onChange={(e) => update({ hsRate: Number(e.target.value) })}
            className="accent-orange-500"
          />
        </label>

        <div className="flex items-center justify-between gap-3 py-1.5">
          <span className="text-sm text-gray-900">표적 상태</span>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-0.5 text-xs">
            {(
              [
                ["armor", "방어도 있음"],
                ["health", "체력만"],
              ] as const
            ).map(([target, label]) => (
              <button
                key={target}
                type="button"
                onClick={() => update({ target })}
                className={`rounded-md px-3 py-1.5 font-medium ${
                  conditions.target === target ? "bg-orange-500 text-white shadow-sm" : "text-gray-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Toggle label="표적이 엄폐 밖" checked={conditions.outOfCover} onChange={(outOfCover) => update({ outOfCover })} />
        <Toggle
          label="조건부 효과 적용"
          hint="탤런트·4세트를 최대 스택/상시 발동으로 가정"
          checked={conditions.conditional}
          onChange={(conditional) => update({ conditional })}
        />
        <Toggle
          label="SHD 레벨 최대 보너스"
          hint="무기 피해·헤드샷 +10%, 치확 +10%, 치피 +20% 등"
          checked={conditions.shd}
          onChange={(shd) => update({ shd })}
        />
      </div>
    </Panel>
  );
}
