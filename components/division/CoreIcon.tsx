import type { CoreId } from "@/data/division-gear";

const COLORS: Record<CoreId, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#eab308",
};

/** 아이콘 안쪽을 비워 보이게 칠하는 어두운 색 (장비 패널 바탕과 비슷한 남색) */
const HOLLOW = "#111a2b";

export const CORE_NAMES: Record<CoreId, string> = { red: "공격", blue: "방어", yellow: "스킬" };

/**
 * 인게임 공격·방어·스킬 아이콘. 공격은 톱니 고리, 방어는 방패, 스킬은 배터리 모양이다.
 * variant="core"는 핵심 속성(인게임처럼 굵은 색 테두리에 안쪽이 빈 모양),
 * "attr"는 일반 속성(가는 테두리 + 가운데 점)이다.
 */
export function CoreIcon({
  kind,
  variant = "core",
  className = "h-4 w-4",
}: {
  kind: CoreId;
  variant?: "core" | "attr";
  className?: string;
}) {
  const color = COLORS[kind];
  const isCore = variant === "core";

  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden>
      {kind === "red" && (
        <>
          {/* 8개 톱니가 달린 고리 */}
          <path
            d="M10.6 1.8h2.8l.5 2.4 1.7.7 2-1.4 2 2-1.4 2 .7 1.7 2.4.5v2.8l-2.4.5-.7 1.7 1.4 2-2 2-2-1.4-1.7.7-.5 2.4h-2.8l-.5-2.4-1.7-.7-2 1.4-2-2 1.4-2-.7-1.7-2.4-.5v-2.8l2.4-.5.7-1.7-1.4-2 2-2 2 1.4 1.7-.7z"
            fill={isCore ? color : "none"}
            stroke={color}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r={isCore ? 5.2 : 2.6} fill={isCore ? HOLLOW : color} />
        </>
      )}
      {kind === "blue" && (
        <>
          <path
            d="M12 2.2 20 5v6.3c0 4.9-3.3 8.7-8 10.5-4.7-1.8-8-5.6-8-10.5V5z"
            fill={isCore ? color : "none"}
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          {isCore ? (
            <path d="M12 5.6 16.8 7.3v4.2c0 3.1-2 5.6-4.8 6.8-2.8-1.2-4.8-3.7-4.8-6.8V7.3z" fill={HOLLOW} />
          ) : (
            <circle cx="12" cy="11.5" r="2.6" fill={color} />
          )}
        </>
      )}
      {kind === "yellow" && (
        <>
          <rect x="9" y="1.8" width="6" height="2.6" rx="0.6" fill={color} />
          <rect
            x="5.2"
            y="4.4"
            width="13.6"
            height="17.6"
            rx="1.6"
            fill={isCore ? HOLLOW : "none"}
            stroke={color}
            strokeWidth={isCore ? 3 : 1.8}
          />
          {!isCore && <circle cx="12" cy="13.2" r="2.6" fill={color} />}
        </>
      )}
    </svg>
  );
}
