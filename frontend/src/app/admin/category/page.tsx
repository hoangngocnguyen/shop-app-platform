"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, FolderTree, ArrowUpDown, CheckCircle2 } from "lucide-react";

import { useCategoryStore } from "@/features/admin/category/stores";
import {
  CategoryTable,
  CategoryFormModal,
  CategoryDeleteModal,
  type CategoryFormTarget,
  type CategoryFormValues,
} from "@/features/admin/category";
import { toast } from "@/common/stores/useToastStore";

type CategorySortBy = "id_desc" | "name_asc" | "name_desc";

const SORT_OPTIONS: { value: CategorySortBy; label: string }[] = [
  { value: "id_desc", label: "Mới nhất" },
  { value: "name_asc", label: "Tên A → Z" },
  { value: "name_desc", label: "Tên Z → A" },
];

export default function AdminCategoryPage() {
  const {
    categories,
    adminCategories,
    total,
    totalPages,
    page,
    pageSize,
    search,
    sortBy,
    isLoading,
    isSubmitting,
    fetchCategories,
    fetchAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
    setSearch,
    setSortBy,
    setPage,
    setPageSize,
  } = useCategoryStore();

  const [searchInput, setSearchInput] = useState(search);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [formTarget, setFormTarget] = useState<CategoryFormTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    ids: number[];
    label: string;
  } | null>(null);

  useEffect(() => {
    fetchAdminCategories();
  }, [page, pageSize, sortBy, search, fetchAdminCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== search) {
        setSearch(searchInput.trim());
        setSelected(new Set());
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, search, setSearch]);

  const parentNameById = useMemo(
    () => new Map(categories.map((c) => [c.category_id, c.category_name])),
    [categories],
  );

  const safeAdminCategories = adminCategories ?? [];
  const allSelected =
    safeAdminCategories.length > 0 &&
    safeAdminCategories.every((c) => selected.has(c.category_id));

  const toggleAll = () =>
    setSelected(
      allSelected
        ? new Set()
        : new Set(safeAdminCategories.map((c) => c.category_id)),
    );

  const toggleOne = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const errorMessage = (fallback: string) =>
    useCategoryStore.getState().error ?? fallback;

  const handleSubmitForm = async (values: CategoryFormValues) => {
    if (!formTarget) return;
    const parentId = values.parent_id === "" ? null : Number(values.parent_id);
    try {
      if (formTarget.mode === "create") {
        await createCategory({
          category_name: values.category_name,
          parent_id: parentId,
        });
        toast.success("Đã thêm danh mục mới thành công");
      } else {
        await updateCategory(formTarget.category.category_id, {
          category_name: values.category_name,
          parent_id: parentId,
        });
        toast.success("Đã cập nhật danh mục thành công");
      }
      fetchCategories();
      setFormTarget(null);
    } catch {
      toast.error(errorMessage("Không thể lưu danh mục"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.ids.length === 1) {
        await deleteCategory(deleteTarget.ids[0]);
      } else {
        await bulkDeleteCategories(deleteTarget.ids);
      }
      toast.success(`Đã xóa thành công ${deleteTarget.ids.length} danh mục`);
      fetchCategories();
      setSelected(new Set());
    } catch {
      toast.error(errorMessage("Không thể xóa danh mục"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-surface-bg,#f8fafc)] via-white to-[var(--color-surface-bg,#f8fafc)] text-[var(--color-text-main,#0f172a)] antialiased selection:bg-[var(--color-primary,#0f766e)] selection:text-white">
      <main className="max-w-[1240px] mx-auto px-4 py-6 md:py-10 space-y-8">
        
        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary,#0f766e)] via-[#115e59] to-[#042f2e] p-8 md:p-12 text-white shadow-2xl shadow-[var(--color-primary,#0f766e)]/40 border border-white/20 group transition-all duration-500 hover:shadow-[var(--color-primary,#0f766e)]/50">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-lg flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-300">
              Danh mục sản phẩm
            </h1>
            <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed font-normal">
              Hệ thống hiện đang quản lý tổng số <strong className="text-white font-bold">{total}</strong> danh mục sản phẩm. Thêm mới, sắp xếp và kiểm soát cấu trúc phân cấp dễ dàng.
            </p>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute right-1/4 -top-20 w-60 h-60 bg-teal-300/30 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Action Header Bar & Nút Thêm Danh Mục */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[var(--color-surface-border,#e2e8f0)] shadow-md">
          {/* Icon danh sách phân cấp với hiệu ứng nổi khi hover */}
          <div className="group/iconbox flex items-center gap-3.5 cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--color-primary,#0f766e)] flex items-center justify-center shadow-inner transition-all duration-300 group-hover/iconbox:-translate-y-1.5 group-hover/iconbox:scale-110 group-hover/iconbox:bg-primary group-hover/iconbox:text-white group-hover/iconbox:shadow-md">
              <FolderTree className="w-6 h-6 transition-transform duration-300 group-hover/iconbox:rotate-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--color-text-main,#0f172a)] transition-colors group-hover/iconbox:text-primary">
                Danh sách phân cấp
              </h3>
              <p className="text-xs text-[var(--color-text-muted,#94a3b8)]">
                Thực hiện tìm kiếm, chỉnh sửa hoặc xóa danh mục
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFormTarget({ mode: "create" })}
            className="group/btn relative inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-contrast shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover hover:shadow-xl active:translate-y-0 cursor-pointer"
          >
            <Plus className="size-4 transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:rotate-90" aria-hidden="true" />
            <span>Thêm danh mục mới</span>
          </button>
        </div>

        {/* Bộ lọc & Tìm kiếm với hiệu ứng nổi lên mượt mà (Hover Lift) */}
        <div className="flex flex-wrap items-center gap-3 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[var(--color-surface-border,#e2e8f0)] shadow-sm">
          
          {/* Ô tìm kiếm có hiệu ứng nổi lên */}
          <div className="relative min-w-[240px] flex-1 transition-all duration-300 hover:-translate-y-0.5">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted transition-colors"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên danh mục..."
              aria-label="Tìm theo tên danh mục"
              className="w-full rounded-xl border border-surface-border bg-surface-card py-2.5 pl-10 pr-3.5 text-sm text-text-main placeholder:text-text-muted shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-sm focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15"
            />
          </div>

          {/* Ô sắp xếp có hiệu ứng nổi lên */}
          <div className="relative transition-all duration-300 hover:-translate-y-0.5">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as CategorySortBy);
                setSelected(new Set());
              }}
              aria-label="Sắp xếp"
              className="rounded-xl border border-surface-border bg-surface-card py-2.5 pl-9 pr-8 text-sm text-text-main shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-sm focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15 cursor-pointer appearance-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Thanh thao tác hàng loạt */}
        {selected.size > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary-light px-5 py-3.5 text-sm shadow-md transition-all duration-300 animate-in fade-in zoom-in-95">
            <span className="font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Đã chọn <span className="underline decoration-2">{selected.size}</span> danh mục
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-text-sub transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-card hover:text-text-main hover:shadow-xs cursor-pointer font-medium"
              >
                Bỏ chọn
              </button>

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget({
                    ids: Array.from(selected),
                    label: `${selected.size} danh mục đã chọn`,
                  })
                }
                className="group/delbtn inline-flex items-center gap-1.5 rounded-xl bg-status-error px-4 py-2 font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md active:translate-y-0 cursor-pointer"
              >
                <Trash2 className="size-4 transition-transform duration-200 group-hover/delbtn:scale-110" aria-hidden="true" />
                <span>Xóa đã chọn</span>
              </button>
            </div>
          </div>
        )}

        {/* Bảng dữ liệu */}
        <CategoryTable
          items={adminCategories}
          isLoading={isLoading}
          search={search}
          selected={selected}
          parentNameById={parentNameById}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onEdit={(category) => setFormTarget({ mode: "edit", category })}
          onDelete={(c) =>
            setDeleteTarget({
              ids: [c.category_id],
              label: `danh mục “${c.category_name}”`,
            })
          }
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={(nextPage) => {
            setPage(nextPage);
            setSelected(new Set());
          }}
          onPageSizeChange={(nextSize) => {
            setPageSize(nextSize);
            setSelected(new Set());
          }}
        />

        {/* Modal thêm/sửa */}
        {formTarget && (
          <CategoryFormModal
            key={
              formTarget.mode === "edit"
                ? formTarget.category.category_id
                : "create"
            }
            target={formTarget}
            parentOptions={categories}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitForm}
            onClose={() => setFormTarget(null)}
          />
        )}

        {/* Modal xóa */}
        {deleteTarget && (
          <CategoryDeleteModal
            label={deleteTarget.label}
            isSubmitting={isSubmitting}
            onConfirm={handleConfirmDelete}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </main>
    </div>
  );
}