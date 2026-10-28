import type { Metadata } from "next";
import Link from "next/link";
import { DivisionPageClient } from "./DivisionPageClient";

export const metadata: Metadata = {
  title: "디비전 시뮬레이터 | YGNOTE",
};

export default function DivisionPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between gap-4 border-b bg-white p-4">
        <h1 className="whitespace-nowrap text-lg font-semibold">
          디비전 시뮬레이터 <span aria-hidden>🟧</span>
        </h1>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:px-4"
        >
          <span aria-hidden>🏠</span>
          <span className="sm:hidden">홈</span>
          <span className="hidden sm:inline">홈으로</span>
        </Link>
      </header>
      <DivisionPageClient />
    </main>
  );
}
