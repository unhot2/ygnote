"use client";

import type { ReactNode } from "react";

/** 시뮬레이터 화면의 구역 카드 */
export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-[#111a2b] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
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
        className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-2 text-sm font-normal text-gray-900 focus:border-orange-500 focus:outline-none"
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
