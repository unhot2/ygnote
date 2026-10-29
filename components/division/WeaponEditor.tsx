"use client";

import {
  findWeapon,
  WEAPON_ATTRIBUTES,
  WEAPON_CLASSES,
  WEAPON_ITEMS,
  WEAPON_MODS,
  WEAPON_TALENTS,
  WEAPON_TYPE_CORE,
  type WeaponClassId,
  type WeaponKind,
} from "@/data/division-weapons";
import { formatStat, weaponBuildFrom, type WeaponBuild } from "@/lib/division/build";
import { describeStats, EditorSheet, KindTabs, NONE, StepList, type Step } from "./EditorParts";
import { NumberField } from "./ui";
import { WEAPON_KIND_BADGE, WeaponImage } from "./WeaponTile";

const KIND_TABS = [
  ["normal", "일반"],
  ["named", "네임드"],
  ["exotic", "특급"],
] as const;

const CLASS_ORDER = Object.keys(WEAPON_CLASSES) as WeaponClassId[];

const ATTR_OPTIONS = WEAPON_ATTRIBUTES.map((a) => ({ value: a.id, label: formatStat(a.effect.stat, a.effect.value) }));
const MOD_OPTIONS = WEAPON_MODS.map((m) => ({ value: m.id, label: m.label }));
const TALENT_OPTIONS = WEAPON_TALENTS.map((t) => ({ value: t.id, label: t.name }));

/**
 * 무기 칸을 고치는 시트. 장비 편집 시트와 같은 구조로
 * 왼쪽에 무기군별 무기 목록, 오른쪽에 속성·모드·특수효과 단계와 기본 수치를 둔다.
 */
