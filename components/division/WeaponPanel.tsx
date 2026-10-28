"use client";

import {
  WEAPONS,
  WEAPON_ATTRIBUTES,
  WEAPON_CLASSES,
  WEAPON_MODS,
  WEAPON_TALENTS,
  type WeaponClassId,
} from "@/data/division-weapons";
import { formatStat, weaponBuildFrom, type WeaponBuild } from "@/lib/division/build";
import { NumberField, Panel, SelectField } from "./ui";

const WEAPON_GROUPS = (Object.keys(WEAPON_CLASSES) as WeaponClassId[]).map((cls) => ({
  label: WEAPON_CLASSES[cls].label,
  options: WEAPONS.filter((w) => w.cls === cls).map((w) => ({ value: w.id, label: w.name })),
}));

/** 무기 선택과 수치·속성·모드·탤런트 편집 */
export function WeaponPanel({ weapon, onChange }: { weapon: WeaponBuild; onChange: (weapon: WeaponBuild) => void }) {
  const update = (patch: Partial<WeaponBuild>) => onChange({ ...weapon, ...patch });
  const original = WEAPONS.find((w) => w.id === weapon.weaponId);
  const isEdited =
    original &&
    (original.damage !== weapon.damage ||
      original.rpm !== weapon.rpm ||
      original.mag !== weapon.mag ||
      original.reload !== weapon.reload);
  const talent = WEAPON_TALENTS.find((t) => t.id === weapon.talent);

  return (
    <Panel title="🔫 무기">
      <div className="flex flex-col gap-3">
        <SelectField
          label="무기"
          value={weapon.weaponId}
          emptyLabel={null}
          groups={WEAPON_GROUPS}
          // 무기를 바꿔도 속성·모드·탤런트는 그대로 둔다
          onChange={(id) => {
            if (!id) return;
            const base = weaponBuildFrom(id);
            onChange({ ...base, attr: weapon.attr, talent: weapon.talent, mods: weapon.mods });
          }}
        />
        <p className="text-xs text-gray-500">
          {WEAPON_CLASSES[weapon.cls].label} 코어 · <b className="text-gray-700">{WEAPON_CLASSES[weapon.cls].coreLabel}</b>
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <NumberField label="발당 기본 피해" value={weapon.damage} step={1000} onChange={(damage) => update({ damage })} />
          <NumberField label="RPM" value={weapon.rpm} step={10} onChange={(rpm) => update({ rpm })} />
          <NumberField label="탄창" value={weapon.mag} onChange={(mag) => update({ mag })} />
          <NumberField label="재장전(초)" value={weapon.reload} step={0.1} onChange={(reload) => update({ reload })} />
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
          <span>수치는 레벨 40 기준 근사치예요. 게임 화면 값으로 고쳐 쓰세요.</span>
          {isEdited && (
            <button
              type="button"
              onClick={() => update({ damage: original.damage, rpm: original.rpm, mag: original.mag, reload: original.reload })}
              className="shrink-0 font-medium text-orange-600 hover:underline"
            >
              기본값
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label="무기 속성"
            value={weapon.attr}
            options={WEAPON_ATTRIBUTES.map((a) => ({ value: a.id, label: formatStat(a.effect.stat, a.effect.value) }))}
            onChange={(attr) => update({ attr })}
          />
          <SelectField
            label="탤런트"
            value={weapon.talent}
            options={WEAPON_TALENTS.map((t) => ({ value: t.id, label: t.name }))}
            onChange={(talent) => update({ talent })}
          />
          {weapon.mods.map((modId, i) => (
            <SelectField
              key={i}
              label={`모드 ${i + 1}`}
              value={modId}
              options={WEAPON_MODS.map((m) => ({ value: m.id, label: m.label }))}
              onChange={(id) => {
                const mods = [...weapon.mods];
                mods[i] = id;
                update({ mods });
              }}
            />
          ))}
        </div>
        {talent && <p className="text-xs text-gray-500">{talent.desc}</p>}
      </div>
    </Panel>
  );
}
