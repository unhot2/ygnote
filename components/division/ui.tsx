"use client";

import type { ReactNode } from "react";

/** 시뮬레이터 화면의 구역 카드 */
export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

/** 라벨이 붙은 셀렉트. value가 null이면 "없음"을 고른 상태 */
export function SelectField({
  label,
  value,
  options,
  onChange,
  emptyLabel = "없음",
  groups,
}: {
  label: string;
  value: string | null;
  options?: SelectOption[];
  onChange: (value: string | null) => void;
  emptyLabel?: string | null;
  /** optgroup으로 묶어 보여줄 때 */
  groups?: { label: string; options: SelectOption[] }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
      {label}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-10 rounded-lg border border-gray-200 bg-white px-2 text-sm font-normal text-gray-900 focus:border-orange-500 focus:outline-none"
      >
        {emptyLabel !== null && <option value="">{emptyLabel}</option>}
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {groups?.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

/** 라벨이 붙은 숫자 입력 */
export function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
      {label}
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="h-10 rounded-lg border border-gray-200 px-2 text-sm font-normal text-gray-900 focus:border-orange-500 focus:outline-none"
      />
    </label>
  );
}

/** 켜고 끄는 스위치 행 */
export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
      <span className="flex flex-col">
        <span className="text-sm text-gray-900">{label}</span>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-orange-500"
      />
    </label>
  );
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("ko-KR");
}
