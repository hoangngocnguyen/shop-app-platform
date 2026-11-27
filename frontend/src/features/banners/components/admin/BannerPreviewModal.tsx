"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  LoaderCircle,
  MonitorPlay,
  Smartphone,
  X,
} from "lucide-react";
import {
  AdminBanner,
  BannerPosition,
  getBannerStatus,
  POSITION_LABELS,
} from "@/features/banners/types";
import { BannerPositionSelect } from "./BannerPositionSelect";
import { PopupBannerPreview } from "./PopupBannerPreview";

interface Props {
  banners: AdminBanner[];
  position: BannerPosition | "";
  index: number;
  device: "desktop" | "mobile";
  loading: boolean;
  error: string;
  onClose: () => void;
  onRetry: () => void;
  onIndexChange: (index: number) => void;
  onPositionChange: (position: BannerPosition | "") => void;
  onDeviceChange: (device: "desktop" | "mobile") => void;
}

export function BannerPreviewModal({
  banners,
  position,
  index,
  device,
  loading,
  error,
  onClose,
  onRetry,
  onIndexChange,
  onPositionChange,
  onDeviceChange,
}: Props) {
  const visibleBanners = position
    ? banners.filter((item) => item.position === position)
    : banners;
  const banner = visibleBanners[index];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="banner-preview-title"
        className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-surface-card shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-surface-border bg-gradient-to-r from-primary-light/80 to-white px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-brand-sm">
              <MonitorPlay className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="banner-preview-title" className="truncate font-bold text-text-main">
                Xem trước banner
              </h2>
              <p className="text-xs text-text-muted">
                {visibleBanners.length > 0
                  ? `${visibleBanners.length} banner · ${position ? POSITION_LABELS[position] : "Tất cả vị trí"}`
                  : "Xem nội dung banner trên cửa hàng"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex rounded-xl border border-surface-border bg-white p-1">
              <button
                type="button"
                onClick={() => onDeviceChange("desktop")}
                aria-label="Xem trên máy tính"
                aria-pressed={device === "desktop"}
                className={`rounded-lg p-2 transition ${device === "desktop" ? "bg-primary text-white shadow-xs" : "text-text-sub hover:bg-surface-hover"}`}
              >
                <MonitorPlay className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDeviceChange("mobile")}
                aria-label="Xem trên điện thoại"
                aria-pressed={device === "mobile"}
                className={`rounded-lg p-2 transition ${device === "mobile" ? "bg-primary text-white shadow-xs" : "text-text-sub hover:bg-surface-hover"}`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bản xem trước"
              className="rounded-xl p-2 text-text-sub transition hover:bg-surface-hover hover:text-text-main"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <BannerPositionSelect value={position} onChange={onPositionChange} />
          {loading ? (
            <div className="flex min-h-72 items-center justify-center text-sm text-text-sub">
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                Đang tải các banner...
              </span>
            </div>
          ) : error ? (
            <div
              role="alert"
              className="mx-auto my-12 max-w-md rounded-2xl border border-status-error/20 bg-status-error-bg p-5 text-center"
            >
              <p className="text-sm font-semibold text-status-error">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                Thử tải lại
              </button>
            </div>
          ) : !banner ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <ImagePlus className="h-7 w-7" />
              </div>
              <p className="font-semibold text-text-main">Chưa có banner phù hợp</p>
              <p className="mt-1 text-sm text-text-sub">
                Vị trí này chưa có banner. Chọn vị trí khác để xem nội dung.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary">
                  {POSITION_LABELS[banner.position]}
                </span>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className={`rounded-full px-2.5 py-1 font-semibold ${getBannerStatus(banner).color}`}>
                    {getBannerStatus(banner).label}
                  </span>
                  <span>{index + 1} / {visibleBanners.length}</span>
                </div>
              </div>

              <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 p-3 sm:p-5">
                {banner.position === "popup" ? (
                  <PopupBannerPreview banner={banner} device={device} />
                ) : device === "desktop" ? (
                  <div className="relative aspect-[21/8] w-full overflow-hidden rounded-xl bg-slate-800">
                    <Image
                      src={banner.image_url}
                      alt={banner.alt_text || banner.title}
                      fill
                      sizes="(min-width: 1024px) 896px, 100vw"
                      unoptimized
                      className="object-contain"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
                      <div className="min-w-0">
                        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/75">
                          Ưu đãi dành cho bạn
                        </p>
                        <p className="line-clamp-2 text-sm font-bold text-white drop-shadow sm:text-xl">
                          {banner.title}
                        </p>
                      </div>
                      {banner.link_url && (
                        <span className="shrink-0 rounded-full bg-white px-3 py-2 text-[10px] font-bold text-slate-900 sm:px-4 sm:text-xs">
                          Khám phá ngay
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[9/16] max-h-[58vh] w-full max-w-[300px] overflow-hidden rounded-[2rem] border-[6px] border-slate-700 bg-slate-800 shadow-2xl">
                    <Image
                      src={banner.image_url}
                      alt={banner.alt_text || banner.title}
                      fill
                      sizes="300px"
                      unoptimized
                      className="object-contain"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.16em] text-white/75">
                        Ưu đãi dành cho bạn
                      </p>
                      <p className="line-clamp-3 text-sm font-bold leading-tight text-white drop-shadow">
                        {banner.title}
                      </p>
                      {banner.link_url && (
                        <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1.5 text-[9px] font-bold text-slate-900">
                          Khám phá ngay
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {visibleBanners.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => onIndexChange((index - 1 + visibleBanners.length) % visibleBanners.length)}
                      aria-label="Xem banner trước"
                      className="absolute left-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition hover:bg-black/70"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onIndexChange((index + 1) % visibleBanners.length)}
                      aria-label="Xem banner tiếp theo"
                      className="absolute right-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition hover:bg-black/70"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface-bg/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-text-main">{banner.title}</h3>
                  <p className="mt-1 text-xs text-text-sub">
                    Ưu tiên {banner.priority} · Dùng cùng ảnh trên mọi thiết bị
                  </p>
                </div>
              </div>

              {visibleBanners.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {visibleBanners.map((item, itemIndex) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onIndexChange(itemIndex)}
                      aria-label={`Xem banner ${item.title}`}
                      aria-current={itemIndex === index ? "true" : undefined}
                      className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${itemIndex === index ? "border-primary ring-2 ring-primary/15" : "border-transparent opacity-70 hover:opacity-100"}`}
                    >
                      <Image
                        src={item.image_url}
                        alt=""
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
