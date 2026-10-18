"use client";

import { useState } from "react";
import { JAPAN_PHRASE_SETS } from "@/data/japan-phrases";
import type { CategoryPhraseSet, JapanesePhrase } from "@/lib/japan/types";

/**
 * 일본어 탭. 왼쪽 사이드 메뉴에서 상황(공통 표현, 공항 등)을 고르면
 * 오른쪽에 그 상황의 표현과 기초 단어를 2열로 보여준다.
 */
export function PhraseTab() {
  const [activeCategory, setActiveCategory] = useState<CategoryPhraseSet["category"]>(
    JAPAN_PHRASE_SETS[0].category,
  );
  const activeSet = JAPAN_PHRASE_SETS.find((set) => set.category === activeCategory) ?? JAPAN_PHRASE_SETS[0];

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <nav className="flex gap-1 overflow-x-auto border-b p-2 md:w-52 md:shrink-0 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:p-3">
        {JAPAN_PHRASE_SETS.map((set) => {
          const isActive = set.category === activeSet.category;
          return (
            <button
              key={set.category}
              type="button"
              onClick={() => setActiveCategory(set.category)}
              aria-current={isActive ? "true" : undefined}
              className={`shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {set.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <section>
          <h3 className="text-lg font-semibold">{activeSet.label}</h3>
          <PhraseGrid phrases={activeSet.phrases} />
        </section>

        {activeSet.wordGroups?.length ? (
          <section>
            <h3 className="text-lg font-semibold">기초 단어</h3>
            <div className="mt-3 space-y-5">
              {activeSet.wordGroups.map((group) => (
                <div key={group.title}>
                  <h4 className="text-sm font-semibold text-gray-500">{group.title}</h4>
                  <PhraseGrid phrases={group.words} />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function PhraseGrid({ phrases }: { phrases: JapanesePhrase[] }) {
  return (
    <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
      {phrases.map((phrase) => (
        <li key={phrase.ko} className="flex flex-col rounded-md border border-gray-200 px-3 py-2">
          <span className="text-gray-900">{phrase.ko}</span>
          <span className="text-base text-gray-900">{phrase.ja}</span>
          {phrase.reading ? <span className="text-gray-500">{phrase.reading}</span> : null}
        </li>
      ))}
    </ul>
  );
}
