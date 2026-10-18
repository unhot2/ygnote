"use client";

import { useMemo, useState } from "react";
import { DetailCard } from "@/components/japan/DetailCard";
import { JapanTabs, type JapanTabId } from "@/components/japan/JapanTabs";
import { MapPanel } from "@/components/japan/MapPanel";
import { PhraseCard } from "@/components/japan/PhraseCard";
import { PhraseTab } from "@/components/japan/PhraseTab";
import { PlacePhotoCard } from "@/components/japan/PlacePhotoCard";
import { ScheduleList } from "@/components/japan/ScheduleList";
import { StreetViewPanel } from "@/components/japan/StreetViewPanel";
import { TipListTab } from "@/components/japan/TipListTab";
import { getPlaceDetail, getSchedulePhotos } from "@/data/japan-places";
import { JAPAN_CAUTIONS, JAPAN_PACKING_LIST } from "@/data/japan-tips";
import { getStreetViewSpot } from "@/lib/japan/map";
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

  const selectedPhotos = selectedSchedule ? getSchedulePhotos(selectedSchedule.title) : [];
  const selectedStreetView = selectedSchedule ? getStreetViewSpot(selectedSchedule.title) : null;

  // 상세정보 카드는 마트·식당 일정, 또는 따로 조사한 가게 정보가 있는 일정(예: 자유시간의 저스트미트)에 보여준다.
  const showDetailCard =
    selectedSchedule !== null &&
    (DETAIL_CARD_CATEGORIES.includes(selectedSchedule.category) || getPlaceDetail(selectedSchedule.title) !== null);

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
            {selectedStreetView && selectedSchedule ? (
              <StreetViewPanel spot={selectedStreetView} title={selectedSchedule.title} />
            ) : null}
            {selectedPhotos.length > 0 ? (
              <div className={`grid gap-4 ${selectedPhotos.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {selectedPhotos.map((photo) => (
                  <PlacePhotoCard key={photo.src} photo={photo} />
                ))}
              </div>
            ) : null}
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
