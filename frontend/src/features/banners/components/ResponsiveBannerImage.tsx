import Link from "next/link";
import { getImageProps } from "next/image";
import { PublicBanner } from "../types";

interface Props {
  banner: PublicBanner;
  priority?: boolean;
  aspectClass?: string;
  imageClassName?: string;
  showOverlay?: boolean;
}

export function ResponsiveBannerImage({
  banner,
  priority = false,
  aspectClass = "aspect-[16/9] md:aspect-[21/7]",
  imageClassName = "",
  showOverlay = false,
}: Props) {
  const alt = banner.alt_text || "Banner";
  const { props: desktopImageProps } = getImageProps({
    src: banner.image_url,
    alt,
    width: 1920,
    height: 640,
    sizes: "100vw",
    priority,
    unoptimized: true,
  });

  const picture = (
    <picture className={`block w-full overflow-hidden bg-gray-100 ${aspectClass}`}>
      <img
        {...desktopImageProps}
        alt={alt}
        className={`h-full w-full object-cover ${imageClassName}`}
      />
    </picture>
  );

  const imageBox = showOverlay ? (
    <div className="relative isolate overflow-hidden">
      {picture}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:gap-6 sm:p-7 md:p-9">
        <div className="min-w-0 max-w-2xl">
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/75 sm:text-[10px]">
            Ưu đãi dành cho bạn
          </p>
          <h2 className="line-clamp-2 text-base font-extrabold leading-tight text-white drop-shadow-lg sm:text-2xl md:text-3xl">
            {banner.title}
          </h2>
        </div>
        {banner.link_url && (
          <span className="inline-flex shrink-0 items-center rounded-full border border-white/30 bg-white px-3 py-2 text-[10px] font-bold text-slate-900 shadow-lg transition hover:bg-primary hover:text-white sm:px-5 sm:py-3 sm:text-xs">
            Khám phá ngay
          </span>
        )}
      </div>
    </div>
  ) : picture;

  if (!banner.link_url) {
    return imageBox;
  }

  if (banner.link_url.startsWith("/")) {
    return (
      <Link href={banner.link_url} className="block w-full">
        {imageBox}
      </Link>
    );
  }

  return (
    <a
      href={banner.link_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full"
    >
      {imageBox}
    </a>
  );
}