export function WeaponEditor({
  weapon,
  onChange,
  onClose,
}: {
  weapon: WeaponBuild;
  onChange: (weapon: WeaponBuild) => void;
  onClose: () => void;
}) {
  const item = findWeapon(weapon.weaponId);
  const kind: WeaponKind = item?.kind ?? "normal";
  const update = (patch: Partial<WeaponBuild>) => onChange({ ...weapon, ...patch });

  // 무기를 바꿔도 고른 속성·모드·특수효과는 그대로 둔다 (해당 무기에서 쓰지 않으면 계산에서 빠진다)
  const selectItem = (id: string) => {
    const base = weaponBuildFrom(id);
    onChange({ ...base, attr: weapon.attr, talent: weapon.talent, mods: weapon.mods });
  };
  const setKind = (next: WeaponKind) => {
    if (next === kind) return;
    selectItem(WEAPON_ITEMS.find((w) => w.kind === next)!.id);
  };

  const list = WEAPON_ITEMS.filter((w) => w.kind === kind);
  const groups = CLASS_ORDER.map((cls) => ({ cls, items: list.filter((w) => w.cls === cls) })).filter((g) => g.items.length);
  const weaponClass = WEAPON_CLASSES[weapon.cls];
  const classCore = item?.coreOverride ?? weaponClass.core;

  const steps: Step[] = [];
  if (item?.perfectAttr) {
    steps.push({ key: "attr", title: "무기 속성", value: null, options: [], select: () => {}, locked: { label: item.perfectAttr.desc } });
  } else {
    steps.push({ key: "attr", title: "무기 속성", value: weapon.attr, options: [NONE, ...ATTR_OPTIONS], select: (attr) => update({ attr }) });
  }
  if (item?.fixed) {
    steps.push({
      key: "fixed",
      title: kind === "exotic" ? "부착물" : "고유 능력치",
      value: null,
      options: [],
      select: () => {},
      locked: { label: kind === "exotic" ? "고정" : item.fixed.desc, desc: kind === "exotic" ? item.fixed.desc.replace(/^부착물: /, "") : undefined },
    });
  }
  // 특급 무기는 부착물이 고정이라 무기 모드를 고르지 않는다
  if (kind !== "exotic") {
    weapon.mods.forEach((modId, i) =>
      steps.push({
        key: `mod-${i}`,
        title: `모드 ${i + 1}`,
        value: modId,
        options: [NONE, ...MOD_OPTIONS],
        select: (id) => {
          const mods = [...weapon.mods];
          mods[i] = id;
          update({ mods });
        },
      }),
    );
  }
  if (item?.fixedTalent) {
    steps.push({
      key: "talent",
      title: "특수효과",
      value: null,
      options: [],
      select: () => {},
      locked: { label: item.fixedTalent.name, desc: item.fixedTalent.desc },
    });
  } else {
    steps.push({
      key: "talent",
      title: "특수효과",
      value: weapon.talent,
      options: [NONE, ...TALENT_OPTIONS],
      select: (talent) => update({ talent }),
      note: weapon.talent ? WEAPON_TALENTS.find((t) => t.id === weapon.talent)?.desc : undefined,
    });
  }

  const initialChosen = [
    ...(weapon.attr ? ["attr"] : []),
    ...weapon.mods.flatMap((id, i) => (id ? [`mod-${i}`] : [])),
    ...(weapon.talent ? ["talent"] : []),
  ];

  const isEdited =
    item &&
    (item.damage !== weapon.damage || item.rpm !== weapon.rpm || item.mag !== weapon.mag || item.reload !== weapon.reload);

  return (
    <EditorSheet title="무기" icon="🔫" onClose={onClose}>
      <KindTabs tabs={KIND_TABS} active={kind} onChange={setKind} />

      <div className="flex min-h-0 flex-1">
        {/* 왼쪽: 무기군별 무기 한 줄 세로 슬라이드 */}
        <ul className="w-24 shrink-0 overflow-y-auto border-r bg-gray-50 p-1.5 sm:w-28">
          {groups.map((group) => (
            <li key={group.cls}>
              <p className="sticky top-0 z-[1] bg-gray-50 px-1 pb-1 pt-2 text-[10px] font-semibold text-gray-400">
                {WEAPON_CLASSES[group.cls].label}
              </p>
              <ul>
                {group.items.map((w) => {
                  const isActive = w.id === weapon.weaponId;
                  return (
                    <li key={w.id}>
                      <button
                        type="button"
                        title={w.en ? `${w.name} (${w.en})` : w.name}
                        aria-pressed={isActive}
                        onClick={() => selectItem(w.id)}
                        className={`flex w-full flex-col items-center gap-1 rounded-lg p-1.5 transition-colors ${
                          isActive ? "bg-[#1a2438] shadow-sm ring-2 ring-orange-500" : "hover:bg-[#1a2438]"
                        }`}
                      >
                        <WeaponImage weaponId={w.id} cls={w.cls} kind={w.kind} width={160} className="h-9 w-[4.5rem]" />
                        <span className={`line-clamp-2 text-center text-[10px] font-medium leading-tight ${WEAPON_KIND_BADGE[w.kind].text}`}>
                          {w.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        {/* 오른쪽: 선택한 무기 정보, 단계별 선택, 기본 수치 */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
          <div className="flex gap-3 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
            <WeaponImage weaponId={weapon.weaponId} cls={weapon.cls} kind={kind} className="h-14 w-28 rounded-lg bg-[#0b111d]" />
            <div className="flex min-w-0 flex-col">
              <b className={`text-sm ${WEAPON_KIND_BADGE[kind].text}`}>{item?.name ?? weapon.weaponId}</b>
              <span className="mb-1 text-[11px] text-gray-400">
                {[item?.en, weaponClass.label, item?.base && `기반 ${item.base}`].filter(Boolean).join(" · ")}
              </span>
              <p>
                <b className="text-gray-800">핵심 속성</b> {weaponClass.label} 대미지 +{WEAPON_TYPE_CORE}%
                {classCore && `, ${formatStat(classCore.stat, classCore.value)}`}
              </p>
              <p>
                <b className="text-gray-800">기본 헤드샷 대미지</b> {weaponClass.baseHsd}%
              </p>
              {item?.fixedTalent && describeStats(item.fixedTalent.bonus) && (
                <p>
                  <b className="text-gray-800">특수효과 반영</b> {describeStats(item.fixedTalent.bonus)}
                </p>
              )}
            </div>
          </div>

          <StepList steps={steps} initialChosen={initialChosen} resetKey={weapon.weaponId} />

          <div className="rounded-xl border border-gray-200 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-500">기본 수치 (레벨 40)</span>
              {isEdited && (
                <button
                  type="button"
                  onClick={() => update({ damage: item.damage, rpm: item.rpm, mag: item.mag, reload: item.reload })}
                  className="font-medium text-orange-600 hover:underline"
                >
                  기본값
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumberField label="발당 기본 피해" value={weapon.damage} step={1000} onChange={(damage) => update({ damage })} />
              <NumberField label="RPM" value={weapon.rpm} step={10} onChange={(rpm) => update({ rpm })} />
              <NumberField label="탄창" value={weapon.mag} onChange={(mag) => update({ mag })} />
              <NumberField label="재장전(초)" value={weapon.reload} step={0.1} onChange={(reload) => update({ reload })} />
            </div>
          </div>
        </div>
      </div>
    </EditorSheet>
  );
}
