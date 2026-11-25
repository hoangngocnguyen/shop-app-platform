"use client";

import { useEffect, useState } from "react";
import { PublicBanner } from "../types";
import { ResponsiveBannerImage } from "./ResponsiveBannerImage";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function PopupBanner({ banner }: { banner?: PublicBanner }) {
  const [open, setOpen] = useState(false);

  const closePopup = () => {
    if (banner) {
      localStorage.setItem(
        `popup_seen_${banner.id}`,
        String(Date.now() + ONE_DAY_MS)
      );
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!banner) return;
    const expireTime = localStorage.getItem(`popup_seen_${banner.id}`);
    if (expireTime && Date.now() < Number(expireTime)) return;

    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, [banner]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!banner || !open) return null;

  return (
    <div
      onClick={closePopup}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <button
          type="button"
          onClick={closePopup}
          aria-label="Đóng"
          className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-black/60 text-white"
        >
          ✕
        </button>
        <div onClick={closePopup}>
          <ResponsiveBannerImage
            banner={banner}
            priority
            aspectClass="aspect-[4/3]"
            showOverlay
          />
        </div>
      </div>
    </div>
  );
}