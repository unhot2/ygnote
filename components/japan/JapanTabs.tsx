"use client";

export type JapanTabId = "schedule" | "phrases" | "cautions" | "packing";

export const JAPAN_TABS: { id: JapanTabId; label: string; icon: string }[] = [
  { id: "schedule", label: "일정", icon: "🗓️" },
  { id: "phrases", label: "일본어", icon: "💬" },
  { id: "cautions", label: "주의사항", icon: "⚠️" },
  { id: "packing", label: "준비물", icon: "🎒" },
];

export interface JapanTabsProps {
  activeTab: JapanTabId;
  onChange: (tab: JapanTabId) => void;
}

/** /japan 페이지 상단 탭 바 */
export function JapanTabs({ activeTab, onChange }: JapanTabsProps) {
  return (
    // 모바일에서는 탭 4개가 화면 폭을 나눠 가져 잘리지 않게 하고, md 이상은 왼쪽 정렬
    <nav role="tablist" className="sticky top-0 z-10 flex border-b bg-white md:gap-1 md:px-4">
      {/* sticky: 긴 일정 목록을 내려도 탭이 위에 붙어 있다 */}
      {JAPAN_TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`-mb-px flex flex-1 items-center justify-center gap-1 border-b-2 px-1 py-3 text-sm font-medium transition-colors md:flex-none md:gap-1.5 md:px-4 ${
              isActive
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <span aria-hidden>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
