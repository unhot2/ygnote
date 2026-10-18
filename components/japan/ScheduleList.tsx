"use client";

import { groupSchedulesByDate } from "@/lib/japan/sheet";
import type { Schedule, ScheduleCategory } from "@/lib/japan/types";

export interface ScheduleListProps {
  schedules: Schedule[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const CATEGORY_ICON: Record<ScheduleCategory, string> = {
  transport: "🚌",
  food: "🍜",
  mart: "🛒",
  lodging: "🛏️",
  free: "🧭",
};

const CATEGORY_LABEL: Record<ScheduleCategory, string> = {
  transport: "교통/이동",
  food: "식당/주점",
  mart: "마트",
  lodging: "숙박",
  free: "자유시간",
};

/**
 * 좌측 일정 목록. 날짜별로 그룹핑해 세로 타임라인 형태로 보여준다.
 * 레이아웃·표시 항목 출처: docs/japan-page-design-draft.md 2장, 4.1장
 */
export function ScheduleList({ schedules, selectedId, onSelect }: ScheduleListProps) {
  const groups = groupSchedulesByDate(schedules);

  return (
    <div className="flex flex-col gap-6 p-4">
      {groups.map((group) => (
        <div key={group.date}>
          <h2 className="mb-2 px-1 text-sm font-semibold text-gray-500">{group.date}</h2>

          <ul className="flex flex-col">
            {group.items.map((schedule, index) => {
              const isSelected = schedule.id === selectedId;
              const isLast = index === group.items.length - 1;

              return (
                <li key={schedule.id} className={`relative pl-6 ${isLast ? "" : "pb-3"}`}>
                  {!isLast ? (
                    <span className="absolute left-[7px] top-4 bottom-0 w-px bg-gray-200" />
                  ) : null}
                  <span
                    className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 ${
                      isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => onSelect(schedule.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-sm">
                      <span title={CATEGORY_LABEL[schedule.category]} aria-hidden="true">
                        {CATEGORY_ICON[schedule.category]}
                      </span>
                      {schedule.time ? (
                        <span className="text-gray-500">{schedule.time}</span>
                      ) : null}
                      <span className="font-medium text-gray-900">{schedule.title}</span>
                      {schedule.address ? (
                        <span title="위치 정보 있음" aria-hidden="true">
                          📍
                        </span>
                      ) : null}
                    </div>

                    {schedule.note ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{schedule.note}</p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
