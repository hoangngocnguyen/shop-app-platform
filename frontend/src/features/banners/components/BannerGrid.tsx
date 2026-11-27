import { PublicBanner } from "../types";
import { ResponsiveBannerImage } from "./ResponsiveBannerImage";

export function BannerGrid({ banners }: { banners: PublicBanner[] }) {
  if (banners.length === 0) return null;

  const isSingleBanner = banners.length === 1;

  return (
    <section aria-label="Ưu đãi nổi bật" className="mx-auto mt-5 w-full max-w-7xl sm:mt-6">
      <div className={`grid gap-3 sm:gap-4 ${isSingleBanner ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <ResponsiveBannerImage
              banner={banner}
              aspectClass={
                isSingleBanner
                  ? "aspect-[16/8] sm:aspect-[21/8]"
                  : "aspect-[16/9]"
              }
              showOverlay
            />
          </div>
        ))}
      </div>
    </section>
  );
}