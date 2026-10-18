import type { TipSection } from "@/data/japan-tips";

export interface TipListTabProps {
  sections: TipSection[];
  /** true면 항목 앞에 체크박스를 붙여 준비물 체크리스트로 쓴다 */
  checkable?: boolean;
}

/** 주의사항·준비물 탭. 섹션별 항목 목록을 보여준다. */
export function TipListTab({ sections, checkable = false }: TipListTabProps) {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2">
      {sections.map((section) => (
        <div key={section.title} className="rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold">{section.title}</h3>
          <ul className={`mt-3 space-y-2 text-sm text-gray-800 ${checkable ? "" : "list-disc pl-5"}`}>
            {section.items.map((item) => (
              <li key={item}>
                {checkable ? (
                  <label className="flex cursor-pointer items-start gap-2">
                    <input type="checkbox" className="mt-0.5 size-4 shrink-0" />
                    <span>{item}</span>
                  </label>
                ) : (
                  item
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
