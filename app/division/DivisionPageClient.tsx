"use client";

import { useEffect, useMemo, useState } from "react";
import { BuildBar } from "@/components/division/BuildBar";
import { CatalogPanel } from "@/components/division/CatalogPanel";
import { GearEditor } from "@/components/division/GearEditor";
import { LoadoutPanel } from "@/components/division/LoadoutPanel";
import { PresetPanel } from "@/components/division/PresetPanel";
import { ResultsPanel, type ResultTab } from "@/components/division/ResultPanel";
import { WeaponEditor } from "@/components/division/WeaponEditor";
import { GEAR_SLOTS, type GearSlotId } from "@/data/division-gear";
import type { BuildPreset } from "@/data/division-presets";
import { findWeapon } from "@/data/division-weapons";
import {
  computeBuild,
  createEmptyBuild,
  equipGear,
  equipWeapon,
  findNamed,
  namedBrand,
  otherExoticGear,
  redAttributeGains,
  WEAPON_SLOTS,
  type Build,
  type WeaponSlotId,
} from "@/lib/division/build";
import {
  decodeBuild,
  encodeBuild,
  loadBuildName,
  loadCompareBuild,
  loadCurrentBuild,
  loadSavedBuilds,
  saveBuildName,
  saveCompareBuild,
  saveCurrentBuild,
  SHARE_HASH_PREFIX,
  writeSavedBuilds,
  type SavedBuild,
} from "@/lib/division/storage";

type MobileView = "loadout" | "results";

/**
 * /division 페이지. 맨 위 탭으로 시뮬레이터와 장비 목록을 오간다.
 * 시뮬레이터: 위에 빌드 바, 왼쪽 장비 패널, 오른쪽 결과(DPS·스탯·세트·비교) 탭
 */
