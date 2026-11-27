"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  LoaderCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  AdminBanner,
  POSITION_LABELS,
} from "@/features/banners/types";
import { AdminBannerRow } from "./AdminBannerRow";

interface Props {
  banners: AdminBanner[];
  total: number;
  firstItem: number;
  lastItem: number;
  page: number;
  totalPages: number;
  position: string;
  isActive: string;
  loading: boolean;
  error: string;
  onPositionChange: (value: string) => void;
  onActiveChange: (value: string) => void;
  onRefresh: () => void;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onEdit: (banner: AdminBanner) => void;
  onToggle: (banner: AdminBanner) => void;
  onDelete: (banner: AdminBanner) => void;
}

const filterClassName =
  "h-10 w-full rounded-xl border border-surface-border bg-white px-3 text-sm text-text-main outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 sm:w-auto sm:min-w-44";

export function AdminBannerList({
  banners,
  total,
  firstItem,
  lastItem,
  page,
  totalPages,
  position,
  isActive,
  loading,
  error,
  onPositionChange,
  onActiveChange,
  onRefresh,
  onRetry,
  onPageChange,
  onCreate,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-xs">
      <div className="flex flex-col gap-3 border-b border-surface-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="font-semibold text-text-main">Danh sách banner</h2>
          <p className="mt-1 text-xs text-text-muted">
            {total === 0
              ? "Chưa có banner nào được tạo."
              : `Đang hiển thị ${firstItem}–${lastItem} trong ${total} banner`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <select
            aria-label="Lọc theo vị trí"
            value={position}
            onChange={(event) => onPositionChange(event.target.value)}
            className={filterClassName}
          >
            <option value="">Tất cả vị trí</option>
            {Object.entries(POSITION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="Lọc theo trạng thái"
            value={isActive}
            onChange={(event) => onActiveChange(event.target.value)}
            className={filterClassName}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang bật</option>
            <option value="false">Đã tắt</option>
          </select>
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Tải lại danh sách banner"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-surface-border px-3 text-sm font-medium text-text-sub transition hover:border-primary/30 hover:bg-primary-light hover:text-primary"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sm:hidden">Tải lại</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="m-4 flex flex-col gap-3 rounded-xl border border-status-error/20 bg-status-error-bg p-4 text-sm text-status-error sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </span>
          <button
            type="button"
            onClick={onRetry}
            className="font-semibold underline underline-offset-2"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-surface-bg text-[11px] uppercase tracking-wider text-text-muted">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold">Ảnh</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Tiêu đề & vị trí</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Ưu tiên</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Thời gian</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Trạng thái</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">Hiển thị</th>
              <th scope="col" className="px-5 py-3.5 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="h-48 text-center text-text-muted">
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                    Đang tải danh sách...
                  </span>
                </td>
              </tr>
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                      <ImagePlus className="h-7 w-7" />
                    </div>
                    <p className="font-semibold text-text-main">
                      {error ? "Chưa thể hiển thị danh sách" : "Chưa có banner nào"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-text-sub">
                      {error
                        ? "Kiểm tra kết nối hoặc quyền truy cập rồi thử tải lại."
                        : "Thêm banner đầu tiên để bắt đầu hiển thị nội dung quảng bá trên cửa hàng."}
                    </p>
                    {!error && (
                      <button
                        type="button"
                        onClick={onCreate}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast transition hover:bg-primary-hover"
                      >
                        <Plus className="h-4 w-4" />
                        Tạo banner đầu tiên
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <AdminBannerRow
                  key={banner.id}
                  banner={banner}
                  loading={loading}
                  onEdit={onEdit}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-surface-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-text-muted">
            Hiển thị {firstItem}–{lastItem} trên {total} banner
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-surface-border px-3 text-sm font-medium text-text-sub transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </button>
            <span className="min-w-24 text-center text-sm font-medium text-text-main">
              Trang {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-surface-border px-3 text-sm font-medium text-text-sub transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
