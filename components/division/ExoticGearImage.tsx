"use client";

import { useState } from "react";
import type { GearSlotId } from "@/data/division-gear";
import { exoticGearImage } from "@/data/division-exotic-gear";
import { GearSlotIcon } from "./GearSlotIcon";

/**
 * 특급 보호장구 이미지 (나무위키). 홍보 이미지라 정사각형으로 가운데를 잘라 쓴다.
 * 이미지가 없거나 못 불러오면 빨간 부위 실루엣으로 대신한다.
 */
export function ExoticGearImage({ id, slot, className = "h-12 w-12" }: { id: string; slot: GearSlotId; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = exoticGearImage(id);

  if (!src || failedSrc === src) return <GearSlotIcon slot={slot} className={`shrink-0 text-red-400/70 ${className}`} />;
  return (
    // 외부(나무위키) 이미지라 next/image 최적화 설정 없이 그대로 쓴다
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={`shrink-0 rounded-lg object-cover ring-1 ring-red-500/60 ${className}`}
    />
  );
}
