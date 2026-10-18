import { getPlaceDetail } from "@/data/japan-places";
import type { Schedule, ScheduleCategory } from "@/lib/japan/types";

export interface DetailCardProps {
  schedule: Schedule;
}

const CATEGORY_LABELS: Record<ScheduleCategory, string> = {
  mart: "마트",
  food: "식당/주점",
  airport: "공항",
  transport: "교통/이동",
  lodging: "숙박",
  free: "자유시간",
};

export function DetailCard({ schedule }: DetailCardProps) {
  const detail = getPlaceDetail(schedule.title);

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold">{schedule.title}</h3>
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {CATEGORY_LABELS[schedule.category]}
        </span>
      </div>
      <dl className="mt-3 space-y-1 text-sm text-gray-700">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-gray-500">주소</dt>
          <dd>{schedule.address ?? "정보 없음"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-gray-500">영업시간</dt>
          <dd>{detail?.openingHours ?? "정보 준비 중"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-gray-500">전화번호</dt>
          <dd>{detail?.phone ?? "정보 준비 중"}</dd>
        </div>
        {schedule.note ? (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 text-gray-500">비고</dt>
            <dd>{schedule.note}</dd>
          </div>
        ) : null}
        {schedule.preparation ? (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 text-gray-500">준비 사항</dt>
            <dd>{schedule.preparation}</dd>
          </div>
        ) : null}
      </dl>

      {detail?.highlights?.length ? (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <h4 className="text-sm font-semibold text-gray-900">알아두면 좋은 정보</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            {detail.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {detail.sources?.length ? (
            <p className="mt-2 text-xs text-gray-400">
              출처:{" "}
              {detail.sources.map((source, index) => (
                <span key={source.url}>
                  {index > 0 ? ", " : null}
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {source.label}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
