import Link from "next/link";
import { fetchJapanSchedules } from "@/lib/japan/sheet";
import { JapanPageClient } from "./JapanPageClient";

export default async function JapanPage() {
  const schedules = await fetchJapanSchedules();

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b p-4">
        <h1 className="text-lg font-semibold">후쿠오카·구로카와 여행</h1>
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          <span aria-hidden>🏠</span>
          홈으로
        </Link>
      </header>
      <JapanPageClient schedules={schedules} />
    </main>
  );
}
