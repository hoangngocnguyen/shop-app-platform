"use client";

import React from "react";
import { CheckCircle2, Trash2 } from "lucide-react";

export interface UserBulkActionBarProps {
  selectedCount: number;
  isSubmitting?: boolean;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
}

export function UserBulkActionBar({
  selectedCount,
  isSubmitting = false,
  onClearSelection,
  onDeleteSelected,
}: UserBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Thao tác hàng loạt người dùng"
      className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary-light px-5 py-3.5 text-sm shadow-brand-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-brand-md animate-in fade-in zoom-in-95"
    >
      <span className="font-bold text-primary flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>
          Đã chọn <span className="underline decoration-2">{selectedCount}</span> tài khoản
        </span>
      </span>

      <div className="flex items-center gap-2.5">
        {/* Nút Bỏ chọn */}
        <button
          type="button"
          onClick={onClearSelection}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-text-sub transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-card hover:text-text-main hover:shadow-xs cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Bỏ chọn
        </button>

        {/* Nút Xóa mục đã chọn */}
        <div className="group/delbtn relative inline-block">
          <div className="pointer-events-none absolute -bottom-1 left-1 right-1 h-3 rounded-full bg-red-500/40 blur-md opacity-0 transition-opacity duration-300 group-hover/delbtn:opacity-100" />
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={isSubmitting}
            className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-status-error px-4 py-2 font-semibold text-white shadow-brand-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-brand-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-error/40"
          >
            <Trash2 className="size-4 transition-transform duration-200 group-hover/delbtn:scale-110" aria-hidden="true" />
            <span>{isSubmitting ? "Đang xử lý..." : "Xóa tài khoản đã chọn"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserBulkActionBar;