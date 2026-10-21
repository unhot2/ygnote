"use client";

import { useState } from "react";

// 사용자가 준 earth.nullschool.net 주소(PC 기준). 넓은 화면에서 일본·한반도 남쪽 바다를 중심으로 보여준다.
const EARTH_URL = "https://earth.nullschool.net/ko/#current/wind/surface/level/orthographic=-235.68,18.22,1992";
// 휴대폰은 세로로 좁아 PC 확대값이면 너무 크게 보여서, 중심을 북쪽으로 옮기고 축소해 한반도·일본·태풍이 함께 보이게 한다.
const EARTH_URL_MOBILE = "https://earth.nullschool.net/ko/#current/wind/surface/level/orthographic=-232.00,26.00,650";

/** 실시간 태풍 탭. earth.nullschool.net의 실시간 바람 지도를 그대로 보여준다. */
export function TyphoonTab() {
  // 이 탭은 사용자가 탭을 눌러야 그려지므로(서버 렌더링 없음) 처음 그릴 때 화면 폭을 바로 확인할 수 있다.
  const [url] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? EARTH_URL_MOBILE : EARTH_URL,
  );

  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          지표면 바람의 실시간 흐름입니다. 소용돌이처럼 바람이 도는 곳이 태풍이에요. 화면을 드래그하면 지구본을 돌려 볼 수 있습니다.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 self-start rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
        >
          새 창에서 크게 보기
        </a>
      </div>
      <iframe
        title="실시간 태풍 (earth.nullschool.net)"
        src={url}
        className="h-[70vh] min-h-[420px] w-full rounded-lg border-0 bg-black"
        loading="lazy"
      />
      <p className="text-xs text-gray-400">출처: earth.nullschool.net</p>
    </div>
  );
}
