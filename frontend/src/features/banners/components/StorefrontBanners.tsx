"use client";

import { useEffect, useState } from "react";
import { fetchPublicBanners } from "../api";
import { BannerGrid } from "./BannerGrid";
import { HeroBanner } from "./HeroBanner";
import { PopupBanner } from "./PopupBanner";
import { PublicBanner } from "../types";

interface BannerContent {
  hero: PublicBanner[];
  grid: PublicBanner[];
  popup: PublicBanner[];
}

const EMPTY_BANNERS: BannerContent = { hero: [], grid: [], popup: [] };

export function StorefrontBanners() {
  const [banners, setBanners] = useState(EMPTY_BANNERS);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    Promise.allSettled([
      fetchPublicBanners("home_hero"),
      fetchPublicBanners("home_banner_grid"),
      fetchPublicBanners("popup"),
    ]).then(([heroResult, gridResult, popupResult]) => {
      if (!isCurrentRequest) return;

      const failures = [heroResult, gridResult, popupResult].filter(
        (result) => result.status === "rejected"
      );
      if (failures.length > 0) {
        console.error("Không thể tải một số banner cửa hàng:", failures);
      }

      setBanners({
        hero: heroResult.status === "fulfilled" ? heroResult.value : [],
        grid: gridResult.status === "fulfilled" ? gridResult.value : [],
        popup: popupResult.status === "fulfilled" ? popupResult.value : [],
      });
      setLoadError(failures.length > 0);
    });

    return () => {
      isCurrentRequest = false;
    };
  }, [reloadKey]);

  return (
    <>
      {loadError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-status-warning/30 bg-status-warning-bg px-4 py-3 text-sm text-text-main"
        >
          <span>Một số nội dung banner chưa tải được.</span>
          <button
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
            className="shrink-0 font-semibold text-primary underline underline-offset-2"
          >
            Thử lại
          </button>
        </div>
      )}
      <HeroBanner banners={banners.hero} />
      <BannerGrid banners={banners.grid} />
      <PopupBanner banner={banners.popup[0]} />
    </>
  );
}
