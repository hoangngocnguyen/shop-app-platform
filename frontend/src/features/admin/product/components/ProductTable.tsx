"use client";

import React from "react";
import {
  Edit3,
  Trash2,
  Eye,
  PackageOpen,
  ShoppingBag,
  Plus,
  RotateCcw,
} from "lucide-react";
import { CategoryResponse, ProductResponse } from "../types";
import { formatPrice } from "../utils/formatPrice";

interface ProductTableProps {
  products: ProductResponse[];
  isLoading: boolean;
  selectedIds: number[];
  categories?: CategoryResponse[];
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: number) => void;
  onViewDetail: (product: ProductResponse) => void;
  onEdit: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
  onOpenAddModal?: () => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  selectedIds,
  categories = [],
  onToggleSelectAll,
  onToggleSelectOne,
  onViewDetail,
  onEdit,
  onDelete,
  onOpenAddModal,
  onResetFilters,
  hasActiveFilters = false,
}) => {
  const isAllSelected =
    products.length > 0 && selectedIds.length === products.length;
  const isPartiallySelected =
    selectedIds.length > 0 && selectedIds.length < products.length;

  const getCategoryName = (catId?: number | null) => {
    if (!catId) return "Chưa phân loại";
    const found = categories.find((c) => c.category_id === catId);
    return found ? found.category_name : `Danh mục #${catId}`;
  };

  return (
    <div className="bg-surface-card shadow-xs overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-surface-bg/50 border-b border-surface-border text-xs font-semibold text-text-sub select-none">
              <th className="py-3.5 px-3 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded border-surface-border text-primary focus:ring-ring-brand/30 cursor-pointer accent-primary"
                />
              </th>
              <th className="py-3.5 px-2 w-14 text-center">ID</th>
              <th className="py-3.5 px-4 min-w-[240px]">Sản phẩm</th>
              <th className="py-3.5 px-4 w-40 min-w-[140px]">Danh mục & Xuất xứ</th>
              <th className="py-3.5 px-4 w-36 min-w-[130px]">Giá bán</th>
              <th className="py-3.5 px-4 w-32 min-w-[110px] text-center">Tồn kho</th>
              <th className="py-3.5 px-4 w-28 min-w-[100px] text-center">Đã bán</th>
              <th className="py-3.5 px-4 w-28 min-w-[110px] text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-border text-sm text-text-main">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="p-3.5 text-center">
                    <div className="w-4 h-4 bg-surface-border rounded mx-auto" />
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="w-8 h-4 bg-surface-border rounded mx-auto" />
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-border rounded-xl shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 bg-surface-border rounded w-3/4" />
                        <div className="h-3 bg-surface-border/60 rounded w-1/4" />
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="h-4 bg-surface-border rounded w-24" />
                  </td>
                  <td className="p-3.5">
                    <div className="h-4 bg-surface-border rounded w-20" />
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="h-5 bg-surface-border rounded-full w-20 mx-auto" />
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="h-4 bg-surface-border rounded w-10 mx-auto" />
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="h-7 bg-surface-border rounded-lg w-16 ml-auto" />
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={8} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-surface-bg flex items-center justify-center text-text-muted mb-3 border border-surface-border">
                      <PackageOpen className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-text-main">
                      Không tìm thấy sản phẩm nào
                    </h4>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      {hasActiveFilters
                        ? "Không có sản phẩm nào khớp với bộ lọc hiện tại. Thử xóa hoặc điều chỉnh bộ lọc tìm kiếm."
                        : "Chưa có sản phẩm nào trong kho hàng. Bấm \"Thêm sản phẩm\" để tạo sản phẩm đầu tiên."}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      {hasActiveFilters && onResetFilters && (
                        <button
                          type="button"
                          onClick={onResetFilters}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-surface-bg border border-surface-border text-text-main rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Xóa bộ lọc
                        </button>
                      )}
                      {onOpenAddModal && (
                        <button
                          type="button"
                          onClick={onOpenAddModal}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-contrast rounded-xl hover:bg-primary-hover shadow-brand-sm transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm sản phẩm mới
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              // Product Rows
              products.map((product) => {
                const isSelected = selectedIds.includes(product.product_id);
                const isOutOfStock = product.quantity === 0;
                const isLowStock = product.quantity > 0 && product.quantity <= 5;

                // Ép kiểu number an toàn để khắc phục string comparison từ backend
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

                // Lọc brand hợp lệ (bỏ qua nếu brand chỉ là số rác hoặc chuỗi trống)
                const validBrand =
                  product.brand &&
                    product.brand.trim() !== "" &&
                    isNaN(Number(product.brand))
                    ? product.brand.trim()
                    : null;

                return (
                  <tr
                    key={product.product_id}
                    className={`transition-colors group ${isSelected
                      ? "bg-primary-light/40"
                      : "hover:bg-surface-hover/70"
                      }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectOne(product.product_id)}
                        className="w-4 h-4 rounded border-surface-border text-primary focus:ring-ring-brand/30 cursor-pointer accent-primary"
                      />
                    </td>

                    {/* ID */}
                    <td className="py-3 px-2 text-center">
                      <span className="text-xs font-mono font-medium text-text-muted">
                        #{product.product_id}
                      </span>
                    </td>

                    {/* Product Name & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg bg-surface-bg border border-surface-border overflow-hidden shrink-0 group-hover:border-primary/40 transition-colors">
                          {product.image_src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image_src}
                              alt={product.product_name}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-text-muted">
                              <ShoppingBag className="w-4 h-4 opacity-40" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onViewDetail(product)}
                            className="w-full text-left font-semibold text-sm text-text-main hover:text-primary transition-colors line-clamp-3 [overflow-wrap:anywhere] cursor-pointer"
                            title={product.product_name}
                          >
                            {product.product_name}
                          </button>
                          {validBrand && (
                            <p className="text-[11px] text-text-muted mt-0.5">
                              {validBrand}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category & Origin */}
                    <td className="py-3 px-4">
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-surface-bg text-text-sub border border-surface-border">
                          {getCategoryName(product.category_id)}
                        </span>
                        {product.origin && (
                          <p className="text-[11px] text-text-muted mt-0.5">
                            Xuất xứ: {product.origin}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Price & Sale Price */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {hasDiscount ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-price">
                                {formatPrice(numSalePrice)}
                              </span>
                              {discountPercent && discountPercent > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-price-light text-price rounded border border-price/20">
                                  -{discountPercent}%
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-text-muted line-through">
                              {formatPrice(numPrice)}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-price">
                              {formatPrice(numPrice)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${isOutOfStock
                          ? "bg-status-error-bg text-status-error border-status-error/20"
                          : isLowStock
                            ? "bg-status-warning-bg text-status-warning border-status-warning/20"
                            : "bg-status-success-bg text-status-success border-status-success/20"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isOutOfStock
                            ? "bg-status-error"
                            : isLowStock
                              ? "bg-status-warning"
                              : "bg-status-success"
                            }`}
                        />
                        {isOutOfStock
                          ? "Hết hàng"
                          : isLowStock
                            ? `Sắp hết (${product.quantity})`
                            : `Còn (${product.quantity})`}
                      </span>
                    </td>

                    {/* Sold */}
                    <td className="py-3 px-4 text-center text-xs text-text-sub">
                      <span className="font-semibold text-text-main">
                        {product.sold || 0}
                      </span>
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetail(product)}
                          className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-all cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(product)}
                          className="p-1.5 text-text-muted hover:text-accent hover:bg-accent-light rounded-lg transition-all cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(product)}
                          className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error-bg rounded-lg transition-all cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
