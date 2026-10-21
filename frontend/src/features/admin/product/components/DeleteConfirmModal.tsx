"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { ProductResponse } from "../types";
import { formatPrice } from "../utils/formatPrice";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  product?: ProductResponse | null;
  count?: number;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  product,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-surface-card border border-surface-border w-full max-w-md rounded-3xl shadow-brand-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-status-error-bg text-status-error border border-status-error/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="p-1.5 text-text-muted hover:text-text-main rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-text-main mb-1.5">{title}</h3>
          <p className="text-xs text-text-sub leading-relaxed mb-4">{message}</p>

          {/* Product Preview if single product */}
          {product && (
            <div className="flex items-center gap-3 p-3 bg-surface-bg border border-surface-border rounded-xl mb-4">
              <div className="w-12 h-12 rounded-lg bg-surface-card border border-surface-border overflow-hidden shrink-0">
                {product.image_src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_src}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted">
                    No Img
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text-main line-clamp-1">
                  {product.product_name}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  ID: #{product.product_id} &bull; Giá:{" "}
                  <span className="text-price font-bold">
                    {formatPrice(product.price)}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Warning notice */}
          <div className="p-3 bg-status-error-bg/60 border border-status-error/20 rounded-xl mb-5">
            <p className="text-[11px] text-status-error font-medium leading-relaxed">
              Lưu ý: Dữ liệu bị xóa sẽ không thể phục hồi. Tất cả các dữ liệu liên quan
              đến sản phẩm này sẽ bị xóa khỏi hệ thống.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 text-xs font-semibold text-text-sub bg-surface-bg hover:bg-surface-hover border border-surface-border rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold bg-status-error text-white rounded-xl hover:opacity-90 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xác nhận xóa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
