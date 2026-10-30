"use client";

import { useState } from "react";
import { BRAND_IMAGES, EXTRA_BRAND_BANNERS, GEAR_SET_IMAGES, wikiImage } from "@/data/division-gear";
import { findNamed, namedBrand, type GearPiece } from "@/lib/division/build";

/**
 * 기어세트 배너(260×76 비율)에서 원형 엠블럼의 테두리 안쪽(중심 39.5,37 · 반지름 24)만 상자에 꽉 차게 맞추는 위치.
 * 위키 배너는 모두 같은 틀이라 한 값으로 맞는다.
 */
const EMBLEM_RADIUS = 24;
const EMBLEM_CROP = {
  width: `${(260 / (EMBLEM_RADIUS * 2)) * 100}%`,
  left: `${(-(39.5 - EMBLEM_RADIUS) / (EMBLEM_RADIUS * 2)) * 100}%`,
  top: `${(-(37 - EMBLEM_RADIUS) / (EMBLEM_RADIUS * 2)) * 100}%`,
} as const;

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
  bare = false,
}: {
  source: GearPiece["source"];
  id: string;
  name: string;
  className?: string;
  /** 인게임 타일처럼 배경 없이 반투명하게 (기어세트 배너의 검은 바탕은 screen 합성으로 지운다) */
  bare?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const named = source === "named" ? findNamed(id) : undefined;
  const brandId = named ? namedBrand(named)?.id : id;
  const path =
    source === "set" ? GEAR_SET_IMAGES[id]?.banner : brandId ? BRAND_IMAGES[brandId]?.logo : undefined;
  // 배너에서 원형 엠블럼만 잘라 쓰는 이미지: 기어세트, 그리고 BRANDS에 없는 브랜드의 네임드
  const banner = source === "set" ? path : named && !brandId ? EXTRA_BRAND_BANNERS[named.brand] : undefined;
  // 로고가 없는 네임드는 장비 이름 대신 브랜드 이름 앞글자를 보여준다
  const fallback = (named?.brand ?? name).slice(0, 2);

  // 기어세트: 배너 왼쪽 원형 엠블럼에서 초록 테두리 안쪽 문양만 잘라 보여준다.
  // 장비 타일(bare)은 흰색으로 바꾸고, 브랜드 로고(위키 로고는 둘레에 여백이 있다)와 크기·밝기가 맞도록 상자의 80%만 쓰고 같은 투명도를 준다.
  // 선택 창·장비 목록은 검은 바탕에 초록 문양 그대로 보여준다 (브랜드 배너는 원래 흰 문양)
  if (banner && !failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center ${
          bare ? "opacity-70 mix-blend-screen" : "overflow-hidden rounded-lg bg-black"
        } ${named && !bare ? "ring-2 ring-amber-400" : ""} ${className}`}
      >
        <span className="relative h-[80%] w-[80%] overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={wikiImage(banner, 520)}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="absolute max-w-none"
            // 흑백으로 먼저 바꾼 뒤 밝혀야 초록 문양이 브랜드 로고처럼 순백이 된다 (Tailwind 필터는 밝기를 먼저 적용한다)
            style={bare ? { ...EMBLEM_CROP, filter: "grayscale(1) brightness(2.2)" } : EMBLEM_CROP}
          />
        </span>
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg ${
        bare ? "opacity-70 mix-blend-screen" : "bg-[#0b111d]"
      } ${named && !bare ? "ring-2 ring-amber-400" : ""} ${className}`}
    >
      {path && !failed ? (
        // 외부(팬덤 위키) 이미지라 next/image 최적화 설정 없이 그대로 쓴다
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={wikiImage(path, 120)}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className={bare ? "h-full w-full object-contain" : "h-[80%] w-[80%] object-contain"}
        />
      ) : (
        <span className="text-xs font-bold text-white">{fallback}</span>
      )}
    </span>
  );
}
