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
    <nav role="tablist" className="flex gap-1 overflow-x-auto border-b px-4">
      {JAPAN_TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
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
