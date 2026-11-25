"use client";

import {
  CheckCircle2,
  Image as ImageIcon,
  LayoutGrid,
  Plus,
} from "lucide-react";
import { POSITION_LABELS } from "@/features/banners/types";

interface Props {
  total: number;
  running: number;
  disabled: number;
  onCreate: () => void;
  onPreview: () => void;
}

const STAT_CARDS = [
  {
    key: "total",
    label: "Tổng số banner",
    note: "Theo bộ lọc hiện tại",
    icon: ImageIcon,
    iconStyle: "bg-primary-light text-primary",
  },
  {
    key: "running",
    label: "Đang chạy",
    note: "Trong trang hiện tại",
    icon: CheckCircle2,
    iconStyle: "bg-status-success-bg text-status-success",
  },
  {
    key: "disabled",
    label: "Đã tắt",
    note: "Trong trang hiện tại",
    icon: LayoutGrid,
    iconStyle: "bg-status-error-bg text-status-error",
  },
  {
    key: "positions",
    label: "Vị trí quảng bá",
    note: "Vị trí có thể chọn",
    icon: LayoutGrid,
    iconStyle: "bg-accent-light text-accent-hover",
  },
] as const;

export function AdminBannerHeader({
  total,
  running,
  disabled,
  onCreate,
  onPreview,
}: Props) {
  const values = { total, running, disabled, positions: Object.keys(POSITION_LABELS).length };

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface-card px-4 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary-light text-primary">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-text-main">Quản lý Banner</h1>
            <p className="mt-0.5 text-xs text-text-muted">
              Quản lý nội dung quảng bá và vị trí hiển thị trên cửa hàng
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="h-10 rounded-xl border border-surface-border bg-white px-4 text-sm font-semibold text-text-sub transition hover:border-primary/30 hover:bg-primary-light hover:text-primary"
          >
            Xem trước nội dung
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            <Plus className="h-4 w-4" />
            Thêm Banner
          </button>
        </div>
      </header>

      <section
        aria-label="Thống kê banner"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className="flex items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface-card p-4 shadow-xs transition duration-200 hover:border-primary/25 hover:shadow-brand-sm sm:p-5"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-sub sm:text-xs">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold leading-none text-text-main">
                  {values[stat.key]}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">{stat.note}</p>
              </div>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stat.iconStyle}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
