"use client";

import Image from "next/image";
import {
  AdminBanner,
  getBannerStatus,
  POSITION_LABELS,
} from "@/features/banners/types";

interface Props {
  banner: AdminBanner;
  loading: boolean;
  onEdit: (banner: AdminBanner) => void;
  onToggle: (banner: AdminBanner) => void;
  onDelete: (banner: AdminBanner) => void;
}

export function AdminBannerRow({
  banner,
  loading,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
  const status = getBannerStatus(banner);

  return (
    <tr className="transition-colors hover:bg-surface-bg/70">
      <td className="px-5 py-3">
        <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-surface-border bg-surface-bg">
          <Image
            src={banner.image_url}
            alt={banner.alt_text || banner.title}
            fill
            sizes="96px"
            unoptimized
            className="object-cover"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-semibold text-text-main">{banner.title}</p>
        <p className="mt-1 text-xs text-text-muted">
          {POSITION_LABELS[banner.position]}
        </p>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex min-w-9 justify-center rounded-lg bg-accent-light px-2 py-1 text-xs font-bold text-accent-hover">
          {banner.priority}
        </span>
      </td>
      <td className="px-4 py-3 text-xs leading-5 text-text-sub">
        <div>
          Bắt đầu:{" "}
          {banner.start_time
            ? new Date(banner.start_time).toLocaleString("vi-VN")
            : "Ngay lập tức"}
        </div>
        <div>
          Kết thúc:{" "}
          {banner.end_time
            ? new Date(banner.end_time).toLocaleString("vi-VN")
            : "Không giới hạn"}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}>
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          role="switch"
          aria-checked={banner.is_active}
          aria-label={`${banner.is_active ? "Tắt" : "Bật"} banner ${banner.title}`}
          disabled={loading}
          onClick={() => onToggle(banner)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 ${
            banner.is_active ? "bg-primary" : "bg-surface-active"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              banner.is_active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </td>
      <td className="space-x-2 whitespace-nowrap px-5 py-3 text-right">
        <button
          type="button"
          onClick={() => onEdit(banner)}
          className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-text-sub transition hover:border-primary/30 hover:bg-primary-light hover:text-primary"
        >
          Sửa
        </button>
        <button
          type="button"
          onClick={() => onDelete(banner)}
          className="rounded-lg border border-status-error/20 px-3 py-1.5 text-xs font-semibold text-status-error transition hover:bg-status-error-bg"
        >
          Xóa
        </button>
      </td>
    </tr>
  );
}
