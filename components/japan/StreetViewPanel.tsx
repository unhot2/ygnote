import { getStreetViewEmbedUrl, getStreetViewOpenUrl, type StreetViewSpot } from "@/lib/japan/map";

export interface StreetViewPanelProps {
  spot: StreetViewSpot;
  title: string;
}

/** 구글 스트리트뷰(로드뷰) 임베드. 화면을 드래그하면 둘러볼 수 있다. */
export function StreetViewPanel({ spot, title }: StreetViewPanelProps) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-900">로드뷰 <span className="font-normal text-gray-500">(드래그해서 둘러보기)</span></p>
        <a
          href={getStreetViewOpenUrl(spot)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
        >
          구글 지도에서 로드뷰 열기
        </a>
      </div>
      <iframe
        key={`${spot.lat},${spot.lng}`}
        title={`${title} 로드뷰`}
        src={getStreetViewEmbedUrl(spot)}
        className="aspect-video w-full rounded-lg border-0 bg-gray-100"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
