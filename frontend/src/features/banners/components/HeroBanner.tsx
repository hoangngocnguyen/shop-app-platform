"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { PublicBanner } from "../types";
import { ResponsiveBannerImage } from "./ResponsiveBannerImage";

export function HeroBanner({ banners }: { banners: PublicBanner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  // Chỉ có 1 banner thì không dựng slider
  if (banners.length === 1) {
    return (
      <section className="relative isolate">
        <div className="pointer-events-none absolute -inset-x-5 -inset-y-4 -z-10 rounded-[2rem] bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-2xl sm:-inset-x-8" />
        <div className="mb-3 flex items-center justify-between gap-3 px-1 sm:mb-4">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                HoangShop chọn lọc
              </p>
              <h2 className="text-lg font-extrabold tracking-tight text-text-main sm:text-xl">
                Ưu đãi nổi bật
              </h2>
            </div>
          </div>
        </div>
        <div className="rounded-[1.35rem] bg-gradient-to-br from-primary via-primary/70 to-accent/70 p-[2px] shadow-[0_20px_55px_-28px_rgba(15,118,110,0.65)]">
          <div className="overflow-hidden rounded-[calc(1.35rem-2px)] bg-white p-1">
            <div className="overflow-hidden rounded-[calc(1.35rem-6px)]">
              <ResponsiveBannerImage
                banner={banners[0]}
                priority
                aspectClass="aspect-[16/8] sm:aspect-[21/8]"
                imageClassName="transition-transform duration-700 hover:scale-[1.02]"
                showOverlay
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="relative isolate">
      <div className="pointer-events-none absolute -inset-x-5 -inset-y-4 -z-10 rounded-[2rem] bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-2xl sm:-inset-x-8" />
      <div className="mb-3 flex items-center justify-between gap-3 px-1 sm:mb-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              HoangShop chọn lọc
            </p>
            <h2 className="text-lg font-extrabold tracking-tight text-text-main sm:text-xl">
              Ưu đãi nổi bật
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-surface-border bg-white/90 px-3 py-1.5 text-xs font-semibold tabular-nums text-text-sub shadow-xs">
            {String(index + 1).padStart(2, "0")}
            <span className="mx-1.5 text-text-muted">/</span>
            {String(banners.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="rounded-[1.35rem] bg-gradient-to-br from-primary via-primary/70 to-accent/70 p-[2px] shadow-[0_20px_55px_-28px_rgba(15,118,110,0.65)]">
        <div className="overflow-hidden rounded-[calc(1.35rem-2px)] bg-white p-1">
          <div className="group relative overflow-hidden rounded-[calc(1.35rem-6px)] bg-slate-100">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {banners.map((banner, idx) => (
                <div key={banner.id} className="w-full flex-shrink-0">
                  <ResponsiveBannerImage
                    banner={banner}
                    priority={idx === 0}
                    aspectClass="aspect-[16/8] sm:aspect-[21/8]"
                    imageClassName="transition-transform duration-700 group-hover:scale-[1.015]"
                    showOverlay
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Banner trước"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-text-main shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 sm:left-5"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Banner tiếp theo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-text-main shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 sm:right-5"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 sm:pb-4">
              <div className="flex items-center gap-1.5 rounded-full border border-white/25 bg-slate-950/40 px-2.5 py-1.5 shadow-lg backdrop-blur-md">
                {banners.map((banner, idx) => (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => setIndex(idx)}
                    aria-label={`Đi đến banner ${idx + 1}`}
                    aria-current={idx === index ? "true" : undefined}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === index
                        ? "w-7 bg-white"
                        : "w-2 bg-white/55 hover:bg-white/90"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}