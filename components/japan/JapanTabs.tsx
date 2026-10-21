"use client";

export type JapanTabId = "schedule" | "phrases" | "cautions" | "packing" | "typhoon";

export const JAPAN_TABS: { id: JapanTabId; label: string; icon: string }[] = [
  { id: "schedule", label: "일정", icon: "🗓️" },
  { id: "phrases", label: "일본어", icon: "💬" },
  { id: "cautions", label: "주의사항", icon: "⚠️" },
  { id: "packing", label: "준비물", icon: "🎒" },
  { id: "typhoon", label: "실시간 태풍", icon: "🌀" },
];

export interface JapanTabsProps {
  activeTab: JapanTabId;
  onChange: (tab: JapanTabId) => void;
}

/** /japan 페이지 상단 탭 바 */
export function JapanTabs({ activeTab, onChange }: JapanTabsProps) {
  return (
    // 모바일에서는 탭들이 화면 폭을 나눠 갖고(아이콘을 글자 위로), md 이상은 한 줄로 왼쪽 정렬
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
            className={`-mb-px flex flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap border-b-2 px-0.5 py-2 text-xs font-medium transition-colors md:flex-none md:flex-row md:gap-1.5 md:px-4 md:py-3 md:text-sm ${
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