export function DivisionPageClient() {
  const [build, setBuild] = useState<Build>(createEmptyBuild);
  const [name, setName] = useState("내 빌드");
  const [saved, setSaved] = useState<SavedBuild[]>([]);
  const [compareBuild, setCompareBuild] = useState<Build | null>(null);
  const [loaded, setLoaded] = useState(false);
  // 빌드 바의 ▲▼ 증감: 마지막 변경 직전의 지속 DPS
  const [prevDps, setPrevDps] = useState<number | null>(null);
  const [tab, setTab] = useState<ResultTab>("dps");
  const [page, setPage] = useState<"simulator" | "catalog">("simulator");
  const [mobileView, setMobileView] = useState<MobileView>("loadout");
  const [editingSlot, setEditingSlot] = useState<GearSlotId | null>(null);
  const [editingWeapon, setEditingWeapon] = useState<WeaponSlotId | null>(null);

  // 서버 렌더링 결과와 어긋나지 않도록 저장된 빌드는 마운트 뒤에 불러온다. 공유 링크(#b=)가 있으면 그걸 먼저 연다.
  useEffect(() => {
    const shared = window.location.hash.startsWith(SHARE_HASH_PREFIX)
      ? decodeBuild(window.location.hash.slice(SHARE_HASH_PREFIX.length))
      : null;
    if (shared) {
      setBuild(shared.build);
      setName(shared.name);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } else {
      const current = loadCurrentBuild();
      if (current) setBuild(current);
      setName(loadBuildName());
    }
    setSaved(loadSavedBuilds());
    setCompareBuild(loadCompareBuild());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveCurrentBuild(build);
    saveBuildName(name);
  }, [build, name, loaded]);

  const result = useMemo(() => computeBuild(build), [build]);
  const gains = useMemo(() => redAttributeGains(build), [build]);
  const compare = useMemo(
    () => (compareBuild ? { build: compareBuild, result: computeBuild(compareBuild) } : null),
    [compareBuild],
  );
  const emptySlots = GEAR_SLOTS.filter((slot) => !build.gear[slot.id]).length;
  const dps = result.damage.sustainedDps;
  const dpsDelta = prevDps && prevDps > 0 ? (dps / prevDps - 1) * 100 : null;

  /** 빌드를 바꾸면서 직전 DPS를 기억해 둔다 */
  const change = (update: (b: Build) => Build) => {
    setPrevDps(dps);
    setBuild(update);
  };
  const replace = (next: Build, nextName?: string) => {
    setPrevDps(null);
    setBuild(next);
    if (nextName !== undefined) setName(nextName);
  };

  const reset = () => {
    if (window.confirm("장비와 무기 설정을 모두 초기화할까요?")) replace(createEmptyBuild());
  };

  /** 추천 장비를 누르면 지금 빌드를 그 세팅으로 바꾸고 위로 올라가 장비 칸을 보여준다 */
  const applyPreset = (preset: BuildPreset, next: Build) => {
    const hasGear = GEAR_SLOTS.some((slot) => build.gear[slot.id]);
    if (hasGear && !window.confirm(`지금 빌드를 "${preset.name}" 세팅으로 바꿀까요? 저장하지 않은 빌드는 사라져요.`)) return;
    replace(next, preset.name);
    setMobileView("loadout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateSaved = (list: SavedBuild[]) => {
    setSaved(list);
    writeSavedBuilds(list);
  };
  const saveCurrent = () => {
    const trimmed = name.trim() || "내 빌드";
    const entry: SavedBuild = { id: crypto.randomUUID(), name: trimmed, build, savedAt: Date.now() };
    // 같은 이름은 덮어쓴다
    updateSaved([entry, ...saved.filter((item) => item.name !== trimmed)]);
  };
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}${SHARE_HASH_PREFIX}${encodeBuild(build, name)}`;
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  };
  const pinCompare = () => {
    setCompareBuild(build);
    saveCompareBuild(build);
    setTab("compare");
  };
  const clearCompare = () => {
    setCompareBuild(null);
    saveCompareBuild(null);
    if (tab === "compare") setTab("dps");
  };

  // 장비·무기를 바꿨을 때의 DPS 미리보기 (편집 창 목록의 ▲▼ 표시)
  const previewGearDps = (slot: GearSlotId) => (piece: Build["gear"][GearSlotId]) =>
    computeBuild({ ...build, gear: equipGear(build.gear, slot, piece) }).damage.sustainedDps;
  const previewWeaponDps = (slot: WeaponSlotId) => (weapon: Build["weapons"][WeaponSlotId]) =>
    computeBuild({ ...build, weapons: equipWeapon(build.weapons, slot, weapon), activeWeapon: slot }).damage.sustainedDps;

  /** 다른 칸에 낀 브랜드·기어세트 id (네임드는 그 브랜드) */
  const equippedSetIds = (except: GearSlotId) =>
    GEAR_SLOTS.flatMap(({ id }) => {
      const piece = build.gear[id];
      if (id === except || !piece) return [];
      if (piece.source === "brand" || piece.source === "set") return [piece.id];
      if (piece.source === "named") {
        const named = findNamed(piece.id);
        const brand = named && namedBrand(named);
        return brand ? [brand.id] : [];
      }
      return [];
    });
  const otherExoticWeapon = (slot: WeaponSlotId) =>
    WEAPON_SLOTS.map(({ id }) => (id === slot ? undefined : findWeapon(build.weapons[id].weaponId))).find(
      (item) => item?.kind === "exotic",
    )?.name;

  const openResults = (next: ResultTab) => {
    setTab(next);
    setMobileView("results");
  };

  return (
    <>
      {/* 맨 위 탭: 빌드 시뮬레이터 / 무기·장비 목록 */}
      <nav className="border-b border-gray-200 bg-[#0f1726]">
        <div className="mx-auto flex w-full max-w-6xl gap-1 px-4">
          {(
            [
              ["simulator", "시뮬레이터"],
              ["catalog", "장비"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={page === id}
              onClick={() => setPage(id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                page === id ? "border-orange-500 text-orange-600" : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {page === "catalog" ? (
        <CatalogPanel />
      ) : (
        <>
          <BuildBar
            name={name}
            onRename={setName}
            saved={saved}
            onSave={saveCurrent}
            onLoad={(id) => {
              const item = saved.find((s) => s.id === id);
              if (item) replace(item.build, item.name);
            }}
            onDelete={(id) => updateSaved(saved.filter((s) => s.id !== id))}
            onShare={share}
            hasCompare={compareBuild !== null}
            onPinCompare={pinCompare}
            onClearCompare={clearCompare}
            dps={dps}
            dpsDelta={dpsDelta}
            chcRaw={result.chcRaw}
          />

          <div className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-4 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <section className={mobileView === "loadout" ? "" : "hidden md:block"}>
              <LoadoutPanel
                build={build}
                result={result}
                onEditSlot={setEditingSlot}
                onEditWeapon={setEditingWeapon}
                onActivateWeapon={(slot) => change((b) => ({ ...b, activeWeapon: slot }))}
                onReset={reset}
              />
            </section>
            <section className={`flex flex-col gap-3 md:sticky md:top-16 ${mobileView === "results" ? "" : "hidden md:flex"}`}>
              <ResultsPanel
                build={build}
                result={result}
                gains={gains}
                emptySlots={emptySlots}
                compare={compare}
                tab={tab}
                onTabChange={setTab}
                onConditionsChange={(conditions) => change((b) => ({ ...b, conditions }))}
              />
              <p className="px-1 text-xs leading-relaxed text-gray-400">
                브랜드·기어세트·탤런트 수치는 공개 자료와 게임 내 값을 바탕으로 한 근사치예요. 타이틀 업데이트에 따라 실제
                값과 다를 수 있어요.
              </p>
            </section>
          </div>

          <div className="mx-auto w-full max-w-6xl px-4 pb-24 md:pb-4">
            <PresetPanel onApply={applyPreset} />
          </div>

          {/* 휴대폰: 하단 탭으로 장비 / 결과 / 세트를 오간다 */}
          <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-gray-200 bg-[#0f1726] md:hidden">
            {(
              [
                { id: "loadout", label: "장비", active: mobileView === "loadout", onClick: () => setMobileView("loadout") },
                {
                  id: "results",
                  label: "결과",
                  active: mobileView === "results" && tab !== "sets",
                  onClick: () => openResults(tab === "sets" ? "dps" : tab),
                },
                { id: "sets", label: "세트", active: mobileView === "results" && tab === "sets", onClick: () => openResults("sets") },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                aria-pressed={item.active}
                className={`py-3 text-sm font-semibold ${item.active ? "text-orange-600" : "text-gray-400"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </>
      )}

      {editingSlot && (
        <GearEditor
          slotId={editingSlot}
          piece={build.gear[editingSlot]}
          otherExotic={otherExoticGear(build.gear, editingSlot)}
          onChange={(piece) => change((b) => ({ ...b, gear: equipGear(b.gear, editingSlot, piece) }))}
          onClose={() => setEditingSlot(null)}
          previewDps={previewGearDps(editingSlot)}
          equippedSetIds={equippedSetIds(editingSlot)}
        />
      )}
      {editingWeapon && (
        <WeaponEditor
          slot={editingWeapon}
          weapon={build.weapons[editingWeapon]}
          onChange={(weapon) => change((b) => ({ ...b, weapons: equipWeapon(b.weapons, editingWeapon, weapon) }))}
          onClose={() => setEditingWeapon(null)}
          previewDps={previewWeaponDps(editingWeapon)}
          otherExotic={otherExoticWeapon(editingWeapon)}
        />
      )}
    </>
  );
}
