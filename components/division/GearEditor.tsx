"use client";

import { useEffect, useState } from "react";
import {
  BRANDS,
  CORE_ATTRIBUTES,
  GEAR_SETS,
  GEAR_SLOTS,
  GEAR_TALENTS,
  MINOR_ATTRIBUTES,
  type Bonus,
  type CoreId,
  type GearSlotId,
} from "@/data/division-gear";
import { NAMED_ITEMS } from "@/data/division-named";
import {
  emptyGearPiece,
  findNamed,
  formatStat,
  minorSlotCount,
  namedBrand,
  type GearPiece,
} from "@/lib/division/build";
import { GearLogo } from "./GearLogo";
import { minorLabel } from "./GearSlotCard";

function describeStats(bonus: Bonus) {
  return [
    ...(bonus.stats ?? []).map((e) => formatStat(e.stat, e.value)),
    ...(bonus.amps ?? []).map((a) => `증폭 피해 +${a.value}%`),
    ...(bonus.note ? [bonus.note] : []),
  ].join(", ");
}

/** 단계별 선택에서 고를 수 있는 항목 하나 */
interface StepOption {
  value: string | null;
  label: string;
  /** 코어 색 점 (코어·속성 단계) */
  dot?: string;
}

/** 순서대로 고르는 한 단계 (코어 → 속성 → 개조 → 탤런트) */
interface Step {
  key: string;
  title: string;
  value: string | null;
  options: StepOption[];
  apply: (value: string | null) => Partial<GearPiece>;
  /** 네임드 고유 효과처럼 바꿀 수 없는 단계. 진행할 때 건너뛴다 */
  locked?: { label: string; desc?: string };
}

const NONE: StepOption = { value: null, label: "없음" };

const MINOR_OPTIONS: StepOption[] = MINOR_ATTRIBUTES.map((m) => ({
  value: m.id,
  label: minorLabel(m.id),
  dot: CORE_ATTRIBUTES[m.kind].color,
}));

/**
 * 장비 한 칸을 고치는 시트. 휴대폰은 아래에서 올라오고, md 이상은 가운데 모달로 뜬다.
 * 왼쪽에는 브랜드·네임드·기어세트를 한 줄로 세로 스크롤하고, 오른쪽에서 코어 → 속성 → 개조 순서로 고른다.
 * 바꾸는 즉시 빌드에 반영한다.
 */
