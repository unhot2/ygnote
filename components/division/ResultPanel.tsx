"use client";

import { BASE_CHD, CHC_CAP, STAT_INFO, type StatKey } from "@/data/division-gear";
import type { BuildResult } from "@/lib/division/build";
import { formatNumber, Panel } from "./ui";

const STAT_GROUPS: { id: (typeof STAT_INFO)[StatKey]["group"]; label: string }[] = [
  { id: "offense", label: "공격" },
  { id: "handling", label: "무기 조작" },
  { id: "defense", label: "방어" },
  { id: "skill", label: "스킬" },
];

function formatValue(stat: StatKey, value: number) {
  const { unit } = STAT_INFO[stat];
  if (unit === "%") return `${+value.toFixed(1)}%`;
  return `${formatNumber(value)}${unit}`;
}

/** DPS 결과: 요약, 발당 피해, 피해 계산 과정, 다음 속성 효율 (스탯 합계·세트 효과는 따로 보여준다) */
export function ResultPanel({
  result,
  gains,
  emptySlots,
}: {
  result: BuildResult;
  gains: { label: string; gain: number }[];
  emptySlots: number;
}) {
  const { damage, stats } = result;
  const warnings: string[] = [];
  if (result.chcRaw > CHC_CAP)
    warnings.push(`치명타 확률 ${+result.chcRaw.toFixed(1)}% — 상한 ${CHC_CAP}%를 넘어 ${+(result.chcRaw - CHC_CAP).toFixed(1)}%가 낭비돼요.`);
  if (emptySlots > 0) warnings.push(`비어 있는 장비 칸이 ${emptySlots}개 있어요.`);

  return (
    <div className="flex flex-col gap-4">
      <Panel title="📊 요약">
        <div className="grid grid-cols-2 gap-2">
          <BigStat label="지속 DPS" hint="재장전 포함" value={formatNumber(damage.sustainedDps)} highlight />
          <BigStat label="순간 DPS" hint="탄창 비우는 동안" value={formatNumber(damage.burstDps)} />
          <BigStat label="발당 기대 피해" value={formatNumber(damage.expected)} />
          <BigStat label="탄창 1개 피해" hint={`${damage.magTime.toFixed(1)}초 소요`} value={formatNumber(damage.magDamage)} />
          <BigStat label="전체 방어도" value={formatNumber(result.totalArmor)} />
          <BigStat label="스킬 티어" value={String(stats.skillTier)} />
        </div>
        {warnings.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            {warnings.map((w) => (
              <li key={w}>⚠️ {w}</li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="💥 발당 피해">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <ShotCell label="몸통" value={damage.body} />
          <ShotCell label="몸통 치명타" value={damage.crit} />
          <ShotCell label="헤드샷" value={damage.headshot} />
          <ShotCell label="헤드샷 치명타" value={damage.headshotCrit} />
        </div>
        <p className="mt-3 text-xs text-gray-500">
          치명타 확률 <b className="text-gray-700">{Math.min(result.chcRaw, CHC_CAP).toFixed(1)}%</b> · 치명타 피해{" "}
          <b className="text-gray-700">{(BASE_CHD + stats.chd).toFixed(1)}%</b> · 헤드샷 피해{" "}
          <b className="text-gray-700">{stats.hsd.toFixed(1)}%</b> · 실제 RPM{" "}
          <b className="text-gray-700">{Math.round(damage.rpm)}</b> · 재장전 <b className="text-gray-700">{damage.reload.toFixed(2)}초</b>
        </p>
      </Panel>

      <Panel title="🧮 피해 계산 과정">
        <ol className="flex flex-col gap-2 text-sm">
          {damage.buckets.map((bucket) => (
            <li key={bucket.label} className="flex items-start justify-between gap-3">
              <span className="flex flex-col">
                <span className="text-gray-900">{bucket.label}</span>
                <span className="text-xs text-gray-400">{bucket.detail}</span>
              </span>
              <b className={`shrink-0 tabular-nums ${bucket.multiplier > 1 ? "text-orange-600" : "text-gray-400"}`}>
                ×{bucket.multiplier.toFixed(3)}
              </b>
            </li>
          ))}
        </ol>
        <p className="mt-3 border-t pt-3 text-xs text-gray-500">
          같은 버킷 안의 보너스는 더하고, 버킷끼리는 곱해요. 그 뒤에 치명타·헤드샷 배율이 곱해져요.
        </p>
      </Panel>

      <Panel title="🔺 다음 빨간 속성 1칸 효율">
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
        <p className="mt-2 text-xs text-gray-400">지금 빌드에 하나를 더했을 때 지속 DPS가 오르는 비율이에요.</p>
      </Panel>
    </div>
  );
}

/** 스탯 합계. 스탯을 누르면 어느 장비에서 온 수치인지 펼쳐 보여준다 */
export function StatTotalsPanel({ result }: { result: BuildResult }) {
  const { stats } = result;
  return (
    <Panel title="📋 스탯 합계">
        <div className="flex flex-col gap-4">
          {STAT_GROUPS.map((group) => {
            const keys = (Object.keys(STAT_INFO) as StatKey[]).filter(
              (k) => STAT_INFO[k].group === group.id && stats[k] !== 0,
            );
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
      </Panel>
  );
}

function BigStat({ label, value, hint, highlight }: { label: string; value: string; hint?: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col rounded-xl p-3 ${highlight ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-900"}`}>
      <span className={`text-xs ${highlight ? "text-white/80" : "text-gray-500"}`}>{label}</span>
      <b className="text-lg tabular-nums leading-tight">{value}</b>
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </div>
  );
}

function ShotCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
      <span className="text-gray-500">{label}</span>
      <b className="tabular-nums text-gray-900">{formatNumber(value)}</b>
    </div>
  );
}
