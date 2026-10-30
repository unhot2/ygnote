"use client";

import { useRef, useState } from "react";
import { CHC_CAP } from "@/data/division-gear";
import type { SavedBuild } from "@/lib/division/storage";
import { formatShort } from "./ui";

/**
 * 화면 맨 위에 붙는 빌드 바.
 * 빌드 이름·저장 목록·공유 링크·A/B 비교와, 지속 DPS(직전 변경 대비 증감)·치명타 확률 상한을 한 곳에 모은다.
 */
export function BuildBar({
  name,
  onRename,
  saved,
  onSave,
  onLoad,
  onDelete,
  onShare,
  hasCompare,
  onPinCompare,
  onClearCompare,
  dps,
  dpsDelta,
  chcRaw,
}: {
  name: string;
  onRename: (name: string) => void;
  saved: SavedBuild[];
  onSave: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: () => Promise<boolean>;
  hasCompare: boolean;
  onPinCompare: () => void;
  onClearCompare: () => void;
  dps: number;
  /** 직전 변경 대비 지속 DPS 증감(%) */
  dpsDelta: number | null;
  chcRaw: number;
}) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const chc = Math.min(chcRaw, CHC_CAP);

  const flash = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), 1800);
  };
  const closeMenu = () => menuRef.current?.removeAttribute("open");

  return (
    <div className="sticky top-0 z-30 border-b border-gray-200 bg-[#0f1726]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-4 py-2">
        <input
          value={name}
          onChange={(e) => onRename(e.target.value)}
          aria-label="빌드 이름"
          className="h-8 w-32 rounded-md border border-gray-200 bg-gray-50 px-2 text-sm font-semibold text-gray-900 focus:border-orange-500 focus:outline-none sm:w-44"
        />
        {/* 저장해 둔 빌드 목록 */}
        <details ref={menuRef} className="relative">
          <summary className="flex h-8 cursor-pointer list-none items-center rounded-md border border-gray-200 px-2.5 text-xs font-medium text-gray-700 hover:border-orange-400">
            저장 목록 {saved.length > 0 && <span className="ml-1 text-gray-400">{saved.length}</span>} ▾
          </summary>
          <div className="absolute left-0 top-9 z-40 w-64 rounded-lg border border-gray-200 bg-[#111a2b] p-1.5 shadow-xl">
            {saved.length === 0 ? (
              <p className="p-2 text-xs text-gray-400">아직 저장한 빌드가 없어요.</p>
            ) : (
              <ul className="flex max-h-72 flex-col overflow-y-auto">
                {saved.map((item) => (
                  <li key={item.id} className="flex items-center gap-1 rounded-md hover:bg-gray-50">
                    <button
                      type="button"
                      onClick={() => {
                        onLoad(item.id);
                        closeMenu();
                      }}
                      className="min-w-0 flex-1 truncate px-2 py-1.5 text-left text-sm text-gray-900"
                    >
                      {item.name}
                      <span className="ml-1 text-[10px] text-gray-400">{new Date(item.savedAt).toLocaleDateString("ko-KR")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      aria-label={`${item.name} 삭제`}
                      className="px-2 py-1 text-xs text-gray-400 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
        <BarButton
          onClick={() => {
            onSave();
            flash("저장했어요");
          }}
        >
          저장
        </BarButton>
        <BarButton onClick={async () => flash((await onShare()) ? "링크를 복사했어요" : "복사하지 못했어요")}>공유 링크</BarButton>
        <BarButton active={hasCompare} onClick={hasCompare ? onClearCompare : onPinCompare}>
          {hasCompare ? "B 해제" : "A/B 비교"}
        </BarButton>
        {notice && <span className="text-xs text-orange-600">{notice}</span>}

        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-gray-400">지속 DPS</div>
            <div className="flex items-baseline justify-end gap-1.5">
              <b className="text-lg tabular-nums leading-none text-gray-900">{formatShort(dps)}</b>
              {dpsDelta !== null && Math.abs(dpsDelta) >= 0.05 && (
                <span className={`text-[11px] font-semibold ${dpsDelta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {dpsDelta > 0 ? "▲" : "▼"} {Math.abs(dpsDelta).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="w-20 sm:w-24">
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>치확</span>
              <span className={`tabular-nums ${chcRaw > CHC_CAP ? "text-amber-700" : ""}`}>
                {+chcRaw.toFixed(1)}/{CHC_CAP}%
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${(chc / CHC_CAP) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarButton({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded-md border px-2.5 text-xs font-medium transition-colors ${
        active ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 text-gray-700 hover:border-orange-400"
      }`}
    >
      {children}
    </button>
  );
}
