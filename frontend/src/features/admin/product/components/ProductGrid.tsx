"use client";

import React from "react";
import {
  Edit3,
  Trash2,
  Eye,
  PackageOpen,
  ShoppingBag,
  Star,
  Plus,
  RotateCcw,
} from "lucide-react";
import { CategoryResponse, ProductResponse } from "../types";
import { formatPrice } from "../utils/formatPrice";

interface ProductGridProps {
  products: ProductResponse[];
  isLoading: boolean;
  selectedIds: number[];
  categories?: CategoryResponse[];
  onToggleSelectOne: (id: number) => void;
  onViewDetail: (product: ProductResponse) => void;
  onEdit: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
  onOpenAddModal?: () => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  selectedIds,
  categories = [],
  onToggleSelectOne,
  onViewDetail,
  onEdit,
  onDelete,
  onOpenAddModal,
  onResetFilters,
  hasActiveFilters = false,
}) => {
  const getCategoryName = (catId?: number | null) => {
    if (!catId) return "Chưa phân loại";
    const found = categories.find((c) => c.category_id === catId);
    return found ? found.category_name : `Danh mục #${catId}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={`grid-skeleton-${idx}`}
            className="bg-surface-card border border-surface-border rounded-2xl p-4 animate-pulse space-y-3"
          >
            <div className="aspect-square bg-surface-border rounded-xl" />
            <div className="h-4 bg-surface-border rounded w-3/4" />
            <div className="h-4 bg-surface-border rounded w-1/2" />
            <div className="h-8 bg-surface-border rounded-xl mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-2xl p-12 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-surface-bg flex items-center justify-center text-text-muted mb-4 border border-surface-border">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-text-main">
            Không tìm thấy sản phẩm nào
          </h4>
          <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
            {hasActiveFilters
              ? "Không có sản phẩm nào khớp với bộ lọc hiện tại. Thử xóa hoặc điều chỉnh bộ lọc tìm kiếm."
              : "Chưa có sản phẩm nào trong kho hàng. Hãy thêm sản phẩm đầu tiên để bắt đầu."}
          </p>
          <div className="flex items-center gap-2 mt-4">
            {hasActiveFilters && onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-surface-bg border border-surface-border text-text-main rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Xóa bộ lọc
              </button>
            )}
            {onOpenAddModal && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary text-primary-contrast rounded-xl hover:bg-primary-hover shadow-brand-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm sản phẩm mới
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const isSelected = selectedIds.includes(product.product_id);
        const isOutOfStock = product.quantity === 0;
        const isLowStock = product.quantity > 0 && product.quantity <= 5;
        const numPrice = Number(product.price) || 0;
        const numSalePrice =
          product.sale_price !== null && product.sale_price !== undefined
            ? Number(product.sale_price)
            : null;

        const hasDiscount =
          numSalePrice !== null &&
          numSalePrice > 0 &&
          numSalePrice < numPrice;

        const discountPercent =
          product.discount_percent ??
          (hasDiscount
            ? Math.round(((numPrice - numSalePrice) / numPrice) * 100)
            : null);

        return (
          <div
            key={product.product_id}
            className={`group relative bg-surface-card border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col ${
              isSelected
                ? "border-primary ring-2 ring-primary/20 shadow-brand-sm"
                : "border-surface-border hover:border-primary/40 hover:shadow-brand-sm hover:-translate-y-0.5"
            }`}
          >
            {/* Top Bar inside card: Checkbox & Category */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelectOne(product.product_id)}
                className="w-4 h-4 rounded border-surface-border text-primary focus:ring-ring-brand/30 cursor-pointer accent-primary bg-surface-card/90 backdrop-blur-xs"
              />
              {discountPercent && discountPercent > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 bg-status-success text-white rounded-lg shadow-sm">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnail Image */}
            <div className="relative aspect-4/3 w-full bg-surface-bg border-b border-surface-border overflow-hidden">
              {product.image_src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_src}
                  alt={product.product_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-text-muted">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
              )}

              {/* Stock Status Badge positioned at bottom of image */}
              <div className="absolute bottom-2.5 left-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full backdrop-blur-md shadow-xs ${
                    isOutOfStock
                      ? "bg-status-error/90 text-white"
                      : isLowStock
                      ? "bg-status-warning/95 text-white"
                      : "bg-surface-card/90 text-status-success border border-status-success/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOutOfStock || isLowStock ? "bg-white" : "bg-status-success"
                    }`}
                  />
                  {isOutOfStock
                    ? "Hết hàng"
                    : isLowStock
                    ? `Sắp hết: ${product.quantity}`
                    : `Kho: ${product.quantity}`}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                  <span>{getCategoryName(product.category_id)}</span>
                  <span className="font-mono">#{product.product_id}</span>
                </div>

                <h4
                  onClick={() => onViewDetail(product)}
                  className="font-semibold text-sm text-text-main line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                  title={product.product_name}
                >
                  {product.product_name}
                </h4>

                <div className="flex items-center gap-2 mt-1.5 text-xs text-text-sub">
                  {product.brand && (
                    <span className="bg-surface-bg px-2 py-0.5 rounded border border-surface-border text-[11px]">
                      {product.brand}
                    </span>
                  )}
                  {product.sold !== undefined && (
                    <span className="text-[11px] text-text-muted">
                      Đã bán {product.sold}
                    </span>
                  )}
                  {product.rating !== null && product.rating !== undefined && (
                    <span className="flex items-center gap-0.5 text-[11px] text-accent font-semibold ml-auto">
                      <Star className="w-3 h-3 fill-accent" />
                      {Number(product.rating).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="pt-3 mt-3 border-t border-surface-border/70 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-price">
                      {formatPrice(hasDiscount ? product.sale_price : product.price)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <span className="text-xs text-text-muted line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onViewDetail(product)}
                    className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="p-1.5 text-text-muted hover:text-accent hover:bg-accent-light rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error-bg rounded-lg transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

