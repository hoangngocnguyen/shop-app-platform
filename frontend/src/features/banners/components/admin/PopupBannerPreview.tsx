import Image from "next/image";
import { AdminBanner } from "@/features/banners/types";

interface Props {
  banner: AdminBanner;
  device: "desktop" | "mobile";
}

export function PopupBannerPreview({ banner, device }: Props) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-white shadow-2xl ${
        device === "mobile" ? "max-w-[300px]" : "max-w-md"
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-lg text-white"
      >
        ×
      </span>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={banner.image_url}
          alt={banner.alt_text || banner.title}
          fill
          sizes={device === "mobile" ? "300px" : "(min-width: 448px) 448px, 100vw"}
          unoptimized
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/75">
            Ưu đãi dành cho bạn
          </p>
          <p className="line-clamp-2 text-base font-bold text-white drop-shadow sm:text-lg">
            {banner.title}
          </p>
          {banner.link_url && (
            <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-slate-900">
              Khám phá ngay
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
