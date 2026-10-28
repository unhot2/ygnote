import type { GearSlotId } from "@/data/division-gear";

/**
 * 장비 부위 실루엣. 위키에 브랜드·부위별 장비 이미지가 없어 인게임 타일의 장비 그림 자리를 대신한다.
 * 선 색은 currentColor를 따른다.
 */
export function GearSlotIcon({ slot, className = "h-12 w-12" }: { slot: GearSlotId; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {slot === "mask" && (
        <>
          {/* 방독면: 얼굴판, 눈, 양쪽 필터 */}
          <path d="M14 10c3-3 17-3 20 0 3 3 4 12 1 20-2 6-7 10-11 10s-9-4-11-10c-3-8-2-17 1-20z" />
          <path d="M17 19h5M26 19h5" />
          <circle cx="12" cy="33" r="5" />
          <circle cx="36" cy="33" r="5" />
          <path d="M20 31h8v5h-8z" />
        </>
      )}
      {slot === "chest" && (
        <>
          {/* 방탄조끼 */}
          <path d="M16 6h4c1 3 7 3 8 0h4l6 6-3 4v24a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V16l-3-4z" />
          <path d="M16 22h16M16 29h16M24 22v13" />
        </>
      )}
      {slot === "backpack" && (
        <>
          {/* 배낭: 손잡이, 본체, 앞주머니 */}
          <path d="M19 9a5 5 0 0 1 10 0" />
          <rect x="11" y="9" width="26" height="33" rx="5" />
          <rect x="16" y="26" width="16" height="11" rx="2" />
          <path d="M16 18h16" />
        </>
      )}
      {slot === "gloves" && (
        <>
          {/* 전술 장갑 */}
          <path d="M15 42V24l-4-6a2.5 2.5 0 0 1 4-3l3 4V9a2.5 2.5 0 0 1 5 0v10V7a2.5 2.5 0 0 1 5 0v12V9a2.5 2.5 0 0 1 5 0v11-6a2.5 2.5 0 0 1 5 0v14c0 8-4 14-11 14z" />
          <path d="M15 36h18" />
        </>
      )}
      {slot === "holster" && (
        <>
          {/* 허벅지 권총집과 벨트 */}
          <path d="M8 10h32" />
          <path d="M17 10v6h14v-6" />
          <path d="M17 16l-2 22a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3l1-22" />
          <path d="M14 26h20M14 33h19" />
        </>
      )}
      {slot === "kneepads" && (
        <>
          {/* 무릎보호대 한 쌍 */}
          <path d="M7 14c0-4 3-6 7-6s7 2 7 6v18c0 5-3 8-7 8s-7-3-7-8z" />
          <path d="M27 14c0-4 3-6 7-6s7 2 7 6v18c0 5-3 8-7 8s-7-3-7-8z" />
          <ellipse cx="14" cy="21" rx="4" ry="5" />
          <ellipse cx="34" cy="21" rx="4" ry="5" />
        </>
      )}
    </svg>
  );
}
