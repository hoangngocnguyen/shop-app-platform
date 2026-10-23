"use client";

import React from "react";
import {
  X,
  Edit3,
  ShoppingBag,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { CategoryResponse, ProductResponse } from "../types";
import { formatPrice } from "../utils/formatPrice";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductResponse | null;
  categories: CategoryResponse[];
  onEdit: (product: ProductResponse) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  onEdit,
}) => {
  if (!isOpen || !product) return null;

  const categoryName =
    categories.find((c) => c.category_id === product.category_id)
      ?.category_name || "Chưa phân loại";

  const isOutOfStock = product.quantity === 0;
  const isLowStock = product.quantity > 0 && product.quantity <= 5;
  const hasDiscount =
    product.sale_price !== null &&
    product.sale_price !== undefined &&
    product.sale_price > 0 &&
    product.sale_price < product.price;

  const discountPercent =
    product.discount_percent ??
    (hasDiscount
      ? Math.round(
          ((product.price - (product.sale_price || 0)) / product.price) * 100
        )
      : null);

  const savedAmount = hasDiscount ? product.price - (product.sale_price || 0) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-surface-card border border-surface-border w-full max-w-2xl rounded-3xl shadow-brand-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-surface-border bg-surface-bg/70 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-surface-card border border-surface-border text-text-sub">
              #{product.product_id}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-light text-primary border border-primary/20">
              {categoryName}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-main rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Image Preview */}
            <div className="w-full sm:w-48 aspect-square rounded-2xl bg-surface-bg border border-surface-border overflow-hidden shrink-0 relative">
              {product.image_src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_src}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-text-muted gap-2">
                  <ShoppingBag className="w-10 h-10 opacity-30" />
                  <span className="text-xs">Chưa có ảnh</span>
                </div>
              )}

              {discountPercent && discountPercent > 0 && (
                <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 bg-status-success text-white rounded-lg shadow-sm">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Title & Core Price */}
            <div className="flex-1 space-y-3">
              <h2 className="text-lg font-bold text-text-main leading-snug">
                {product.product_name}
              </h2>

              {/* Price card */}
              <div className="bg-surface-bg/70 border border-surface-border rounded-xl p-3.5 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-price">
                    {formatPrice(hasDiscount ? product.sale_price : product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-text-muted line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {hasDiscount && (
                  <p className="text-xs font-semibold text-price">
                    Tiết kiệm {formatPrice(savedAmount)} ({discountPercent}% giảm)
                  </p>
                )}
              </div>

              {/* Stock Status Pill */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${
                    isOutOfStock
                      ? "bg-status-error-bg text-status-error border-status-error/20"
                      : isLowStock
                      ? "bg-status-warning-bg text-status-warning border-status-warning/20"
                      : "bg-status-success-bg text-status-success border-status-success/20"
                  }`}
                >
                  {isOutOfStock ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : isLowStock ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  {isOutOfStock
                    ? "Hết hàng"
                    : isLowStock
                    ? `Sắp hết hàng (${product.quantity})`
                    : `Còn hàng (${product.quantity})`}
                </span>

                {product.sold !== undefined && (
                  <span className="text-xs text-text-sub font-medium">
                    Đã bán: <strong>{product.sold}</strong>
                  </span>
                )}

                {product.rating !== null && product.rating !== undefined && (
                  <span className="flex items-center gap-1 text-xs text-accent font-semibold ml-auto">
                    <Star className="w-3.5 h-3.5 fill-accent" />
                    {Number(product.rating).toFixed(1)} / 5.0
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-surface-bg border border-surface-border rounded-xl p-3">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Thương hiệu
              </span>
              <span className="text-xs font-bold text-text-main mt-0.5 block">
                {product.brand || "—"}
              </span>
            </div>

            <div className="bg-surface-bg border border-surface-border rounded-xl p-3">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Xuất xứ
              </span>
              <span className="text-xs font-bold text-text-main mt-0.5 block">
                {product.origin || "—"}
              </span>
            </div>

            <div className="bg-surface-bg border border-surface-border rounded-xl p-3">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Số lượng tồn
              </span>
              <span className="text-xs font-bold text-text-main mt-0.5 block">
                {product.quantity} sản phẩm
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-1.5 pt-2 border-t border-surface-border/60">
              <h4 className="text-xs font-bold text-text-sub uppercase tracking-wider">
                Mô tả chi tiết
              </h4>
              <div className="overflow-x-auto bg-surface-bg/40 p-4 rounded-xl border border-surface-border/60">
                <div className="space-y-3 break-words text-xs sm:text-sm leading-relaxed text-text-sub [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-surface-bg [&_code]:px-1 [&_code]:py-0.5 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-surface-bg [&_pre]:p-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-surface-border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-surface-border [&_th]:bg-surface-bg [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_ul]:list-disc">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {product.description}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-border bg-surface-bg/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-text-sub hover:text-text-main bg-surface-card border border-surface-border rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-primary text-primary-contrast rounded-xl hover:bg-primary-hover shadow-brand-sm transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Chỉnh sửa sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
};
