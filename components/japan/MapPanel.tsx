"use client";

import { getMapEmbedUrl, getMapLocation, getMapOpenUrl } from "@/lib/japan/map";
import type { Schedule } from "@/lib/japan/types";

export interface MapPanelProps {
  selectedSchedule: Schedule | null;
}

/**
 * 선택한 일정의 위치를 구글 지도 임베드(iframe)로 보여준다. API 키가 필요 없는 방식이라
 * 마커 여러 개·경로 표시는 안 되고, 검색어 하나에 대한 지도만 보여줄 수 있다.
 */
export function MapPanel({ selectedSchedule }: MapPanelProps) {
  if (!selectedSchedule) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-100 text-center">
        <p className="text-sm text-gray-500">일정을 선택하면 지도가 표시됩니다.</p>
      </div>
    );
  }

  const location = getMapLocation(selectedSchedule);

  if (!location) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg bg-gray-100 p-4 text-center">
        <p className="text-sm text-gray-500">정확한 위치 정보가 아직 없어요.</p>
        {selectedSchedule.note && (
          <p className="text-sm text-gray-400">{selectedSchedule.note}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="font-medium text-gray-900">{selectedSchedule.title}</p>
          <p className="text-sm text-gray-600">
            {location.label}
            {location.approximate ? (
              <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">대략적인 위치</span>
            ) : null}
          </p>
        </div>
        <a
          href={getMapOpenUrl(location.query)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 self-start rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
        >
          구글 지도에서 열기 (사진·리뷰)
        </a>
      </div>
      <iframe
        key={location.query}
        title={`${selectedSchedule.title} 지도`}
        src={getMapEmbedUrl(location.query)}
        className="aspect-video w-full rounded-lg border-0 bg-gray-100"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
