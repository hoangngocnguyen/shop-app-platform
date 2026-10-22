"use client";

import React from "react";
import { ChevronLeft, ChevronRight, FolderTree, Pencil, Trash2 } from "lucide-react";
import type { CategoryStats } from "../types";

const PAGE_SIZES = [10, 20, 50];

interface CategoryTableProps {
  items?: CategoryStats[]; // Cho phép undefined để tránh lỗi
  isLoading: boolean;
  /** Từ khóa đang tìm, dùng để đổi nội dung khi bảng trống */
  search: string;
  selected: Set<number>;
  /** Tra tên danh mục cha theo ID */
  parentNameById: Map<number, string>;
  onToggleAll: () => void;
  onToggleOne: (id: number) => void;
  onEdit: (category: CategoryStats) => void;
  onDelete: (category: CategoryStats) => void;
  // Phân trang
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/** Bảng danh mục admin kèm thanh phân trang */
export function CategoryTable({
  items = [], // Gán giá trị mặc định là mảng trống nếu items là undefined
  isLoading,
  search,
  selected,
  parentNameById,
  onToggleAll,
  onToggleOne,
  onEdit,
  onDelete,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: CategoryTableProps) {
  const safeItems = items ?? []; // Đảm bảo an toàn tuyệt đối
  const allSelected = safeItems.length > 0 && safeItems.every((c) => selected.has(c.category_id));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-brand-sm transition-all duration-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-170 text-left text-sm border-separate border-spacing-y-1.5 px-3">
          <thead className="text-text-sub">
            <tr>
              <th className="w-12 px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  aria-label="Chọn tất cả danh mục trong trang"
                  className="size-4 accent-primary cursor-pointer rounded"
                />
              </th>
              <th className="w-16 px-2 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Tên danh mục</th>
              <th className="px-4 py-3 font-medium">Danh mục cha</th>
              <th className="px-4 py-3 text-right font-medium">Sản phẩm</th>
              <th className="w-32 px-4 py-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && safeItems.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-5 animate-pulse rounded-lg bg-surface-hover" />
                  </td>
                </tr>
              ))
            ) : safeItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-surface-bg text-text-disabled shadow-xs">
                    <FolderTree className="size-8" aria-hidden />
                  </div>
                  <p className="mt-4 font-semibold text-text-main">
                    {search ? "Không có danh mục khớp từ khóa" : "Chưa có danh mục nào"}
                  </p>
                  <p className="mt-1 text-sm text-text-sub">
                    {search
                      ? "Thử từ khóa khác hoặc xóa ô tìm kiếm."
                      : "Bấm “Thêm danh mục” để tạo danh mục đầu tiên."}
                  </p>
                </td>
              </tr>
            ) : (
              safeItems.map((cat) => {
                const parentName =
                  cat.parent_id == null
                    ? null
                    : (parentNameById.get(cat.parent_id) ?? `ID ${cat.parent_id}`);

                return (
                  <tr
                    key={cat.category_id}
                    className={`group transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-sm hover:border-primary/40 ${
                      selected.has(cat.category_id)
                        ? "bg-primary-light/80 border border-primary/30 shadow-xs"
                        : "bg-surface-card border border-surface-border hover:bg-surface-card"
                    }`}
                  >
                    <td className="px-4 py-3.5 rounded-l-xl">
                      <input
                        type="checkbox"
                        checked={selected.has(cat.category_id)}
                        onChange={() => onToggleOne(cat.category_id)}
                        aria-label={`Chọn ${cat.category_name}`}
                        className="size-4 accent-primary cursor-pointer rounded"
                      />
                    </td>
                    <td className="px-2 py-3.5 font-mono text-xs text-text-muted">{cat.category_id}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-text-main group-hover:text-primary transition-colors">{cat.category_name}</p>
                      <p className="font-mono text-xs text-text-muted">/{cat.slug}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {parentName ? (
                        <span className="text-text-sub">{parentName}</span>
                      ) : (
                        <span className="rounded-full bg-surface-active/60 px-3 py-1 text-xs font-medium text-text-sub">
                          Danh mục gốc
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
                          cat.product_count > 0
                            ? "bg-status-info-bg text-status-info"
                            : "text-text-muted bg-surface-bg"
                        }`}
                      >
                        {cat.product_count}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 rounded-r-xl">
                      <div className="flex justify-end gap-1.5">
                        
                        {/* NÚT SỬA VỚI BOTTOM GLOW & HOVER LIFT CHUẨN XÁC */}
                        <div className="group/editbtn relative inline-block">
                          {/* Ánh sáng đèn xanh dưới đáy */}
                          <div className="absolute -bottom-1 left-1 right-1 h-3 bg-primary/40 rounded-full blur-md opacity-0 group-hover/editbtn:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          <div className="relative transition-all duration-300 group-hover/editbtn:-translate-y-0.5">
                            <button
                              type="button"
                              onClick={() => onEdit(cat)}
                              aria-label={`Sửa ${cat.category_name}`}
                              className="relative inline-flex items-center justify-center rounded-lg p-2 text-text-sub transition-all duration-200 hover:bg-surface-active hover:text-primary shadow-2xs cursor-pointer"
                            >
                              <Pencil className="size-4 transition-transform duration-200 group-hover/editbtn:scale-125 group-hover/editbtn:rotate-12" aria-hidden />
                            </button>
                          </div>
                        </div>

                        {/* NÚT XÓA VỚI BOTTOM GLOW & HOVER LIFT CHUẨN XÁC */}
                        <div className="group/delbtn relative inline-block">
                          {/* Ánh sáng đèn đỏ/hồng dưới đáy */}
                          <div className="absolute -bottom-1 left-1 right-1 h-3 bg-red-500/40 rounded-full blur-md opacity-0 group-hover/delbtn:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          <div className="relative transition-all duration-300 group-hover/delbtn:-translate-y-0.5">
                            <button
                              type="button"
                              onClick={() => onDelete(cat)}
                              aria-label={`Xóa ${cat.category_name}`}
                              className="relative inline-flex items-center justify-center rounded-lg p-2 text-text-sub transition-all duration-200 hover:bg-status-error-bg hover:text-status-error shadow-2xs cursor-pointer"
                            >
                              <Trash2 className="size-4 transition-transform duration-200 group-hover/delbtn:scale-125 group-hover/delbtn:-rotate-12" aria-hidden />
                            </button>
                          </div>
                        </div>

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border px-4 py-3.5 text-sm text-text-sub bg-surface-bg/50">
        <div className="flex items-center gap-3">
          <span className="font-medium text-text-main">
            {from}–{to} <span className="text-text-muted">/ {total}</span>
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Số dòng mỗi trang"
            className="rounded-xl border border-surface-border bg-surface-card px-2.5 py-1.5 text-text-main transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring-brand/20 cursor-pointer"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} dòng
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Trang trước"
            className="rounded-xl border border-surface-border bg-surface-card p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-hover hover:shadow-xs active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-surface-card cursor-pointer"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <span className="px-2 font-medium text-text-main">
            Trang {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Trang sau"
            className="rounded-xl border border-surface-border bg-surface-card p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-hover hover:shadow-xs active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-surface-card cursor-pointer"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryTable;