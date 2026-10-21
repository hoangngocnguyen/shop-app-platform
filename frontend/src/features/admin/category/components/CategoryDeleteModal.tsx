"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { ModalShell } from "./ModalShell";

export interface CategoryDeleteModalProps {
  /** Mô tả đối tượng xóa, ví dụ: danh mục “Điện thoại” */
  label: string;
  isSubmitting: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

/** Modal xác nhận xóa (dùng cho cả xóa một và xóa hàng loạt) */
export function CategoryDeleteModal({
  label,
  isSubmitting,
  onConfirm,
  onClose,
}: CategoryDeleteModalProps) {
  return (
    <ModalShell title="Xóa danh mục" onClose={onClose} size="sm">
      <div className="group/alert flex gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-status-error-bg text-status-error shadow-xs transition-all duration-300 group-hover/alert:scale-110 group-hover/alert:shadow-md">
          <AlertTriangle className="size-6 transition-transform duration-300 group-hover/alert:rotate-12" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-text-sub">
          Bạn sắp xóa <strong className="font-semibold text-text-main">{label}</strong>. Hành động này không thể hoàn tác. Nếu có danh mục còn sản phẩm hoặc danh mục con, hệ thống sẽ từ chối và không xóa gì cả.
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-2">
        {/* NÚT HỦY VỚI BOTTOM GLOW & HOVER LIFT */}
        <div className="group/cancelbtn relative inline-block">
          <div className="absolute -bottom-1 left-1 right-1 h-2.5 bg-primary/30 rounded-full blur-xs opacity-0 group-hover/cancelbtn:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative transition-all duration-300 group-hover/cancelbtn:-translate-y-0.5">
            <button
              type="button"
              onClick={onClose}
              className="relative inline-flex items-center justify-center rounded-xl border border-surface-border px-4 py-2.5 text-sm font-medium text-text-main transition-all duration-200 hover:bg-surface-hover hover:shadow-xs active:translate-y-0 cursor-pointer"
            >
              <span className="relative z-10">Hủy</span>
            </button>
          </div>
        </div>
        
        {/* NÚT XÓA VỚI BOTTOM GLOW & HOVER LIFT CHUẨN XÁC */}
        <div className="group/delbtn relative inline-block">
          {/* Ánh sáng đèn đỏ dưới đáy */}
          <div className="absolute -bottom-1 left-1 right-1 h-3 bg-red-500/40 rounded-full blur-md opacity-0 group-hover/delbtn:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative transition-all duration-300 group-hover/delbtn:-translate-y-0.5">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="relative inline-flex items-center justify-center rounded-xl bg-status-error px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:opacity-95 hover:shadow-md active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
            >
              <span className="relative z-10">{isSubmitting ? "Đang xóa..." : "Xóa"}</span>
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export default CategoryDeleteModal;