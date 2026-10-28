"use client";

import {
  BRANDS,
  CORE_ATTRIBUTES,
  GEAR_SETS,
  GEAR_SLOTS,
  GEAR_TALENTS,
  MINOR_ATTRIBUTES,
  type CoreId,
  type GearSlotId,
} from "@/data/division-gear";
import { NAMED_ITEMS } from "@/data/division-named";
import { emptyGearPiece, findNamed, minorSlotCount, namedBrand, type GearPiece } from "@/lib/division/build";
import { describeStats, EditorSheet, KindTabs, NONE, StepList, type Step, type StepOption } from "./EditorParts";
import { GearLogo } from "./GearLogo";
import { minorLabel } from "./GearSlotCard";

const MINOR_OPTIONS: StepOption[] = MINOR_ATTRIBUTES.map((m) => ({
  value: m.id,
  label: minorLabel(m.id),
  core: { kind: m.kind, variant: "attr" },
}));

const SOURCE_TABS = [
  ["brand", "브랜드"],
  ["named", "네임드"],
  ["set", "기어세트"],
  [null, "비우기"],
] as const;

/**
 * 장비 한 칸을 고치는 시트.
 * 왼쪽에는 브랜드·네임드·기어세트를 한 줄로 세로 스크롤하고, 오른쪽에서 코어·속성·개조·탤런트를 고른다.
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

  const namedForSlot = NAMED_ITEMS.filter((item) => item.slot === slotId);
  const listFor = (source: GearPiece["source"]) =>
    source === "brand" ? BRANDS : source === "set" ? GEAR_SETS : namedForSlot;

  const setSource = (source: GearPiece["source"] | null) => {
    if (source === null) return onChange(null);
    if (piece?.source === source) return;
    onChange({ ...emptyGearPiece(source, listFor(source)[0].id), core: piece?.core ?? "red" });
  };

  const update = (patch: Partial<GearPiece>) => piece && onChange({ ...piece, ...patch });

  // 장비를 바꾸면 부가 속성 칸 수가 달라질 수 있어 고른 값은 살리고 길이만 맞춘다
  const selectItem = (id: string) => {
    if (!piece) return;
    const count = minorSlotCount(piece.source, id);
    const minors = Array.from({ length: count }, (_, i) => piece.minors[i] ?? null);
    update({ id, minors, talent: null });
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
        core: { kind: core, variant: "core" },
      })),
      select: (core) => update({ core: (core ?? "red") as CoreId }),
    });
    // 네임드 고유 효과가 속성 자리를 차지하면 속성 1에 고정으로 넣는다 (조끼·배낭은 탤런트 자리)
    const namedTakesTalent = named?.kind === "talent" && (slotId === "chest" || slotId === "backpack");
    const lockedStep = (title: string): Step => ({
      key: "named",
      title,
      value: null,
      options: [],
      select: () => {},
      locked: {
        label: named!.kind === "attr" ? named!.desc : named!.effectName ?? named!.name,
        desc: named!.kind === "talent" ? named!.desc : undefined,
      },
    });
    if (named && !namedTakesTalent) steps.push(lockedStep("속성 1"));
    const minorOffset = named && !namedTakesTalent ? 1 : 0;
    for (let i = 0; i < minorSlotCount(piece.source, piece.id); i++) {
      steps.push({
        key: `minor-${i}`,
        title: `속성 ${i + 1 + minorOffset}`,
        value: piece.minors[i] ?? null,
        options: [NONE, ...MINOR_OPTIONS],
        select: (id) => {
          const minors = [...piece.minors];
          minors[i] = id;
          update({ minors });
        },
      });
    }
    if (slot.hasMod) {
      steps.push({
        key: "mod",
        title: "보호장구 개조",
        value: piece.mod,
        options: [NONE, ...MINOR_OPTIONS],
        select: (mod) => update({ mod }),
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
        select: (talent) => update({ talent }),
        note: piece.talent ? GEAR_TALENTS.find((t) => t.id === piece.talent)?.desc : undefined,
      });
    }
    if (named && namedTakesTalent) steps.push(lockedStep("탤런트"));
  }

  // 이미 장착된 장비를 열면 값이 정해진 단계(코어 포함)는 접힌 채로 시작한다
  const initialChosen = piece
    ? ["core", ...piece.minors.flatMap((id, i) => (id ? [`minor-${i}`] : [])), ...(piece.mod ? ["mod"] : []), ...(piece.talent ? ["talent"] : [])]
    : [];

  return (
    <EditorSheet title={slot.label} icon={slot.icon} onClose={onClose}>
      <KindTabs tabs={SOURCE_TABS} active={piece?.source ?? null} onChange={setSource} />

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
                      isActive ? "bg-[#1a2438] shadow-sm ring-2 ring-orange-500" : "hover:bg-[#1a2438]"
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

            <StepList steps={steps} initialChosen={initialChosen} resetKey={`${piece.source}:${piece.id}`} />

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
    </EditorSheet>
  );
}
