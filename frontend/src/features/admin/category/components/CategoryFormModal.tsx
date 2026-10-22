"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { CategoryStats } from "../types";
import { ModalShell } from "./ModalShell";

/* Backend tự sinh slug từ tên nên form không có trường slug. */
const categoryFormSchema = z.object({
  category_name: z
    .string()
    .min(1, "Vui lòng nhập tên danh mục")
    .max(255, "Tên danh mục tối đa 255 ký tự"),
  // Giá trị của <select>: "" = danh mục gốc, còn lại là ID danh mục cha
  parent_id: z.string(),
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormOutput = z.output<typeof categoryFormSchema>;
export type CategoryFormValues = CategoryFormOutput;
export type CategoryFormTarget =
  | { mode: "create" }
  | { mode: "edit"; category: CategoryStats };

export interface CategoryFormModalProps {
  target: CategoryFormTarget;
  parentOptions: { category_id: number; category_name: string }[];
  isSubmitting: boolean;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onClose: () => void;
}

/** Modal thêm / sửa danh mục (React Hook Form + Zod) */
export function CategoryFormModal({
  target,
  parentOptions,
  isSubmitting,
  onSubmit,
  onClose,
}: CategoryFormModalProps) {
  const editing = target.mode === "edit" ? target.category : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      category_name: editing?.category_name ?? "",
      parent_id: editing?.parent_id != null ? String(editing.parent_id) : "",
    },
  });

  // Không cho chọn chính nó làm danh mục cha
  const options = parentOptions.filter((c) => c.category_id !== editing?.category_id);

  const handleFormSubmit = async (data: CategoryFormOutput) => {
    await onSubmit({
      ...data,
      category_name: data.category_name.trim(),
    });
  };

  return (
    <ModalShell title={editing ? "Sửa danh mục" : "Thêm danh mục"} onClose={onClose}>
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
        
        {/* Trường Nhập Tên Danh Mục với Hiệu ứng Bottom Glow & Nổi */}
        <div>
          <label htmlFor="category_name" className="mb-1.5 block text-sm font-medium text-text-main">
            Tên danh mục
          </label>
          <div className="group/inputbox relative w-full">
            {/* Ánh sáng đèn xanh dưới đáy */}
            <div className="absolute -bottom-1.5 left-2 right-2 h-3 bg-primary/30 rounded-full blur-md opacity-0 group-hover/inputbox:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative transition-all duration-300 group-hover/inputbox:-translate-y-0.5">
              <input
                id="category_name"
                autoFocus
                {...register("category_name")}
                aria-invalid={!!errors.category_name}
                placeholder="Ví dụ: Điện thoại thông minh"
                className={`w-full rounded-xl border bg-surface-card px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2 ${
                  errors.category_name
                    ? "border-status-error focus:ring-status-error/20"
                    : "border-surface-border focus:border-ring-brand focus:ring-ring-brand/20 hover:border-primary/50"
                }`}
              />
            </div>
          </div>
          {errors.category_name ? (
            <p className="mt-1.5 text-xs text-status-error">
              {errors.category_name.message}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-text-muted">
              Đường dẫn (slug) sẽ tự tạo từ tên.
            </p>
          )}
        </div>

        {/* Trường Chọn Danh Mục Cha với Hiệu ứng Bottom Glow & Nổi */}
        <div>
          <label
            htmlFor="parent_id"
            className="mb-1.5 block text-sm font-medium text-text-main"
          >
            Danh mục cha
          </label>
          <div className="group/selectbox relative w-full">
            {/* Ánh sáng đèn xanh dưới đáy */}
            <div className="absolute -bottom-1.5 left-2 right-2 h-3 bg-primary/30 rounded-full blur-md opacity-0 group-hover/selectbox:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative transition-all duration-300 group-hover/selectbox:-translate-y-0.5">
              <select
                id="parent_id"
                {...register("parent_id")}
                className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-text-main transition-all duration-200 focus:border-ring-brand focus:outline-none focus:ring-2 focus:ring-ring-brand/20 hover:border-primary/50 cursor-pointer"
              >
                <option value="">Không có (danh mục gốc)</option>
                {options.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
              </select>
            </div>
          </div>
          {editing && (
            <p className="mt-1.5 text-xs text-text-muted">
              Hệ thống hiện chưa hỗ trợ chuyển danh mục về gốc khi sửa.
            </p>
          )}
        </div>

        {/* Các nút bấm bên dưới Modal */}
        <div className="flex justify-end gap-3 pt-3">
          
          {/* NÚT HỦY VỚI BOTTOM GLOW & HOVER LIFT */}
          <div className="group/cancelbtn relative inline-block">
            <div className="absolute -bottom-1 left-1 right-1 h-2.5 bg-primary/30 rounded-full blur-xs opacity-0 group-hover/cancelbtn:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <button
              type="button"
              onClick={onClose}
              className="relative inline-flex items-center justify-center rounded-xl border border-surface-border px-4 py-2.5 text-sm font-medium text-text-main transition-all duration-300 hover:-translate-y-0.5 hover:bg-surface-hover hover:shadow-xs active:translate-y-0 cursor-pointer"
            >
              <span className="relative z-10">Hủy</span>
            </button>
          </div>
          
          {/* NÚT SUBMIT VỚI BOTTOM GLOW & HOVER LIFT */}
          <div className="group/submitbtn relative inline-block">
            <div className="absolute -bottom-1 left-2 right-2 h-3 bg-primary/40 rounded-full blur-md opacity-0 group-hover/submitbtn:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-contrast shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
            >
              <span className="relative z-10">{isSubmitting ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm danh mục"}</span>
            </button>
          </div>

        </div>
      </form>
    </ModalShell>
  );
}

export default CategoryFormModal;