export function GearEditor({
  slotId,
  piece,
  onChange,
  onClose,
}: {
  slotId: GearSlotId;
  piece: GearPiece | null;
  onChange: (piece: GearPiece | null) => void;
  onClose: () => void;
}) {
  const slot = GEAR_SLOTS.find((s) => s.id === slotId)!;
  // 모든 단계를 한 번에 보여주고, 고른 단계는 선택지를 접는다.
  // 이미 장착된 장비를 열면 값이 정해진 단계(코어 포함)는 접힌 채로 시작한다.
  const [chosen, setChosen] = useState<Set<string>>(() => {
    if (!piece) return new Set();
    const keys = ["core"];
    piece.minors.forEach((id, i) => id && keys.push(`minor-${i}`));
    if (piece.mod) keys.push("mod");
    if (piece.talent) keys.push("talent");
    return new Set(keys);
  });

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

  const namedForSlot = NAMED_ITEMS.filter((item) => item.slot === slotId);
  const listFor = (source: GearPiece["source"]) =>
    source === "brand" ? BRANDS : source === "set" ? GEAR_SETS : namedForSlot;

  // 장비를 바꾸면 모든 단계의 선택지를 다시 펼친다
  const restartSteps = () => setChosen(new Set());

  const toggleStep = (key: string) =>
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const setSource = (source: GearPiece["source"] | null) => {
    if (source === null) return onChange(null);
    if (piece?.source === source) return;
    onChange({ ...emptyGearPiece(source, listFor(source)[0].id), core: piece?.core ?? "red" });
    restartSteps();
  };

  const update = (patch: Partial<GearPiece>) => piece && onChange({ ...piece, ...patch });

  // 장비를 바꾸면 부가 속성 칸 수가 달라질 수 있어 고른 값은 살리고 길이만 맞춘다
  const selectItem = (id: string) => {
    if (!piece) return;
    const count = minorSlotCount(piece.source, id);
    const minors = Array.from({ length: count }, (_, i) => piece.minors[i] ?? null);
    update({ id, minors, talent: null });
    restartSteps();
  };

  const named = piece?.source === "named" ? findNamed(piece.id) : undefined;
  const brand =
    piece?.source === "brand" ? BRANDS.find((b) => b.id === piece.id) : named ? namedBrand(named) : undefined;
  const set = piece?.source === "set" ? GEAR_SETS.find((g) => g.id === piece.id) : undefined;
  const setTalent = set && slot.hasTalent ? (slotId === "chest" ? set.chest : set.backpack) : null;
  const selected = named ?? brand ?? set;

  const steps: Step[] = [];
  if (piece) {
    steps.push({
      key: "core",
      title: "코어 속성",
      value: piece.core,
      options: (Object.keys(CORE_ATTRIBUTES) as CoreId[]).map((core) => ({
        value: core,
        label: CORE_ATTRIBUTES[core].label,
        dot: CORE_ATTRIBUTES[core].color,
      })),
      apply: (core) => ({ core: (core ?? "red") as CoreId }),
    });
    // 네임드 고유 효과가 속성 자리를 차지하면 속성 1에 고정으로 넣는다 (조끼·배낭은 탤런트 자리)
    const namedTakesTalent = named?.kind === "talent" && (slotId === "chest" || slotId === "backpack");
    const lockedStep = (key: string, title: string): Step => ({
      key,
      title,
      value: null,
      options: [],
      apply: () => ({}),
      locked: {
        label: named!.kind === "attr" ? named!.desc : named!.effectName ?? named!.name,
        desc: named!.kind === "talent" ? named!.desc : undefined,
      },
    });
    if (named && !namedTakesTalent) steps.push(lockedStep("named", "속성 1"));
    const minorOffset = named && !namedTakesTalent ? 1 : 0;
    for (let i = 0; i < minorSlotCount(piece.source, piece.id); i++) {
      steps.push({
        key: `minor-${i}`,
        title: `속성 ${i + 1 + minorOffset}`,
        value: piece.minors[i] ?? null,
        options: [NONE, ...MINOR_OPTIONS],
        apply: (id) => {
          const minors = [...piece.minors];
          minors[i] = id;
          return { minors };
        },
      });
    }
    if (slot.hasMod) {
      steps.push({
        key: "mod",
        title: "보호장구 개조",
        value: piece.mod,
        options: [NONE, ...MINOR_OPTIONS],
        apply: (mod) => ({ mod }),
      });
    }
    if (slot.hasTalent && piece.source === "brand") {
      steps.push({
        key: "talent",
        title: "탤런트",
        value: piece.talent,
        options: [
          NONE,
          ...GEAR_TALENTS.filter((t) => t.slot === slotId).map((t) => ({ value: t.id, label: t.name })),
        ],
        apply: (talent) => ({ talent }),
      });
    }
    if (named && namedTakesTalent) steps.push(lockedStep("named", "탤런트"));
  }

  const choose = (step: Step, value: string | null) => {
    update(step.apply(value));
    setChosen((prev) => new Set(prev).add(step.key));
  };

  const talentDesc = piece?.talent ? GEAR_TALENTS.find((t) => t.id === piece.talent)?.desc : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-label={`${slot.label} 편집`}
        onClick={(e) => e.stopPropagation()}
        // 내용 길이만큼만 커지고, 넘치면 왼쪽 목록·오른쪽 단계가 각각 스크롤된다
        className="flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white md:max-h-[560px] md:max-w-2xl md:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold text-gray-900">
            <span aria-hidden>{slot.icon}</span> {slot.label}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            완료
          </button>
        </div>

        {/* 종류 */}
        <div className="border-b p-3">
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-gray-100 p-1 text-sm">
            {(
              [
                ["brand", "브랜드"],
                ["named", "네임드"],
                ["set", "기어세트"],
                [null, "비우기"],
              ] as const
            ).map(([source, label]) => {
              const isActive = (piece?.source ?? null) === source;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSource(source)}
                  className={`rounded-lg py-2 font-medium transition-colors ${
                    isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {piece ? (
          <div className="flex min-h-0 flex-1">
            {/* 왼쪽: 브랜드·네임드·세트 한 줄 세로 슬라이드 */}
            <ul className="w-24 shrink-0 overflow-y-auto border-r bg-gray-50 p-1.5 sm:w-28">
              {listFor(piece.source).map((item) => {
                const isActive = item.id === piece.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      title={`${item.name} (${item.en})`}
                      aria-pressed={isActive}
                      onClick={() => selectItem(item.id)}
                      className={`flex w-full flex-col items-center gap-1 rounded-lg p-1.5 transition-colors ${
                        isActive ? "bg-white shadow-sm ring-2 ring-orange-500" : "hover:bg-white"
                      }`}
                    >
                      <GearLogo source={piece.source} id={item.id} name={item.name} className="h-11 w-11" />
                      <span
                        className={`line-clamp-2 text-center text-[10px] leading-tight ${
                          piece.source === "named" ? "font-medium text-amber-700" : "text-gray-700"
                        }`}
                      >
                        {item.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* 오른쪽: 선택한 장비 정보와 단계별 선택 */}
            <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
              <div className="flex gap-3 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
                <GearLogo source={piece.source} id={piece.id} name={selected?.name ?? ""} className="h-12 w-12" />
                <div className="flex min-w-0 flex-col">
                  <b className={`text-sm ${named ? "text-amber-700" : "text-gray-900"}`}>{selected?.name}</b>
                  <span className="mb-1 text-[11px] text-gray-400">
                    {selected?.en}
                    {named && ` · ${named.brand}`}
                  </span>
                  {named && !brand && <p className="text-gray-400">브랜드 세트 효과 데이터가 없는 브랜드예요.</p>}
                  {brand &&
                    brand.bonuses.map((bonus, i) => (
                      <p key={i}>
                        <b className="text-gray-800">{i + 1}피스</b> {describeStats(bonus)}
                      </p>
                    ))}
                  {set && (
                    <>
                      <p>
                        <b className="text-gray-800">2피스</b> {describeStats(set.twoPiece)}
                      </p>
                      <p>
                        <b className="text-gray-800">3피스</b> {describeStats(set.threePiece)}
                      </p>
                      <p>
                        <b className="text-gray-800">4피스 {set.fourPiece.name}</b> {describeStats(set.fourPiece.bonus)}
                      </p>
                    </>
                  )}
                </div>
              </div>

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
                          <span className="shrink-0 text-xs" title="네임드 고유 효과라 바꿀 수 없어요" aria-label="고정">
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
                        onClick={() => toggleStep(step.key)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="shrink-0 text-xs font-medium text-gray-500">{step.title}</span>
                        <span className="ml-auto flex min-w-0 items-center gap-1.5 text-sm text-gray-900">
                          {current.dot && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${current.dot}`} aria-hidden />}
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
                                onClick={() => choose(step, option.value)}
                                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${
                                  isActive
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {option.dot && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${option.dot}`} aria-hidden />}
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {step.key === "talent" && talentDesc && !isOpen && (
                        <p className="border-t px-3 py-2 text-xs text-gray-500">{talentDesc}</p>
                      )}
                    </li>
                  );
                })}
              </ol>

              {/* 기어세트 조끼·배낭은 세트 탤런트가 자동으로 붙는다 */}
              {setTalent && (
                <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
                  <b>세트 탤런트: {setTalent.name}</b> · {describeStats(setTalent.bonus) || "4피스 효과 강화"}
                  <br />
                  같은 세트를 4피스 이상 장착하면 적용돼요.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="flex flex-1 items-center justify-center p-6 text-sm text-gray-400">
            위에서 브랜드·네임드·기어세트 중 하나를 고르세요.
          </p>
        )}
      </div>
    </div>
  );
}
