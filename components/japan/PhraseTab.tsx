import { JAPAN_PHRASE_SETS } from "@/data/japan-phrases";

/** 일본어 탭. 카테고리별 표현 세트를 전부 보여준다. */
export function PhraseTab() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2">
      {JAPAN_PHRASE_SETS.map((phraseSet) => (
        <div key={phraseSet.category} className="rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold">{phraseSet.label}</h3>
          <ul className="mt-3 space-y-3 text-sm">
            {phraseSet.phrases.map((phrase) => (
              <li key={phrase.ko} className="flex flex-col">
                <span className="text-gray-900">{phrase.ko}</span>
                <span className="text-base text-gray-900">{phrase.ja}</span>
                {phrase.reading ? <span className="text-gray-500">{phrase.reading}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
