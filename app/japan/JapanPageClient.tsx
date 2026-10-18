"use client";

import { useMemo, useState } from "react";
import { DetailCard } from "@/components/japan/DetailCard";
import { JapanTabs, type JapanTabId } from "@/components/japan/JapanTabs";
import { MapPanel } from "@/components/japan/MapPanel";
import { PhraseCard } from "@/components/japan/PhraseCard";
import { PhraseTab } from "@/components/japan/PhraseTab";
import { ScheduleList } from "@/components/japan/ScheduleList";
import { TipListTab } from "@/components/japan/TipListTab";
import { JAPAN_CAUTIONS, JAPAN_PACKING_LIST } from "@/data/japan-tips";
import { DETAIL_CARD_CATEGORIES, type Schedule } from "@/lib/japan/types";

export interface JapanPageClientProps {
  schedules: Schedule[];
}

/**
 * /japan 페이지의 탭·선택 상태를 관리하고, 일정 탭에서는 좌/우 레이아웃을 조합한다.
 * 레이아웃·상태 분기 출처: docs/japan-page-design-draft.md 2장, 3장
 */
export function JapanPageClient({ schedules }: JapanPageClientProps) {
  const [activeTab, setActiveTab] = useState<JapanTabId>("schedule");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSchedule = useMemo(
    () => schedules.find((schedule) => schedule.id === selectedId) ?? null,
    [schedules, selectedId],
  );

  const showDetailCard =
    selectedSchedule !== null && DETAIL_CARD_CATEGORIES.includes(selectedSchedule.category);

  return (
    <>
      <JapanTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "schedule" ? (
        <div className="flex flex-1 flex-col md:flex-row">
          <section className="w-full overflow-y-auto border-b md:w-[35%] md:border-b-0 md:border-r">
            <ScheduleList schedules={schedules} selectedId={selectedId} onSelect={setSelectedId} />
          </section>

          <section className="flex w-full flex-col gap-4 overflow-y-auto p-4 md:w-[65%]">
            <MapPanel selectedSchedule={selectedSchedule} />
            {showDetailCard && selectedSchedule ? <DetailCard schedule={selectedSchedule} /> : null}
            <PhraseCard category={selectedSchedule?.category ?? null} />
          </section>
        </div>
      ) : null}

      {activeTab === "phrases" ? <PhraseTab /> : null}
      {activeTab === "cautions" ? <TipListTab sections={JAPAN_CAUTIONS} /> : null}
      {activeTab === "packing" ? <TipListTab sections={JAPAN_PACKING_LIST} checkable /> : null}
    </>
  );
}
