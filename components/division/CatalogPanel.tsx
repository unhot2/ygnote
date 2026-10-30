"use client";

import { useState, type ReactNode } from "react";
import { BRANDS, GEAR_SETS, GEAR_SLOTS, type GearSlotId } from "@/data/division-gear";
import { EXOTIC_GEAR } from "@/data/division-exotic-gear";
import { NAMED_ITEMS } from "@/data/division-named";
import { WEAPON_CLASSES, WEAPON_ITEMS, type WeaponClassId, type WeaponKind } from "@/data/division-weapons";
import { describeStats } from "./EditorParts";
import { ExoticGearImage } from "./ExoticGearImage";
import { GearLogo } from "./GearLogo";
import { formatShort } from "./ui";
import { WEAPON_KIND_BADGE, WeaponImage } from "./WeaponTile";

type Category = "weapon" | "gear";
type GearSource = "brand" | "set" | "named" | "exotic";

const GEAR_SOURCES: [GearSource, string][] = [
  ["brand", "브랜드"],
  ["set", "기어세트"],
  ["named", "네임드"],
  ["exotic", "특급"],
];
const WEAPON_KINDS: [WeaponKind, string][] = [
  ["normal", "일반"],
  ["named", "네임드"],
  ["exotic", "특급"],
];

/** 장비 탭: 무기·보호장구 전체 목록을 종류별로 거르고 검색해서 본다 */
export function CatalogPanel() {
  const [category, setCategory] = useState<Category>("weapon");
  const [query, setQuery] = useState("");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 text-sm">
          {(
            [
              ["weapon", "무기"],
              ["gear", "장비"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={category === id}
              onClick={() => setCategory(id)}
              className={`rounded-lg px-6 py-1.5 font-medium transition-colors ${
                category === id ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름·효과 검색"
          className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:border-orange-500 focus:outline-none sm:max-w-xs"
        />
      </div>
      {category === "weapon" ? <WeaponList query={query} /> : <GearList query={query} />}
    </div>
  );
}

function matches(query: string, ...texts: (string | undefined)[]) {
  const q = query.trim().toLowerCase();
  return !q || texts.join(" ").toLowerCase().includes(q);
}

/** 하나만 고르는 칩 줄. value가 null이면 "전체" */
function ChipRow<T extends string>({
  options,
  value,
  onChange,
  allLabel,
}: {
  options: [T, string][];
  value: T | null;
  onChange: (value: T | null) => void;
  allLabel?: string;
}) {
  const chips: [T | null, string][] = allLabel ? [[null, allLabel], ...options] : options;
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map(([id, label]) => (
        <button
          key={label}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            value === id ? "border-orange-500 bg-orange-500/15 text-orange-600" : "border-gray-200 text-gray-500 hover:text-gray-800"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Count({ n }: { n: number }) {
  return <p className="text-xs text-gray-400">{n}개</p>;
}

function CardGrid({ children, empty }: { children: ReactNode[]; empty: boolean }) {
  if (empty) return <p className="py-10 text-center text-sm text-gray-400">결과가 없어요.</p>;
  return <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>;
}

/** 효과 한 줄: 굵은 제목 + 설명 */
function Line({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <p>
      {title && <b className="text-gray-800">{title} </b>}
      {children}
    </p>
  );
}

function WeaponList({ query }: { query: string }) {
  const [cls, setCls] = useState<WeaponClassId | null>(null);
  const [kind, setKind] = useState<WeaponKind | null>(null);
  const classOptions = (Object.keys(WEAPON_CLASSES) as WeaponClassId[]).map((id) => [id, WEAPON_CLASSES[id].label] as [WeaponClassId, string]);

  const listed = WEAPON_ITEMS.filter(
    (w) =>
      (!cls || w.cls === cls) &&
      (!kind || w.kind === kind) &&
      matches(query, w.name, w.en, w.base, w.fixedTalent?.name, w.fixedTalent?.desc, w.perfectAttr?.desc, w.fixed?.desc),
  );

  return (
    <>
      <ChipRow options={classOptions} value={cls} onChange={setCls} allLabel="전체" />
      <ChipRow options={WEAPON_KINDS} value={kind} onChange={setKind} allLabel="전체" />
      <Count n={listed.length} />
      <CardGrid empty={listed.length === 0}>
        {listed.map((w) => {
          const badge = WEAPON_KIND_BADGE[w.kind];
          return (
            <li key={w.id} className="flex gap-3 rounded-xl border border-gray-200 bg-[#111a2b] p-3">
              <WeaponImage weaponId={w.id} cls={w.cls} kind={w.kind} className="h-12 w-24" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-xs leading-relaxed text-gray-600">
                <div className="flex items-center gap-1.5">
                  <b className={`truncate text-sm ${badge.text}`}>{w.name}</b>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}>{badge.label}</span>
                </div>
                <span className="text-[11px] text-gray-400">
                  {WEAPON_CLASSES[w.cls].label}
                  {w.en && w.en !== w.name && ` · ${w.en}`}
                  {w.base && ` · ${w.base} 기반`}
                </span>
                <span className="text-[11px] text-gray-500">
                  대미지 {formatShort(w.damage)} · {w.rpm}RPM · 탄창 {w.mag}
                  {w.reload > 0 && ` · 재장전 ${w.reload}초`}
                </span>
                {w.perfectAttr && <Line title="고유 속성">{w.perfectAttr.desc}</Line>}
                {w.fixedTalent && <Line title={w.fixedTalent.name}>{w.fixedTalent.desc}</Line>}
                {w.fixed && <Line>{w.fixed.desc}</Line>}
              </div>
            </li>
          );
        })}
      </CardGrid>
    </>
  );
}

function GearList({ query }: { query: string }) {
  const [source, setSource] = useState<GearSource>("brand");
  const [slot, setSlot] = useState<GearSlotId | null>(null);
  const slotOptions = GEAR_SLOTS.map((s) => [s.id, s.label] as [GearSlotId, string]);
  const bySlot = source === "named" || source === "exotic";
  const slotLabel = (id: GearSlotId) => GEAR_SLOTS.find((s) => s.id === id)?.label;

  const cards: { key: string; node: ReactNode }[] = [];
  if (source === "brand") {
    for (const brand of BRANDS) {
      const effects = brand.bonuses.map(describeStats);
      if (!matches(query, brand.name, brand.en, ...effects)) continue;
      cards.push({
        key: brand.id,
        node: (
          <GearCard logo={<GearLogo source="brand" id={brand.id} name={brand.name} className="h-12 w-12" />} name={brand.name} sub={brand.en}>
            {effects.map((text, i) => (
              <Line key={i} title={`${i + 1}피스`}>
                {text}
              </Line>
            ))}
          </GearCard>
        ),
      });
    }
  } else if (source === "set") {
    for (const set of GEAR_SETS) {
      const lines: [string, string][] = [
        ["2피스", describeStats(set.twoPiece)],
        ["3피스", describeStats(set.threePiece)],
        [`4피스 ${set.fourPiece.name}`, describeStats(set.fourPiece.bonus)],
        [`조끼 ${set.chest.name}`, describeStats(set.chest.bonus)],
        [`배낭 ${set.backpack.name}`, describeStats(set.backpack.bonus)],
      ];
      if (!matches(query, set.name, set.en, ...lines.flat())) continue;
      cards.push({
        key: set.id,
        node: (
          <GearCard logo={<GearLogo source="set" id={set.id} name={set.name} className="h-12 w-12" />} name={set.name} sub={set.en}>
            {lines.map(([title, text]) => (
              <Line key={title} title={title}>
                {text || "4피스 효과 강화"}
              </Line>
            ))}
          </GearCard>
        ),
      });
    }
  } else if (source === "named") {
    for (const item of NAMED_ITEMS) {
      if (slot && item.slot !== slot) continue;
      if (!matches(query, item.name, item.en, item.brand, item.effectName, item.desc)) continue;
      cards.push({
        key: item.id,
        node: (
          <GearCard
            logo={<GearLogo source="named" id={item.id} name={item.name} className="h-12 w-12" />}
            name={item.name}
            nameClass="text-amber-700"
            sub={`${slotLabel(item.slot)} · ${item.en} · ${item.brand}`}
          >
            <Line title={item.kind === "talent" ? item.effectName ?? "고유 특수효과" : "고유 속성"}>{item.desc}</Line>
          </GearCard>
        ),
      });
    }
  } else {
    for (const item of EXOTIC_GEAR) {
      if (slot && item.slot !== slot) continue;
      if (!matches(query, item.name, item.en, item.talentName, item.desc)) continue;
      cards.push({
        key: item.id,
        node: (
          <GearCard
            logo={<ExoticGearImage id={item.id} slot={item.slot} className="h-12 w-12" />}
            name={item.name}
            nameClass="text-red-400"
            sub={`${slotLabel(item.slot)} · ${item.en}`}
          >
            <Line title={`특수효과 ${item.talentName}`}>{item.desc}</Line>
          </GearCard>
        ),
      });
    }
  }

  return (
    <>
      <ChipRow options={GEAR_SOURCES} value={source} onChange={(v) => v && setSource(v)} />
      {bySlot && <ChipRow options={slotOptions} value={slot} onChange={setSlot} allLabel="전체 부위" />}
      <Count n={cards.length} />
      <CardGrid empty={cards.length === 0}>{cards.map(({ key, node }) => <li key={key}>{node}</li>)}</CardGrid>
    </>
  );
}

function GearCard({
  logo,
  name,
  nameClass = "text-gray-900",
  sub,
  children,
}: {
  logo: ReactNode;
  name: string;
  nameClass?: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full gap-3 rounded-xl border border-gray-200 bg-[#111a2b] p-3">
      {logo}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-xs leading-relaxed text-gray-600">
        <b className={`truncate text-sm ${nameClass}`}>{name}</b>
        <span className="text-[11px] text-gray-400">{sub}</span>
        {children}
      </div>
    </div>
  );
}
