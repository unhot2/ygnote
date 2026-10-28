"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Bonus, CoreId } from "@/data/division-gear";
import { formatStat } from "@/lib/division/build";
import { CoreIcon } from "./CoreIcon";

/** 보너스를 "치명타 확률 +6%, 증폭 피해 +20%, 설명" 한 줄로 */
export function describeStats(bonus: Bonus) {
  return [
    ...(bonus.stats ?? []).map((e) => formatStat(e.stat, e.value)),
    ...(bonus.amps ?? []).map((a) => `증폭 피해 +${a.value}%`),
    ...(bonus.note ? [bonus.note] : []),
  ].join(", ");
}

/**
 * 편집 시트 틀. 휴대폰은 아래에서 올라오고, md 이상은 가운데 모달로 뜬다.
 * 내용 길이만큼만 커지고, 넘치면 안쪽(왼쪽 목록·오른쪽 단계)이 각각 스크롤된다.
 */
export function EditorSheet({
  title,
  icon,
  onClose,
  children,
}: {
  title: string;
  icon: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // 시트가 떠 있는 동안 뒤 화면이 스크롤되지 않게 막는다
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-label={`${title} 편집`}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-2xl bg-[#111a2b] md:max-h-[560px] md:max-w-2xl md:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold text-gray-900">
            <span aria-hidden>{icon}</span> {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-orange-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-400"
          >
            완료
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** 브랜드/네임드/기어세트 같은 종류 탭 */
export function KindTabs<T extends string | null>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly (readonly [T, string])[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="border-b p-3">
      <div className="grid gap-1 rounded-xl bg-gray-100 p-1 text-sm" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map(([value, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(value)}
            className={`rounded-lg py-2 font-medium transition-colors ${
              active === value ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 단계별 선택에서 고를 수 있는 항목 하나 */
export interface StepOption {
  value: string | null;
  label: string;
  /** 공격·방어·스킬 아이콘 (코어·속성 단계) */
  core?: { kind: CoreId; variant: "core" | "attr" };
}

/** 편집 시트 오른쪽에 쌓이는 선택 단계 하나 */
export interface Step {
  key: string;
  title: string;
  value: string | null;
  options: StepOption[];
  select: (value: string | null) => void;
  /** 네임드·특급 고유 효과처럼 바꿀 수 없는 단계 */
  locked?: { label: string; desc?: string };
  /** 고른 뒤 접혔을 때 아래에 보여줄 설명 */
  note?: string;
}

export const NONE: StepOption = { value: null, label: "없음" };

/**
 * 선택 단계 목록. 모든 단계를 한 번에 보여주고, 고른 단계는 선택지를 접는다.
 * initialChosen: 처음부터 접어 둘 단계 key (이미 값이 정해진 단계)
 * resetKey가 바뀌면(다른 장비를 고르면) 모든 단계를 다시 펼친다.
 */
export function StepList({ steps, initialChosen, resetKey }: { steps: Step[]; initialChosen: string[]; resetKey: string }) {
  const [state, setState] = useState(() => ({ resetKey, chosen: new Set(initialChosen) }));
  // 다른 장비를 고르면 접힘 상태를 초기화한다 (렌더 중 상태 조정)
  const chosen = state.resetKey === resetKey ? state.chosen : new Set<string>();
  if (state.resetKey !== resetKey) setState({ resetKey, chosen });

  const update = (fn: (next: Set<string>) => void) =>
    setState((prev) => {
      const next = new Set(prev.chosen);
      fn(next);
      return { resetKey: prev.resetKey, chosen: next };
    });

  return (
    <ol className="flex flex-col gap-2">
      {steps.map((step, index) => {
        if (step.locked) {
          return (
            <li key={step.key} className="rounded-xl border border-amber-200 bg-amber-50/60">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="shrink-0 text-xs font-medium text-amber-700">{step.title}</span>
                <span className="ml-auto truncate text-sm font-medium text-amber-800">{step.locked.label}</span>
                <span className="shrink-0 text-xs" title="고유 효과라 바꿀 수 없어요" aria-label="고정">
                  🔒
                </span>
              </div>
              {step.locked.desc && (
                <p className="border-t border-amber-200 px-3 py-2 text-xs text-amber-800">{step.locked.desc}</p>
              )}
            </li>
          );
        }
        const isOpen = !chosen.has(step.key);
        const current = step.options.find((o) => o.value === step.value) ?? NONE;
        return (
          <li key={step.key} className="rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => update((next) => (next.has(step.key) ? next.delete(step.key) : next.add(step.key)))}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
                {index + 1}
              </span>
              <span className="shrink-0 text-xs font-medium text-gray-500">{step.title}</span>
              <span className="ml-auto flex min-w-0 items-center gap-1.5 text-sm text-gray-900">
                {current.core && <CoreIcon kind={current.core.kind} variant={current.core.variant} className="h-4 w-4" />}
                <span className="truncate">{current.label}</span>
              </span>
              <span className={`text-gray-300 transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden>
                ›
              </span>
            </button>
            {isOpen && (
              <div className="grid grid-cols-1 gap-1.5 border-t p-2 sm:grid-cols-2">
                {step.options.map((option) => {
                  const isActive = option.value === step.value;
                  return (
                    <button
                      key={option.value ?? "none"}
                      type="button"
                      onClick={() => {
                        step.select(option.value);
                        update((next) => next.add(step.key));
                      }}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${
                        isActive ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {option.core && <CoreIcon kind={option.core.kind} variant={option.core.variant} className="h-4 w-4" />}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
            {step.note && !isOpen && <p className="border-t px-3 py-2 text-xs text-gray-500">{step.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
