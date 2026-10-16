"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { ProductResponse, ProductCreate, ProductUpdate } from "../types";

const productSchema = z.object({
  product_name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
  category_id: z.coerce.number().min(1, "Vui lòng chọn danh mục hợp lệ"),
  price: z.coerce.number().min(0, "Giá tiền không được âm"),
  sale_price: z.coerce.number().min(0, "Giá khuyến mãi không được âm").nullable().optional(),
  quantity: z.coerce.number().min(0, "Số lượng không được âm"),
  brand: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  image_src: z.string().url("Đường dẫn ảnh không hợp lệ").nullable().optional().or(z.literal("")),
  description: z.string().nullable().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreate | ProductUpdate) => Promise<void>;
  productToEdit?: ProductResponse | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
}) => {
  // Bỏ <ProductFormData> ở đây để TypeScript tự suy luận từ zodResolver hoàn toàn khớp nhau
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_name: "",
      category_id: 1,
      price: 0,
      sale_price: null,
      quantity: 0,
      brand: "",
      origin: "",
      image_src: "",
      description: "",
    },
  });

  useEffect(() => {
    if (productToEdit) {
      reset({
        product_name: productToEdit.product_name,
        category_id: productToEdit.category_id || 1,
        price: productToEdit.price,
        sale_price: productToEdit.sale_price ?? null,
        quantity: productToEdit.quantity,
        brand: productToEdit.brand ?? "",
        origin: productToEdit.origin ?? "",
        image_src: productToEdit.image_src ?? "",
        description: productToEdit.description ?? "",
      });
    } else {
      reset({
        product_name: "",
        category_id: 1,
        price: 0,
        sale_price: null,
        quantity: 0,
        brand: "",
        origin: "",
        image_src: "",
        description: "",
      });
    }
  }, [productToEdit, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-(--color-surface-card) border border-(--color-surface-border) rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-(--color-surface-border)">
          <h3 className="text-lg font-bold text-(--color-text-main)">
            {productToEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-(--color-text-sub) hover:bg-(--color-surface-hover) rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data as ProductFormData))} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-(--color-text-sub) uppercase tracking-wider mb-1">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                {...register("product_name")}
                className="w-full px-3 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
                placeholder="Nhập tên sản phẩm..."
              />
              {errors.product_name && (
                <p className="text-xs text-(--color-status-error) mt-1">{errors.product_name.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--color-text-sub) uppercase tracking-wider mb-1">
                ID Danh mục *
              </label>
              <input
                type="number"
                {...register("category_id")}
                className="w-full px-3 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
              />
              {errors.category_id && (
                <p className="text-xs text-(--color-status-error) mt-1">{errors.category_id.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--color-text-sub) uppercase tracking-wider mb-1">
                Số lượng tồn kho *
              </label>
              <input
                type="number"
                {...register("quantity")}
                className="w-full px-3 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
              />
              {errors.quantity && (
                <p className="text-xs text-(--color-status-error) mt-1">{errors.quantity.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--color-text-sub) uppercase tracking-wider mb-1">
                Giá gốc (VNĐ) *
              </label>
              <input
                type="number"
                {...register("price")}
                className="w-full px-3 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
              />
              {errors.price && (
                <p className="text-xs text-(--color-status-error) mt-1">{errors.price.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--color-text-sub) uppercase tracking-wider mb-1">
                Giá khuyến mãi (VNĐ)
              </label>
              <input
                type="number"
                {...register("sale_price")}
                className="w-full px-3 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
                placeholder="Để trống nếu không có"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--color-text-sub) uppercase tracking-wider mb-1">
                Thương hiệu
              </label>
              <input
                type="text"
                {...register("brand")}
                className="w-full px-3 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
                placeholder="Ví dụ: Apple, Nike..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--color-text-sub) uppercase tracking-wider mb-1">
                Xuất xứ
              </label>
              <input
                type="text"
                {...register("origin")}
                className="w-full px-3 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
                placeholder="Ví dụ: Việt Nam, Nhật Bản..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-(--color-text-sub) uppercase tracking-wider mb-1">
                Đường dẫn hình ảnh (URL)
              </label>
              <input
                type="text"
                {...register("image_src")}
                className="w-full px-3 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
                placeholder="https://..."
              />
              {errors.image_src && (
                <p className="text-xs text-(--color-status-error) mt-1">{errors.image_src.message as string}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-(--color-text-sub) uppercase tracking-wider mb-1">
                Mô tả chi tiết
              </label>
              <textarea
                rows={3}
                {...register("description")}
                className="w-full px-3 py-2 text-sm bg-(--color-surface-bg) border border-(--color-surface-border) rounded-lg text-(--color-text-main) focus:outline-none focus:ring-2 focus:ring-(--color-ring-brand)"
                placeholder="Nhập mô tả sản phẩm..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--color-surface-border)">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-(--color-surface-bg) border border-(--color-surface-border) text-(--color-text-main) rounded-lg hover:bg-(--color-surface-hover) transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-(--color-primary) text-(--color-primary-contrast) rounded-lg hover:bg-(--color-primary-hover) transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Đang xử lý..." : productToEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};