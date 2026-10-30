"use client";

import { useState } from "react";
import {
  BRANDS,
  CORE_ATTRIBUTES,
  GEAR_SETS,
  GEAR_SLOTS,
  GEAR_TALENTS,
  MINOR_ATTRIBUTES,
  type CoreId,
  type Bonus,
  type GearSlotId,
  type StatEffect,
  type StatKey,
} from "@/data/division-gear";
import { EXOTIC_GEAR, findExoticGear } from "@/data/division-exotic-gear";
import { NAMED_ITEMS, type NamedItem } from "@/data/division-named";
import {
  applyExoticFixed,
  emptyGearPiece,
  findNamed,
  formatStat,
  minorSlotCount,
  namedAttrLabel,
  namedBrand,
  PROTO_MULTIPLIER,
  type GearPiece,
} from "@/lib/division/build";
import {
  DeltaText,
  describeStats,
  EditorSheet,
  KindTabs,
  NONE,
  PickerToolbar,
  StepList,
  type Step,
  type StepOption,
} from "./EditorParts";
import { GearLogo } from "./GearLogo";
import { ExoticGearImage } from "./ExoticGearImage";
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
  ["exotic", "특급"],
  [null, "비우기"],
] as const;

/**
 * 장비 한 칸을 고치는 시트.
 * 왼쪽에는 브랜드·네임드·기어세트·특급을 한 줄로 세로 스크롤하고, 오른쪽에서 코어·속성·개조·탤런트를 고른다.
 * 바꾸는 즉시 빌드에 반영한다.
 */
