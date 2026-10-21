"use client";

import { useEffect, useState } from "react";

// 여행 기간(10/24 토 ~ 10/27 화) 후쿠오카 일별 예보. Open-Meteo는 API 키 없이 쓸 수 있는 무료 예보 API다.
const TRIP_START = "2026-10-24";
const TRIP_END = "2026-10-27";
const FORECAST_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=33.59&longitude=130.40" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max" +
  `&wind_speed_unit=ms&timezone=Asia%2FTokyo&start_date=${TRIP_START}&end_date=${TRIP_END}`;

interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  rainChance: number | null;
  rainSum: number | null;
  windMax: number;
  gustMax: number;
}

interface OpenMeteoDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: (number | null)[];
  precipitation_sum: (number | null)[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
}

/** WMO 날씨 코드 → 한국어 설명과 아이콘 */
function describeWeather(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "맑음", icon: "☀️" };
  if (code === 1) return { label: "대체로 맑음", icon: "🌤️" };
  if (code === 2) return { label: "구름 조금", icon: "⛅" };
  if (code === 3) return { label: "흐림", icon: "☁️" };
  if (code === 45 || code === 48) return { label: "안개", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { label: "이슬비", icon: "🌦️" };
  if (code === 61) return { label: "약한 비", icon: "🌧️" };
  if (code === 63) return { label: "비", icon: "🌧️" };
  if (code === 65) return { label: "강한 비", icon: "🌧️" };
  if (code === 66 || code === 67) return { label: "어는 비", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { label: "눈", icon: "❄️" };
  if (code === 80) return { label: "약한 소나기", icon: "🌦️" };
  if (code === 81) return { label: "소나기", icon: "🌧️" };
  if (code === 82) return { label: "강한 소나기", icon: "⛈️" };
  if (code === 85 || code === 86) return { label: "눈 소나기", icon: "🌨️" };
  if (code === 95) return { label: "뇌우", icon: "⛈️" };
  if (code === 96 || code === 99) return { label: "우박 동반 뇌우", icon: "⛈️" };
  return { label: "알 수 없음", icon: "❔" };
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-10-24" → "10/24(토)". 날짜 문자열 자체의 요일이라 보는 사람의 시간대와 무관하게 UTC로 계산한다. */
function formatDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];
  return `${month}/${day}(${weekday})`;
}

/** 풍속(m/s)을 체감 설명으로 바꾼다 */
function describeWind(gust: number): string | null {
  if (gust >= 20) return "강풍 주의 (우산 사용 어려움)";
  if (gust >= 14) return "바람 강함";
  return null;
}

/** 날씨 코드가 "약한 소나기"여도 하루 강수량이 많을 수 있어, 강수량으로 따로 경고한다 */
function describeRain(rainSum: number | null): string | null {
  if (rainSum !== null && rainSum >= 30) return "비 많음 (우산·방수 신발 챙기기)";
  return null;
}

/** 후쿠오카 여행 기간 4일 예보 카드 */
export function FukuokaForecast() {
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(FORECAST_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`status ${response.status}`);
        return response.json() as Promise<{ daily: OpenMeteoDaily }>;
      })
      .then(({ daily }) => {
        if (cancelled) return;
        setForecast(
          daily.time.map((date, i) => ({
            date,
            weatherCode: daily.weather_code[i],
            tempMax: daily.temperature_2m_max[i],
            tempMin: daily.temperature_2m_min[i],
            rainChance: daily.precipitation_probability_max[i],
            rainSum: daily.precipitation_sum[i],
            windMax: daily.wind_speed_10m_max[i],
            gustMax: daily.wind_gusts_10m_max[i],
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-2">
      <h3 className="text-lg font-semibold">후쿠오카 날씨 예보 (10/24 ~ 10/27)</h3>
      <p className="mt-1 text-xs text-gray-500">
        열 때마다 최신 예보를 불러옵니다. 날짜가 가까워질수록 정확해지니 출발 전에 다시 확인하세요.
      </p>

      {failed ? (
        <p className="mt-3 rounded-lg bg-gray-100 p-4 text-sm text-gray-500">예보를 불러오지 못했어요. 잠시 후 다시 열어 주세요.</p>
      ) : !forecast ? (
        <p className="mt-3 rounded-lg bg-gray-100 p-4 text-sm text-gray-500">예보를 불러오는 중...</p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {forecast.map((day) => {
            const weather = describeWeather(day.weatherCode);
            const windNote = describeWind(day.gustMax);
            const rainNote = describeRain(day.rainSum);
            return (
              <li key={day.date} className="rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-semibold text-gray-900">{formatDate(day.date)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-800">
                  <span className="text-2xl" aria-hidden>
                    {weather.icon}
                  </span>
                  {weather.label}
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-red-600">{Math.round(day.tempMax)}°</span>
                  <span className="text-gray-400"> / </span>
                  <span className="font-semibold text-blue-600">{Math.round(day.tempMin)}°</span>
                </p>
                <dl className="mt-2 space-y-0.5 text-xs text-gray-600">
                  <div className="flex justify-between gap-2">
                    <dt>강수확률</dt>
                    <dd>{day.rainChance ?? "-"}%</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>강수량</dt>
                    <dd>{day.rainSum ?? "-"}mm</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>최대 풍속</dt>
                    <dd>{day.windMax.toFixed(1)}m/s</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>최대 돌풍</dt>
                    <dd>{day.gustMax.toFixed(1)}m/s</dd>
                  </div>
                </dl>
                {rainNote ? <p className="mt-2 text-xs font-medium text-blue-700">☔ {rainNote}</p> : null}
                {windNote ? <p className="mt-1 text-xs font-medium text-amber-700">⚠️ {windNote}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-2 text-xs text-gray-400">출처: Open-Meteo (후쿠오카시 기준)</p>
    </section>
  );
}
