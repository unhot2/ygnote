"use client";

import { BASE_CHD, CHC_CAP, STAT_INFO, type StatKey } from "@/data/division-gear";
import { activeWeaponOf, type Build, type BuildResult, type Conditions } from "@/lib/division/build";
import { ConditionChips } from "./ConditionChips";
import { formatNumber, formatShort, Panel } from "./ui";

const STAT_GROUPS: { id: (typeof STAT_INFO)[StatKey]["group"]; label: string }[] = [
  { id: "offense", label: "공격" },
  { id: "handling", label: "무기 조작" },
  { id: "defense", label: "방어" },
  { id: "skill", label: "스킬" },
];

export type ResultTab = "dps" | "stats" | "sets" | "compare";

const TABS: { id: ResultTab; label: string }[] = [
  { id: "dps", label: "DPS" },
  { id: "stats", label: "스탯" },
  { id: "sets", label: "세트" },
  { id: "compare", label: "비교" },
];

function formatValue(stat: StatKey, value: number) {
  const { unit } = STAT_INFO[stat];
  if (unit === "%") return `${+value.toFixed(1)}%`;
  return `${formatNumber(value)}${unit}`;
}

/**
 * 결과 영역. 맨 위에 전투 조건 칩을 두어 조건을 바꾸면서 바로 결과를 보고,
 * 아래는 DPS / 스탯 / 세트 / 비교 탭으로 나눈다.
 */
