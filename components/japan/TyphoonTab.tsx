// 사용자가 준 earth.nullschool.net 주소. 일본·한반도 쪽을 중심으로 지표면 바람을 보여주는 화면이다.
const EARTH_URL = "https://earth.nullschool.net/ko/#current/wind/surface/level/orthographic=-235.68,18.22,1992";

/** 실시간 태풍 탭. earth.nullschool.net의 실시간 바람 지도를 그대로 보여준다. */
export function TyphoonTab() {
  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          지표면 바람의 실시간 흐름입니다. 소용돌이처럼 바람이 도는 곳이 태풍이에요. 화면을 드래그하면 지구본을 돌려 볼 수 있습니다.
        </p>
        <a
          href={EARTH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 self-start rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
        >
          새 창에서 크게 보기
        </a>
      </div>
      <iframe
        title="실시간 태풍 (earth.nullschool.net)"
        src={EARTH_URL}
        className="h-[70vh] min-h-[420px] w-full rounded-lg border-0 bg-black"
        loading="lazy"
      />
      <p className="text-xs text-gray-400">출처: earth.nullschool.net</p>
    </div>
  );
}
