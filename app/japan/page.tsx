import type { Metadata } from "next";
import Link from "next/link";
import { fetchJapanSchedules } from "@/lib/japan/sheet";
import { JapanPageClient } from "./JapanPageClient";

// 일정 데이터를 가져오는 원본 구글 스프레드시트 (lib/japan/sheet.ts와 같은 시트)
const SCHEDULE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1-3PO3uKzvzAvw5KdCqsLeb1fpRzZ5Jjs5kiigAbZUL4/edit?gid=0#gid=0";

export const metadata: Metadata = {
  title: "고레와스폰사데스 | YGNOTE",
};

export default async function JapanPage() {
  const schedules = await fetchJapanSchedules();

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b p-4">
        <h1 className="whitespace-nowrap text-lg font-semibold">
          고레와스폰사데스 <span aria-hidden>♨️</span>
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={SCHEDULE_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:px-4"
          >
            <span aria-hidden>📋</span>
            {/* 휴대폰에서는 제목이 한 줄에 들어가도록 버튼 글자를 줄인다 */}
            <span className="sm:hidden">시트</span>
            <span className="hidden sm:inline">스케줄 시트</span>
          </a>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:px-4"
          >
            <span aria-hidden>🏠</span>
            <span className="sm:hidden">홈</span>
            <span className="hidden sm:inline">홈으로</span>
          </Link>
        </div>
      </header>
      <JapanPageClient schedules={schedules} />
    </main>
  );
}
