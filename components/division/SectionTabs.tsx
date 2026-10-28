"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "loadout", label: "장비" },
  { id: "stats", label: "스탯" },
  { id: "dps", label: "DPS" },
] as const;

/** 인게임 상단 메뉴처럼 생긴 구역 이동 탭. 화면에 보이는 구역을 주황색으로 표시한다 */
export function SectionTabs() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // 화면 위쪽 40% 안에 들어온 구역을 현재 구역으로 본다
      { rootMargin: "-56px 0px -60% 0px" },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-[#0f1726]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl gap-1 px-4 py-2">
        {SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={() => setActive(id)}
            className={`rounded-sm px-4 py-1.5 text-sm font-semibold transition-colors ${
              active === id ? "bg-orange-500 text-white" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
