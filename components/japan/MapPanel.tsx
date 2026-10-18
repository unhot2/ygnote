"use client";

import type { Schedule } from "@/lib/japan/types";

export interface MapPanelProps {
  selectedSchedule: Schedule | null;
}

/**
 * 지도 API 키가 아직 없어 실제 지도 SDK 연동은 범위 밖이다.
 * API 키가 생기면 이 placeholder 영역에 실제 지도를 꽂아 넣는다.
 */
export function MapPanel({ selectedSchedule }: MapPanelProps) {
  if (!selectedSchedule) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-100 text-center">
        <p className="text-sm text-gray-500">일정을 선택하면 지도가 표시됩니다.</p>
      </div>
    );
  }

  if (selectedSchedule.address) {
    return (
      <div className="w-full">
        <div className="mb-2">
          <p className="font-medium text-gray-900">{selectedSchedule.title}</p>
          <p className="text-sm text-gray-600">{selectedSchedule.address}</p>
        </div>
        <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-100 text-center">
          <p className="text-sm text-gray-500">지도 연동 예정</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg bg-gray-100 p-4 text-center">
      <p className="text-sm text-gray-500">정확한 위치 정보가 아직 없어요.</p>
      {selectedSchedule.note && (
        <p className="text-sm text-gray-400">{selectedSchedule.note}</p>
      )}
    </div>
  );
}
