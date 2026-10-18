import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 p-8">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">YGNOTE</h1>
      <Link
        href="/japan"
        className="flex h-14 items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 text-lg font-medium text-white transition-colors hover:bg-zinc-700"
      >
        고레와스폰사데스
        <span aria-hidden>♨️</span>
      </Link>
    </main>
  );
}
