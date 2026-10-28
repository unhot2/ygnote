"use client";

import { useState } from "react";
import { BRAND_IMAGES, GEAR_SET_IMAGES, wikiImage } from "@/data/division-gear";
import { findNamed, namedBrand, type GearPiece } from "@/lib/division/build";

/**
 * 브랜드 로고 / 기어세트 엠블럼 정사각형 타일.
 * 네임드는 소속 브랜드 로고를 금색 테두리로 보여준다.
 * 위키 이미지라 못 불러오면(또는 로고가 없는 브랜드면) 이름 앞글자로 대신 보여준다.
 */
export function GearLogo({
  source,
  id,
  name,
  className = "h-10 w-10",
}: {
  source: GearPiece["source"];
  id: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const named = source === "named" ? findNamed(id) : undefined;
  const brandId = named ? namedBrand(named)?.id : id;
  const path =
    source === "set" ? GEAR_SET_IMAGES[id]?.banner : brandId ? BRAND_IMAGES[brandId]?.logo : undefined;
  // 로고가 없는 네임드는 장비 이름 대신 브랜드 이름 앞글자를 보여준다
  const fallback = (named?.brand ?? name).slice(0, 2);

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg ${
        source === "set" ? "bg-black" : "bg-[#0b111d]"
      } ${named ? "ring-2 ring-amber-400" : ""} ${className}`}
    >
      {path && !failed ? (
        // 외부(팬덤 위키) 이미지라 next/image 최적화 설정 없이 그대로 쓴다
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={wikiImage(path, source === "set" ? 260 : 120)}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          // 기어세트 배너는 왼쪽 엠블럼만 남기고 자른다
          className={source === "set" ? "h-full w-full object-cover object-left" : "h-[80%] w-[80%] object-contain"}
        />
      ) : (
        <span className="text-xs font-bold text-white">{fallback}</span>
      )}
    </span>
  );
}