export function GearEditor({
  slotId,
  piece,
  otherExotic,
  onChange,
  onClose,
  previewDps,
  equippedSetIds,
}: {
  slotId: GearSlotId;
  piece: GearPiece | null;
  /** 다른 칸에 낀 특급 보호장구. 이 칸에 특급을 끼우면 그 장비가 빠진다 */
  otherExotic?: { slotLabel: string; name: string };
  onChange: (piece: GearPiece | null) => void;
  onClose: () => void;
  /** 이 칸에 그 장비를 끼웠을 때의 지속 DPS */
  previewDps: (piece: GearPiece | null) => number;
  /** 다른 칸에 이미 낀 브랜드·기어세트 id ("세트 완성" 필터용) */
  equippedSetIds: string[];
}) {
  const slot = GEAR_SLOTS.find((s) => s.id === slotId)!;
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [sortByDps, setSortByDps] = useState(false);
  // 편집 창을 열 때 다른 칸에 있던 특급. 이 칸에 특급을 끼우면 바로 빠지므로 처음 값을 기억해 안내한다
  const [replacedExotic] = useState(otherExotic);

  const namedForSlot = NAMED_ITEMS.filter((item) => item.slot === slotId);
  const exoticForSlot = EXOTIC_GEAR.filter((item) => item.slot === slotId);
  const listFor = (source: GearPiece["source"]) =>
    source === "brand" ? BRANDS : source === "set" ? GEAR_SETS : source === "exotic" ? exoticForSlot : namedForSlot;

  const setSource = (source: GearPiece["source"] | null) => {
    if (source === null) return onChange(null);
    if (piece?.source === source) return;
    onChange(applyExoticFixed({ ...emptyGearPiece(source, listFor(source)[0].id), core: piece?.core ?? "red" }));
  };

  const update = (patch: Partial<GearPiece>) => piece && onChange({ ...piece, ...patch });

  // 장비를 바꾸면 부가 속성 칸 수가 달라질 수 있어 고른 값은 살리고 길이만 맞춘다
  const candidate = (base: GearPiece, id: string): GearPiece => {
    const count = minorSlotCount(base.source, id);
    const minors = Array.from({ length: count }, (_, i) => base.minors[i] ?? null);
    // 특급은 고정 코어·속성을 채워 넣는다
    return applyExoticFixed({ ...base, id, minors, talent: null });
  };
  const selectItem = (id: string) => piece && onChange(candidate(piece, id));

  // 목록: 검색어·필터로 거르고, 지금 장비 대비 지속 DPS 변화(%)를 붙인다
  const baseDps = previewDps(piece);
  const q = query.trim().toLowerCase();
  const listed = piece
    ? listFor(piece.source)
        .map((item) => {
          const info = itemInfo(piece.source, item.id);
          const dps = previewDps(candidate(piece, item.id));
          return { item, info, delta: baseDps > 0 ? (dps / baseDps - 1) * 100 : null };
        })
        .filter(
          ({ item, info }) =>
            (!q || `${item.name} ${item.en} ${info.text}`.toLowerCase().includes(q)) &&
            (!filters.includes("offense") || info.offense) &&
            (!filters.includes("chc") || info.stats.includes("chc")) &&
            (!filters.includes("owned") || (info.groupId !== undefined && equippedSetIds.includes(info.groupId))),
        )
    : [];
  if (sortByDps) listed.sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));

  const named = piece?.source === "named" ? findNamed(piece.id) : undefined;
  const brand =
    piece?.source === "brand" ? BRANDS.find((b) => b.id === piece.id) : named ? namedBrand(named) : undefined;
  const set = piece?.source === "set" ? GEAR_SETS.find((g) => g.id === piece.id) : undefined;
  const exotic = piece?.source === "exotic" ? findExoticGear(piece.id) : undefined;
  const setTalent = set && slot.hasTalent ? (slotId === "chest" ? set.chest : set.backpack) : null;
  const selected = exotic ?? named ?? brand ?? set;

  // 프로토타입 토글: 켜면 해당 속성 수치를 1.5배로 계산하고 보라색으로 보여준다
  const protoFor = (key: string, effect: StatEffect | undefined): Step["proto"] => {
    if (!piece) return undefined;
    const on = piece.proto?.includes(key) ?? false;
    return {
      on,
      toggle: () => {
        const current = piece.proto ?? [];
        update({ proto: on ? current.filter((k) => k !== key) : [...current, key] });
      },
      label: effect ? formatStat(effect.stat, effect.value * PROTO_MULTIPLIER) : undefined,
    };
  };

  const namedProto = (item: NamedItem): Step["proto"] => {
    const base = protoFor("named", undefined);
    return base && { ...base, label: namedAttrLabel(item, PROTO_MULTIPLIER) };
  };

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
      proto: protoFor("core", CORE_ATTRIBUTES[piece.core].effect),
      // 특급 장비의 고정 코어는 바꿀 수 없다
      locked: exotic && exotic.core !== "any" ? { label: CORE_ATTRIBUTES[piece.core].label } : undefined,
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
      // 네임드 고유 속성도 프로토타입이면 1.5배
      proto: named!.kind === "attr" ? namedProto(named!) : undefined,
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
        proto: protoFor(`minor-${i}`, MINOR_ATTRIBUTES.find((m) => m.id === piece.minors[i])?.effect),
        locked: exotic && exotic.attrs[i] !== "any"
          ? { label: exotic.attrs[i].startsWith("text:") ? exotic.attrs[i].slice(5) : minorLabel(exotic.attrs[i]) }
          : undefined,
      });
    }
    if (slot.hasMod && (!exotic || exotic.mod)) {
      steps.push({
        key: "mod",
        title: "보호장구 개조",
        value: piece.mod,
        options: [NONE, ...MINOR_OPTIONS],
        select: (mod) => update({ mod }),
        proto: protoFor("mod", MINOR_ATTRIBUTES.find((m) => m.id === piece.mod)?.effect),
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
    if (exotic) {
      steps.push({
        key: "exotic-talent",
        title: "특수효과",
        value: null,
        options: [],
        select: () => {},
        locked: { label: exotic.talentName, desc: exotic.desc },
      });
    }
  }

  // 이미 장착된 장비를 열면 값이 정해진 단계(코어 포함)는 접힌 채로 시작한다
  const initialChosen = piece
    ? ["core", ...piece.minors.flatMap((id, i) => (id ? [`minor-${i}`] : [])), ...(piece.mod ? ["mod"] : []), ...(piece.talent ? ["talent"] : [])]
    : [];

  return (
    <EditorSheet title={slot.label} icon={slot.icon} onClose={onClose}>
      <KindTabs tabs={SOURCE_TABS} active={piece?.source ?? null} onChange={setSource} />
      {piece && (
        <PickerToolbar
          query={query}
          onQuery={setQuery}
          filters={FILTERS}
          activeFilters={filters}
          onToggleFilter={(id) => setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))}
          sortByDps={sortByDps}
          onToggleSort={() => setSortByDps((v) => !v)}
        />
      )}

      {piece ? (
        <div className="flex min-h-0 flex-1">
          {/* 왼쪽: 브랜드·네임드·세트 한 줄 세로 슬라이드 */}
          <ul className="w-24 shrink-0 overflow-y-auto border-r bg-gray-50 p-1.5 sm:w-28">
            {listed.length === 0 && <li className="p-2 text-[10px] text-gray-400">결과 없음</li>}
            {listed.map(({ item, delta }) => {
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
                    {piece.source === "exotic" ? (
                      <ExoticGearImage id={item.id} slot={slotId} className="h-11 w-11" />
                    ) : (
                      <GearLogo source={piece.source} id={item.id} name={item.name} className="h-11 w-11" />
                    )}
                    <span
                      className={`line-clamp-2 text-center text-[10px] leading-tight ${
                        piece.source === "named"
                          ? "font-medium text-amber-700"
                          : piece.source === "exotic"
                            ? "font-medium text-red-400"
                            : "text-gray-700"
                      }`}
                    >
                      {item.name}
                    </span>
                    {!isActive && <DeltaText delta={delta} />}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* 오른쪽: 선택한 장비 정보와 단계별 선택 */}
          <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
            {/* 특급 보호장구는 하나만 낄 수 있다 (이 칸에 특급을 끼우는 순간 다른 칸의 특급은 빠진다) */}
            {piece.source === "exotic" && (
              <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {replacedExotic
                  ? `특급 보호장구는 1개만 낄 수 있어요. ${replacedExotic.slotLabel}의 ${replacedExotic.name}이(가) 빠졌어요.`
                  : "특급 보호장구는 1개만 낄 수 있어요. 다른 칸에 특급을 끼우면 이 장비가 빠져요."}
              </p>
            )}
            <div className="flex gap-3 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
              {exotic ? (
                <ExoticGearImage id={piece.id} slot={slotId} className="h-16 w-16" />
              ) : (
                <GearLogo source={piece.source} id={piece.id} name={selected?.name ?? ""} className="h-12 w-12" />
              )}
              <div className="flex min-w-0 flex-col">
                <b className={`text-sm ${exotic ? "text-red-400" : named ? "text-amber-700" : "text-gray-900"}`}>{selected?.name}</b>
                <span className="mb-1 text-[11px] text-gray-400">
                  {selected?.en}
                  {named && ` · ${named.brand}`}
                </span>
                {named && !brand && <p className="text-gray-400">브랜드 세트 효과 데이터가 없는 브랜드예요.</p>}
                {exotic && (
                  <p>
                    <b className="text-gray-800">특수효과 {exotic.talentName}</b> {exotic.desc}
                  </p>
                )}
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
          위에서 브랜드·네임드·기어세트·특급 중 하나를 고르세요.
        </p>
      )}
    </EditorSheet>
  );
}

const FILTERS = [
  { id: "offense", label: "공격형" },
  { id: "chc", label: "치확 있음" },
  { id: "owned", label: "세트 완성" },
];

const OFFENSE_STATS: StatKey[] = [
  "wd", "chc", "chd", "hsd", "dta", "dth", "dtooc", "rof",
  "arDmg", "smgDmg", "lmgDmg", "rifleDmg", "mmrDmg", "shotgunDmg", "pistolDmg",
];

/** 목록 필터·검색용 장비 정보: 효과 문구, 포함한 스탯, 공격형 여부, 소속 브랜드·세트 id */
function itemInfo(source: GearPiece["source"], id: string): { text: string; stats: StatKey[]; offense: boolean; groupId?: string } {
  let bonuses: Bonus[] = [];
  let extraStats: StatKey[] = [];
  let groupId: string | undefined;
  let text = "";
  if (source === "brand") {
    const brand = BRANDS.find((b) => b.id === id);
    bonuses = brand?.bonuses ?? [];
    groupId = id;
  } else if (source === "set") {
    const set = GEAR_SETS.find((g) => g.id === id);
    if (set) {
      bonuses = [set.twoPiece, set.threePiece, set.fourPiece.bonus, set.chest.bonus, set.backpack.bonus];
      extraStats = set.scaledStats?.(true, true).map((e) => e.stat) ?? [];
      text = `${set.fourPiece.name} ${set.chest.name} ${set.backpack.name}`;
      if (set.ampScaling) extraStats.push("wd");
    }
    groupId = id;
  } else if (source === "named") {
    const named = findNamed(id);
    if (named) {
      const brand = namedBrand(named);
      bonuses = [named.bonus, ...(brand?.bonuses ?? [])];
      groupId = brand?.id;
      text = `${named.brand} ${named.effectName ?? ""} ${named.desc}`;
    }
  } else {
    const exotic = findExoticGear(id);
    if (exotic) {
      bonuses = [exotic.bonus];
      extraStats = exotic.attrs.filter((a): a is StatKey => !a.startsWith("text:") && a !== "any") as StatKey[];
      text = `${exotic.talentName} ${exotic.desc}`;
    }
  }
  const stats = [...bonuses.flatMap((b) => (b.stats ?? []).map((e) => e.stat)), ...extraStats];
  const hasAmp = bonuses.some((b) => (b.amps?.length ?? 0) > 0);
  text += " " + bonuses.map(describeStats).join(" ");
  return { text, stats, offense: hasAmp || stats.some((st) => OFFENSE_STATS.includes(st)), groupId };
}
