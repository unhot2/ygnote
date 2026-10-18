import { getPhraseSetByCategory } from "@/data/japan-phrases";
import type { ScheduleCategory } from "@/lib/japan/types";

export interface PhraseCardProps {
  category: ScheduleCategory | null;
}

export function PhraseCard({ category }: PhraseCardProps) {
  const phraseSet = getPhraseSetByCategory(category ?? "common");

  if (!phraseSet) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold">{phraseSet.label}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {phraseSet.phrases.map((phrase) => (
          <li key={phrase.ko} className="flex flex-col">
            <span className="text-gray-900">{phrase.ko}</span>
            <span className="text-gray-700">
              {phrase.ja}
              {phrase.reading ? ` (${phrase.reading})` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
