"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

export const ProductPagination: React.FC<ProductPaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  if (totalItems === 0) return null;

  const startRecord = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between py-3.5 px-4 select-none text-xs text-text-sub border-t border-surface-border bg-surface-card">
      {/* Left: 1-10 / 22 | 10 dòng */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-text-main">
          {startRecord}-{endRecord} / {totalItems}
        </span>

        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={isLoading}
            className="px-2.5 py-1 text-xs font-medium bg-surface-card border border-surface-border rounded-lg text-text-main outline-none hover:border-primary/50 focus:border-primary cursor-pointer disabled:opacity-50"
          >
            <option value={10}>10 dòng</option>
            <option value={20}>20 dòng</option>
            <option value={50}>50 dòng</option>
          </select>
        </div>
      </div>

      {/* Right: < Trang 1 / 3 > */}
      <div className="flex items-center gap-1.5 border border-surface-border rounded-xl px-2 py-1 bg-surface-bg/50">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="p-1 rounded-lg text-text-sub hover:text-primary hover:bg-surface-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2 text-xs font-semibold text-text-main whitespace-nowrap">
          Trang {currentPage} / {totalPages || 1}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="p-1 rounded-lg text-text-sub hover:text-primary hover:bg-surface-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
