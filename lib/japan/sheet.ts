import Papa from "papaparse";
import { categorizeSchedule } from "./categorize";
import type { Schedule } from "./types";

const SHEET_ID = "1-3PO3uKzvzAvw5KdCqsLeb1fpRzZ5Jjs5kiigAbZUL4";
const GID = "0";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

// 시트 헤더 순서: 날짜, 시간, 일정, 주소, 비고, 준비 사항
interface SheetRow {
  날짜: string;
  시간: string;
  일정: string;
  주소: string;
  비고: string;
  "준비 사항": string;
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * 구글 스프레드시트를 CSV로 내려받아 Schedule 목록으로 변환한다.
 * 일정명이 비어있는 행(시트의 빈 구분 행)은 제외한다.
 */
export async function fetchJapanSchedules(): Promise<Schedule[]> {
  const response = await fetch(CSV_URL, {
    // 여행 일정은 자주 바뀌지 않으므로 1시간 캐시 후 재검증한다.
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`구글 스프레드시트를 불러오지 못했습니다 (status: ${response.status})`);
  }

  const csvText = await response.text();
  const { data } = Papa.parse<SheetRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const schedules = data
    .filter((row) => emptyToNull(row["일정"]) !== null)
    .map((row, index) => {
      const title = row["일정"].trim();
      const note = emptyToNull(row["비고"]);

      return {
        id: `${index}-${title}`,
        date: row["날짜"]?.trim() ?? "",
        time: emptyToNull(row["시간"]),
        title,
        address: emptyToNull(row["주소"]),
        note,
        preparation: emptyToNull(row["준비 사항"]),
        category: categorizeSchedule(title, note),
        coordinates: null,
      } satisfies Schedule;
    });

  return mergeDepartureArrivalPairs(schedules);
}

/** 두 값 중 비어있지 않은 것을 쓰고, 둘 다 있으면서 다르면 " / "로 잇는다. */
function joinDistinct(a: string | null, b: string | null): string | null {
  if (a && b && a !== b) {
    return `${a} / ${b}`;
  }
  return a ?? b;
}

/**
 * 시트에 "인천 → 후쿠오카 출발" 다음 행이 "인천 → 후쿠오카 도착"처럼 같은 구간의 출발·도착이
 * 연달아 있으면 "인천 → 후쿠오카 이동" 하나로 합친다. 시간은 "출발 ~ 도착"으로 표시한다.
 * 시트 원본은 그대로 두고 화면에서만 합친다.
 */
function mergeDepartureArrivalPairs(schedules: Schedule[]): Schedule[] {
  const merged: Schedule[] = [];

  for (let i = 0; i < schedules.length; i += 1) {
    const current = schedules[i];
    const next = schedules[i + 1];
    const route = current.title.match(/^(.+→.+?)\s*출발$/)?.[1];

    if (route && next && next.date === current.date && next.title === `${route} 도착`) {
      const title = `${route} 이동`;
      const note = joinDistinct(current.note, next.note);
      const time =
        current.time && next.time ? `${current.time} ~ ${next.time}` : (current.time ?? next.time);

      merged.push({
        ...current,
        title,
        time,
        note,
        address: current.address ?? next.address,
        preparation: joinDistinct(current.preparation, next.preparation),
        category: categorizeSchedule(title, note),
      });
      i += 1;
      continue;
    }

    merged.push(current);
  }

  return merged;
}

/** 날짜별로 그룹핑한다. 시트에 나온 순서를 그대로 유지한다. */
export function groupSchedulesByDate(schedules: Schedule[]): Array<{ date: string; items: Schedule[] }> {
  const groups: Array<{ date: string; items: Schedule[] }> = [];

  for (const schedule of schedules) {
    const lastGroup = groups.at(-1);
    if (lastGroup && lastGroup.date === schedule.date) {
      lastGroup.items.push(schedule);
    } else {
      groups.push({ date: schedule.date, items: [schedule] });
    }
  }

  return groups;
}
