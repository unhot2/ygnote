import type { PlacePhoto } from "@/lib/japan/types";

export interface PlacePhotoCardProps {
  photo: PlacePhoto;
}

/** 장소 사진 + 라이선스 표기(작가, 라이선스, 출처 링크) */
export function PlacePhotoCard({ photo }: PlacePhotoCardProps) {
  return (
    <figure className="overflow-hidden rounded-lg border border-gray-200">
      {/* 외부(Wikimedia) 이미지가 섞여 있어 next/image 최적화 설정 없이 그대로 쓴다 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={photo.src}
        src={photo.src}
        alt={photo.caption}
        loading="lazy"
        className={`aspect-video w-full bg-gray-100 ${photo.fit === "contain" ? "object-contain" : "object-cover"}`}
      />
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-3 py-2">
        <span className="text-sm text-gray-800">{photo.caption}</span>
        <a
          href={photo.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
        >
          사진: {photo.author} / {photo.license} ({photo.sourceName ?? "Wikimedia Commons"})
        </a>
      </figcaption>
    </figure>
  );
}
