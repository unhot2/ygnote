"use client";

import { useState } from "react";
import type { Conditions } from "@/lib/division/build";

/**
 * 결과 바로 위에 붙는 전투 조건 칩. 누르면 그 자리에서 바로 바뀌어 결과와 함께 볼 수 있다.
 * 헤드샷 비율 칩은 누르면 아래에 슬라이더가 펼쳐진다.
 */
export function ConditionChips({ conditions, onChange }: { conditions: Conditions; onChange: (c: Conditions) => void }) {
  const [hsOpen, setHsOpen] = useState(false);
  const update = (patch: Partial<Conditions>) => onChange({ ...conditions, ...patch });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        <Chip active={hsOpen} onClick={() => setHsOpen((v) => !v)} title="헤드샷 비율">
          헤드샷 {conditions.hsRate}%
        </Chip>
        <Chip onClick={() => update({ target: conditions.target === "armor" ? "health" : "armor" })} title="표적 상태 바꾸기">
          {conditions.target === "armor" ? "방어도 표적" : "체력 표적"}
        </Chip>
        <Chip active={conditions.outOfCover} onClick={() => update({ outOfCover: !conditions.outOfCover })} title="표적이 엄폐 밖인지">
          {conditions.outOfCover ? "엄폐 밖" : "엄폐 중"}
        </Chip>
        <Chip
          active={conditions.conditional}
          onClick={() => update({ conditional: !conditions.conditional })}
          title="탤런트·4세트를 최대 스택/상시 발동으로 가정"
        >
          조건부 {conditions.conditional ? "최대" : "끔"}
        </Chip>
        <Chip active={conditions.shd} onClick={() => update({ shd: !conditions.shd })} title="SHD 레벨 최대 보너스 (무기 피해·헤드샷 +10%, 치확 +10%, 치피 +20% 등)">
          SHD {conditions.shd ? "최대" : "끔"}
        </Chip>
      </div>
      {hsOpen && (
        <label className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
          헤드샷 비율
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={conditions.hsRate}
            onChange={(e) => update({ hsRate: Number(e.target.value) })}
            className="flex-1 accent-orange-500"
          />
          <b className="w-9 text-right tabular-nums text-gray-900">{conditions.hsRate}%</b>
        </label>
      )}
    </div>
  );
}

function Chip({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
        active ? "border-orange-500 text-orange-600" : "border-gray-200 text-gray-700 hover:border-orange-400"
      }`}
    >
      {children}
    </button>
  );
}
