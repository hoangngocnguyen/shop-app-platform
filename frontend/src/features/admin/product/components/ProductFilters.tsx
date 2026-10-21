"use client";

import React from "react";
import {
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import { CategoryResponse, StockStatus } from "../types";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  stockStatus: StockStatus;
  onStockStatusChange: (status: StockStatus) => void;
  categoryId: number | null;
  onCategoryChange: (id: number | null) => void;
  categories: CategoryResponse[];
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  onResetFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  search,
  onSearchChange,
  stockStatus,
  onStockStatusChange,
  categoryId,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(
    search.trim() ||
      stockStatus !== "all" ||
      categoryId !== null ||
      sortBy !== "id_desc"
  );

  const selectedCategoryName =
    categories.find((c) => c.category_id === categoryId)?.category_name;

  return (
    <div className="space-y-3">
      {/* Top Filter Bar: Search on Left, Dropdowns on Right */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-surface-card border border-surface-border rounded-xl text-text-main placeholder:text-text-muted transition-all duration-200 outline-none hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-ring-brand/15 shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text-main rounded-md hover:bg-surface-hover transition-colors cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns on Right */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryId !== null ? String(categoryId) : ""}
              onChange={(e) =>
                onCategoryChange(e.target.value ? Number(e.target.value) : null)
              }
              className="px-3 pr-8 py-2 text-xs sm:text-sm bg-surface-card border border-surface-border rounded-xl text-text-main transition-all duration-200 outline-none hover:border-primary/50 focus:border-primary cursor-pointer appearance-none shadow-2xs font-medium"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>

          {/* Stock Status Dropdown */}
          <div className="relative">
            <select
              value={stockStatus}
              onChange={(e) =>
                onStockStatusChange(e.target.value as StockStatus)
              }
              className="px-3 pr-8 py-2 text-xs sm:text-sm bg-surface-card border border-surface-border rounded-xl text-text-main transition-all duration-200 outline-none hover:border-primary/50 focus:border-primary cursor-pointer appearance-none shadow-2xs font-medium"
            >
              <option value="all">Kho: Tất cả</option>
              <option value="in_stock">Còn hàng (&gt;5)</option>
              <option value="low_stock">Sắp hết (1-5)</option>
              <option value="out_of_stock">Hết hàng (0)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 pr-8 py-2 text-xs sm:text-sm bg-surface-card border border-surface-border rounded-xl text-text-main transition-all duration-200 outline-none hover:border-primary/50 focus:border-primary cursor-pointer appearance-none shadow-2xs font-medium"
            >
              <option value="id_desc">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="quantity_asc">Tồn kho: Tăng dần</option>
              <option value="quantity_desc">Tồn kho: Giảm dần</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center p-0.5 bg-surface-card border border-surface-border rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-primary-light text-primary font-bold"
                  : "text-text-muted hover:text-text-main"
              }`}
              title="Dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-primary-light text-primary font-bold"
                  : "text-text-muted hover:text-text-main"
              }`}
              title="Dạng lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-text-sub hover:text-status-error bg-surface-card hover:bg-status-error-bg border border-surface-border hover:border-status-error/30 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-text-muted flex items-center gap-1 font-medium">
            <SlidersHorizontal className="w-3 h-3" />
            Đang lọc:
          </span>

          {search.trim() && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary-light text-primary border border-primary/20 rounded-lg font-medium">
              &ldquo;{search}&rdquo;
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="hover:opacity-75 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {categoryId !== null && selectedCategoryName && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary-light text-primary border border-primary/20 rounded-lg font-medium">
              {selectedCategoryName}
              <button
                type="button"
                onClick={() => onCategoryChange(null)}
                className="hover:opacity-75 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {stockStatus !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-surface-card text-text-sub border border-surface-border rounded-lg font-medium">
              {stockStatus === "in_stock"
                ? "Còn hàng"
                : stockStatus === "low_stock"
                ? "Sắp hết"
                : "Hết hàng"}
              <button
                type="button"
                onClick={() => onStockStatusChange("all")}
                className="hover:opacity-75 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
