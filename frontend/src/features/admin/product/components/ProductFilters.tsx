"use client";

import React from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import { StockStatus } from "../types";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  stockStatus: StockStatus;
  onStockStatusChange: (status: StockStatus) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedCount: number;
  onOpenAddModal: () => void;
  onBulkDelete: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  search,
  onSearchChange,
  stockStatus,
  onStockStatusChange,
  sortBy,
  onSortChange,
  selectedCount,
  onOpenAddModal,
  onBulkDelete,
}) => {
  return (
    <div className="bg-(--color-surface-card) border border-(--color-surface-border) rounded-xl p-4 mb-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-text-muted)" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
          />
        </div>

        {/* Stock Status Filter */}
        <select
          value={stockStatus}
          onChange={(e) => onStockStatusChange(e.target.value as StockStatus)}
          className="w-full sm:w-auto px-3 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
        >
          <option value="all">Tất cả trạng thái kho</option>
          <option value="in_stock">Còn hàng</option>
          <option value="low_stock">Sắp hết hàng</option>
          <option value="out_of_stock">Hết hàng</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
        >
          <option value="id_desc">Mới nhất (Mặc định)</option>
          <option value="price_asc">Giá: Thấp đến Cao</option>
          <option value="price_desc">Giá: Cao đến Thấp</option>
          <option value="quantity_asc">Tồn kho: Tăng dần</option>
          <option value="quantity_desc">Tồn kho: Giảm dần</option>
        </select>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {selectedCount > 0 && (
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-(--color-status-error-bg) text-(--color-status-error) border border-(--color-status-error) rounded-lg hover:opacity-90 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Xóa đã chọn ({selectedCount})
          </button>
        )}

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-(--color-primary) text-(--color-primary-contrast) rounded-lg hover:bg-(--color-primary-hover) transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>
    </div>
  );
};