export function ResultsPanel({
  build,
  result,
  gains,
  emptySlots,
  compare,
  tab,
  onTabChange,
  onConditionsChange,
}: {
  build: Build;
  result: BuildResult;
  gains: { label: string; gain: number }[];
  emptySlots: number;
  /** A/B 비교에서 고정해 둔 B 빌드와 그 결과 */
  compare: { build: Build; result: BuildResult } | null;
  tab: ResultTab;
  onTabChange: (tab: ResultTab) => void;
  onConditionsChange: (conditions: Conditions) => void;
}) {
  return (
    <Panel title="결과">
      <div className="flex flex-col gap-3">
        <ConditionChips conditions={build.conditions} onChange={onConditionsChange} />
        <div role="tablist" className="flex gap-1 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => onTabChange(t.id)}
              className={`-mb-px border-b-2 px-3 py-1.5 text-sm font-semibold transition-colors ${
                tab === t.id ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === "dps" && <DpsTab build={build} result={result} gains={gains} emptySlots={emptySlots} />}
        {tab === "stats" && <StatsTab result={result} />}
        {tab === "sets" && <SetsTab result={result} />}
        {tab === "compare" && <CompareTab result={result} compare={compare} />}
      </div>
    </Panel>
  );
}

function DpsTab({
  build,
  result,
  gains,
  emptySlots,
}: {
  build: Build;
  result: BuildResult;
  gains: { label: string; gain: number }[];
  emptySlots: number;
}) {
  const { damage, stats } = result;
  const weapon = activeWeaponOf(build);
  const chc = Math.min(result.chcRaw, CHC_CAP) / 100;
  const chd = (BASE_CHD + stats.chd) / 100;
  const hsd = stats.hsd / 100;
  const hsRate = build.conditions.hsRate / 100;
  // 기본 피해에서 발당 기대 피해까지 곱해지는 배율을 순서대로 늘어놓는다
  const segments = [
    ...damage.buckets.map((b) => ({ label: b.label, mult: b.multiplier, color: BUCKET_COLORS[b.label] ?? "bg-gray-400" })),
    { label: "치명타·헤드샷 기대", mult: 1 + chc * chd + hsRate * hsd, color: "bg-purple-500" },
  ];
  const shown = segments.filter((s) => s.mult > 1.0005);
  const totalLog = shown.reduce((acc, s) => acc + Math.log(s.mult), 0);

  const warnings: string[] = [];
  if (result.chcRaw > CHC_CAP)
    warnings.push(`치명타 확률 ${+result.chcRaw.toFixed(1)}% — 상한 ${CHC_CAP}%를 넘어 ${+(result.chcRaw - CHC_CAP).toFixed(1)}%가 낭비돼요.`);
  if (emptySlots > 0) warnings.push(`비어 있는 장비 칸이 ${emptySlots}개 있어요.`);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        <Metric label="몸통" value={formatShort(damage.body)} />
        <Metric label="헤드샷 치명타" value={formatShort(damage.headshotCrit)} accent />
        <Metric label="탄창 1개" value={formatShort(damage.magDamage)} hint={`${damage.magTime.toFixed(1)}초`} />
        <Metric label="순간 DPS" value={formatShort(damage.burstDps)} />
        <Metric label="발당 기대" value={formatShort(damage.expected)} />
        <Metric label="몸통 치명타" value={formatShort(damage.crit)} />
      </div>

      {/* 피해 배율 막대: 길이는 각 배율의 로그 비율 */}
      <div>
        <div className="mb-1.5 flex justify-between text-xs text-gray-400">
          <span>피해 배율 (곱해지는 순서)</span>
          <span className="tabular-nums">
            기본 {formatShort(weapon.damage)} → 발당 기대 {formatShort(damage.expected)} (×{(damage.expected / Math.max(1, weapon.damage)).toFixed(2)})
          </span>
        </div>
        <div className="flex h-4 overflow-hidden rounded">
          {shown.map((s) => (
            <div key={s.label} className={s.color} style={{ flexGrow: totalLog > 0 ? Math.log(s.mult) / totalLog : 1 }} title={`${s.label} ×${s.mult.toFixed(2)}`} />
          ))}
        </div>
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs sm:grid-cols-3">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 shrink-0 rounded-sm ${s.mult > 1.0005 ? s.color : "bg-gray-200"}`} aria-hidden />
              <span className="truncate text-gray-500">{s.label}</span>
              <b className={`ml-auto tabular-nums ${s.mult > 1.0005 ? "text-gray-900" : "text-gray-400"}`}>×{s.mult.toFixed(2)}</b>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-gray-400">
          같은 버킷 안의 보너스는 더하고, 버킷끼리는 곱해요. 치명타 피해와 헤드샷 피해는 같은 버킷이라 더해요. 치명타 확률 {(chc * 100).toFixed(1)}% · 치명타 피해 {(chd * 100).toFixed(0)}% ·
          헤드샷 피해 {stats.hsd.toFixed(0)}% · RPM {Math.round(damage.rpm)} · 탄창 {damage.mag} · 재장전 {damage.reload.toFixed(2)}초
        </p>
      </div>

      <div>
        <h3 className="mb-1.5 text-xs font-semibold text-gray-400">다음 빨간 속성 1칸 효율</h3>
        <ul className="flex flex-col gap-1.5 text-sm">
          {gains.map((g, i) => (
            <li key={g.label} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-gray-700 sm:w-36">{g.label}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <span
                  className={`block h-full rounded-full ${i === 0 ? "bg-orange-500" : "bg-gray-300"}`}
                  style={{ width: `${gains[0].gain > 0 ? (g.gain / gains[0].gain) * 100 : 0}%` }}
                />
              </span>
              <b className="w-14 shrink-0 text-right tabular-nums text-gray-900">+{g.gain.toFixed(1)}%</b>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <span className="text-gray-400">전체 방어도</span>
          <b className="float-right tabular-nums text-gray-900">{formatNumber(result.totalArmor)}</b>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <span className="text-gray-400">스킬 등급</span>
          <b className="float-right tabular-nums text-gray-900">{stats.skillTier}</b>
        </div>
      </div>

      {warnings.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          {warnings.map((w) => (
            <li key={w}>⚠️ {w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const BUCKET_COLORS: Record<string, string> = {
  "무기 피해": "bg-red-500",
  "방어도 피해": "bg-sky-500",
  "체력 피해": "bg-sky-500",
  "엄폐 밖 표적 피해": "bg-blue-600",
  "증폭 피해": "bg-orange-500",
};

/** 스탯 합계. 스탯을 누르면 어느 장비에서 온 수치인지 펼쳐 보여준다 */
function StatsTab({ result }: { result: BuildResult }) {
  const { stats } = result;
  return (
    <div className="flex flex-col gap-4">
      {STAT_GROUPS.map((group) => {
        const keys = (Object.keys(STAT_INFO) as StatKey[]).filter((k) => STAT_INFO[k].group === group.id && stats[k] !== 0);
        if (keys.length === 0) return null;
        return (
          <div key={group.id}>
            <h3 className="mb-1 text-xs font-semibold text-gray-400">{group.label}</h3>
            <ul className="divide-y text-sm">
              {keys.map((k) => (
                <li key={k}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-1.5">
                      <span className="text-gray-700">
                        <span className="mr-1 inline-block text-gray-300 transition-transform group-open:rotate-90">›</span>
                        {STAT_INFO[k].label}
                      </span>
                      <b className="tabular-nums text-gray-900">
                        {formatValue(k, stats[k])}
                        {k === "chc" && stats.chc > CHC_CAP && <span className="ml-1 text-xs text-amber-600">(상한 {CHC_CAP}%)</span>}
                      </b>
                    </summary>
                    <ul className="mb-2 ml-4 flex flex-col gap-0.5 text-xs text-gray-500">
                      {result.sources[k]?.map((src, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{src.label}</span>
                          <span className="tabular-nums">+{formatValue(k, src.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** 세트 효과 진행도: 몇 피스를 꼈는지 막대로, 켜진 효과는 아래에 */
export function SetsTab({ result }: { result: BuildResult }) {
  if (result.sets.length === 0) return <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-400">브랜드 1피스부터 세트 효과가 켜져요.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {result.sets.map((set) => {
        const done = set.count >= set.max;
        return (
          <li key={`${set.kind}:${set.id}`}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-semibold text-gray-900">{set.name}</span>
              <span className={`shrink-0 text-xs font-semibold tabular-nums ${done ? "text-orange-600" : "text-gray-400"}`}>
                {Math.min(set.count, set.max)}/{set.max}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${set.kind === "set" ? "bg-emerald-500" : "bg-yellow-400"}`}
                style={{ width: `${(Math.min(set.count, set.max) / set.max) * 100}%` }}
              />
            </div>
            {set.bonuses.length === 0 ? (
              <p className="mt-1 text-[11px] text-gray-400">2피스부터 효과가 켜져요.</p>
            ) : (
              <ul className="mt-1.5 flex flex-col gap-1">
                {set.bonuses.map((b) => (
                  <li key={b.title} className="text-[11px] leading-snug text-gray-500">
                    <b className="font-semibold text-gray-700">{b.title}</b>
                    {b.conditional && <span className="ml-1 text-orange-600">조건부</span>} · {b.detail}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** A(지금 빌드)와 B(고정해 둔 빌드)의 주요 수치 비교 */
function CompareTab({ result, compare }: { result: BuildResult; compare: { build: Build; result: BuildResult } | null }) {
  if (!compare)
    return (
      <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-400">
        위쪽 빌드 바의 &quot;A/B 비교&quot;를 누르면 지금 빌드가 B로 고정돼요. 그다음 장비를 바꾸면 여기서 A(지금)와 B를 비교할 수 있어요.
      </p>
    );
  const a = result;
  const b = compare.result;
  const rows: { label: string; a: number; b: number; format: (v: number) => string }[] = [
    { label: "지속 DPS", a: a.damage.sustainedDps, b: b.damage.sustainedDps, format: formatShort },
    { label: "순간 DPS", a: a.damage.burstDps, b: b.damage.burstDps, format: formatShort },
    { label: "몸통", a: a.damage.body, b: b.damage.body, format: formatShort },
    { label: "헤드샷 치명타", a: a.damage.headshotCrit, b: b.damage.headshotCrit, format: formatShort },
    { label: "탄창 1개", a: a.damage.magDamage, b: b.damage.magDamage, format: formatShort },
    { label: "치명타 확률", a: Math.min(a.chcRaw, CHC_CAP), b: Math.min(b.chcRaw, CHC_CAP), format: (v) => `${+v.toFixed(1)}%` },
    { label: "치명타 피해", a: BASE_CHD + a.stats.chd, b: BASE_CHD + b.stats.chd, format: (v) => `${+v.toFixed(1)}%` },
    { label: "무기 피해", a: a.stats.wd, b: b.stats.wd, format: (v) => `${+v.toFixed(1)}%` },
    { label: "전체 방어도", a: a.totalArmor, b: b.totalArmor, format: formatShort },
  ];
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-gray-400">
          <th className="py-1 text-left font-medium">항목</th>
          <th className="py-1 text-right font-medium">A 지금</th>
          <th className="py-1 text-right font-medium">B 고정</th>
          <th className="py-1 text-right font-medium">A−B</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((r) => {
          const diff = r.b !== 0 ? (r.a / r.b - 1) * 100 : 0;
          return (
            <tr key={r.label}>
              <td className="py-1.5 text-gray-700">{r.label}</td>
              <td className="py-1.5 text-right tabular-nums font-semibold text-gray-900">{r.format(r.a)}</td>
              <td className="py-1.5 text-right tabular-nums text-gray-500">{r.format(r.b)}</td>
              <td
                className={`py-1.5 text-right text-xs font-semibold tabular-nums ${
                  Math.abs(diff) < 0.05 ? "text-gray-400" : diff > 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {Math.abs(diff) < 0.05 ? "—" : `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Metric({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-gray-50 px-2.5 py-2">
      <div className="text-[11px] text-gray-400">{label}</div>
      <b className={`text-base tabular-nums leading-tight ${accent ? "text-orange-600" : "text-gray-900"}`}>{value}</b>
      {hint && <span className="ml-1 text-[10px] text-gray-400">{hint}</span>}
    </div>
  );
}
