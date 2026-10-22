"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Loader2,
  PackagePlus,
  Edit3,
  UploadCloud,
  Image as ImageIcon,
  DollarSign,
  FileText,
  Tag,
  AlertCircle,
  Percent,
} from "lucide-react";
import { ProductResponse, ProductCreate, ProductUpdate, CategoryResponse } from "../types";
import { productSchema } from "../schemas/productSchema";
import { formatPrice } from "../utils/formatPrice";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: ProductCreate | ProductUpdate,
    file?: File | null
  ) => Promise<void>;
  productToEdit?: ProductResponse | null;
  categories: CategoryResponse[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
  categories,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"info" | "media">("info");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_name: "",
      category_id: categories[0]?.category_id || 1,
      price: 0,
      sale_price: null,
      quantity: 1,
      brand: "",
      origin: "",
      description: "",
    },
  });

  const watchedPrice = watch("price");
  const watchedSalePrice = watch("sale_price");

  // Reset form when modal opens or productToEdit changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setImagePreview("");
      return;
    }

    if (productToEdit) {
      reset({
        product_name: productToEdit.product_name,
        category_id: productToEdit.category_id || categories[0]?.category_id || 1,
        price: productToEdit.price,
        sale_price: productToEdit.sale_price ?? null,
        quantity: productToEdit.quantity,
        brand: productToEdit.brand ?? "",
        origin: productToEdit.origin ?? "",
        description: productToEdit.description ?? "",
      });
      setImagePreview(productToEdit.image_src ?? "");
    } else {
      reset({
        product_name: "",
        category_id: categories[0]?.category_id || 1,
        price: 0,
        sale_price: null,
        quantity: 1,
        brand: "",
        origin: "",
        description: "",
      });
      setImagePreview("");
    }
    setSelectedFile(null);
  }, [productToEdit, reset, isOpen, categories]);

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview("");
  };

  const onFormSubmit = async (data: unknown) => {
    await onSubmit(data as ProductCreate | ProductUpdate, selectedFile);
  };

  if (!isOpen) return null;

  // Tính discount preview
  const numPrice = Number(watchedPrice) || 0;
  const numSalePrice =
    watchedSalePrice !== null && watchedSalePrice !== undefined
      ? Number(watchedSalePrice)
      : 0;

  const hasDiscount =
    numSalePrice > 0 && numPrice > 0 && numSalePrice < numPrice;
  const discountPercent = hasDiscount
    ? Math.round(((numPrice - numSalePrice) / numPrice) * 100)
    : 0;
  const savedAmount = hasDiscount ? numPrice - numSalePrice : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-surface-card border border-surface-border w-full max-w-5xl rounded-3xl shadow-brand-md overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-6 py-5 border-b border-surface-border bg-surface-bg/70 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center text-primary shadow-xs">
              {productToEdit ? (
                <Edit3 className="w-5 h-5" />
              ) : (
                <PackagePlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-text-main tracking-tight">
                {productToEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                {productToEdit
                  ? `Mã sản phẩm: #${productToEdit.product_id} — Cập nhật thông tin chi tiết`
                  : "Điền đầy đủ thông tin để niêm yết sản phẩm lên cửa hàng"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-main rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher for mobile / small screen */}
        <div className="flex sm:hidden border-b border-surface-border bg-surface-bg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === "info"
                ? "border-primary text-primary bg-surface-card"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            Thông tin & Giá
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === "media"
                ? "border-primary text-primary bg-surface-card"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            Hình ảnh & Mô tả
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="p-6 max-h-[calc(85vh-140px)] overflow-y-auto space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Basic Info & Pricing (7 cols) */}
            <div
              className={`lg:col-span-7 space-y-5 ${
                activeTab === "media" ? "hidden sm:block" : "block"
              }`}
            >
              {/* Section 1: Thông tin cơ bản */}
              <div className="bg-surface-bg/50 border border-surface-border rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-text-sub uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  <span>Thông tin cơ bản</span>
                </div>

                {/* Tên sản phẩm */}
                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">
                    Tên sản phẩm <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("product_name")}
                    placeholder="VD: Điện thoại iPhone 15 Pro Max 256GB"
                    className={`w-full px-3.5 py-2.5 text-sm bg-surface-card border rounded-xl text-text-main outline-none transition-all duration-200 placeholder:text-text-muted hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-ring-brand/15 ${
                      errors.product_name
                        ? "border-status-error focus:ring-status-error/15"
                        : "border-surface-border"
                    }`}
                  />
                  {errors.product_name && (
                    <p className="mt-1 text-xs text-status-error flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.product_name.message}
                    </p>
                  )}
                </div>

                {/* Danh mục */}
                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">
                    Danh mục sản phẩm <span className="text-status-error">*</span>
                  </label>
                  <select
                    {...register("category_id")}
                    className={`w-full px-3.5 py-2.5 text-sm bg-surface-card border rounded-xl text-text-main outline-none transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-ring-brand/15 cursor-pointer ${
                      errors.category_id
                        ? "border-status-error focus:ring-status-error/15"
                        : "border-surface-border"
                    }`}
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))
                    ) : (
                      <option value={1}>Danh mục mặc định (#1)</option>
                    )}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-xs text-status-error flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.category_id.message}
                    </p>
                  )}
                </div>

                {/* Thương hiệu & Xuất xứ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-text-main mb-1.5">
                      Thương hiệu
                    </label>
                    <input
                      type="text"
                      {...register("brand")}
                      placeholder="VD: Apple, Samsung..."
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-card border border-surface-border rounded-xl text-text-main outline-none transition-all duration-200 placeholder:text-text-muted hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-ring-brand/15"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-main mb-1.5">
                      Xuất xứ
                    </label>
                    <input
                      type="text"
                      {...register("origin")}
                      placeholder="VD: Việt Nam, Mỹ..."
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-card border border-surface-border rounded-xl text-text-main outline-none transition-all duration-200 placeholder:text-text-muted hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-ring-brand/15"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Giá & Kho hàng */}
              <div className="bg-surface-bg/50 border border-surface-border rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-text-sub uppercase tracking-wider">
                  <DollarSign className="w-3.5 h-3.5 text-price" />
                  <span>Giá bán & Quản lý kho</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Giá niêm yết */}
                  <div>
                    <label className="block text-xs font-semibold text-text-main mb-1.5">
                      Giá niêm yết (VNĐ) <span className="text-status-error">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1000"
                        {...register("price")}
                        placeholder="0"
                        className={`w-full px-3.5 py-2.5 text-sm bg-surface-card border rounded-xl text-text-main outline-none transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-ring-brand/15 ${
                          errors.price
                            ? "border-status-error focus:ring-status-error/15"
                            : "border-surface-border"
                        }`}
                      />
                    </div>
                    {numPrice > 0 && (
                      <p className="text-[11px] text-price mt-1 font-semibold font-mono">
                        ≈ {formatPrice(numPrice)}
                      </p>
                    )}
                    {errors.price && (
                      <p className="mt-1 text-xs text-status-error flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Giá khuyến mãi */}
                  <div>
                    <label className="block text-xs font-semibold text-text-main mb-1.5 flex items-center justify-between">
                      <span>Giá khuyến mãi (VNĐ)</span>
                      {hasDiscount && (
                        <span className="text-[10px] font-bold text-price flex items-center gap-0.5">
                          <Percent className="w-3 h-3" />
                          Giảm {discountPercent}%
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="1000"
                      {...register("sale_price")}
                      placeholder="Để trống nếu không giảm giá"
                      className={`w-full px-3.5 py-2.5 text-sm bg-surface-card border rounded-xl text-text-main outline-none transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-ring-brand/15 ${
                        errors.sale_price
                          ? "border-status-error focus:ring-status-error/15"
                          : "border-surface-border"
                      }`}
                    />
                    {hasDiscount ? (
                      <p className="text-[11px] text-price mt-1 font-semibold font-mono">
                        ≈ {formatPrice(numSalePrice)} (Tiết kiệm {formatPrice(savedAmount)})
                      </p>
                    ) : numSalePrice > 0 ? (
                      <p className="text-[11px] text-price mt-1 font-semibold font-mono">
                        ≈ {formatPrice(numSalePrice)}
                      </p>
                    ) : null}
                    {errors.sale_price && (
                      <p className="mt-1 text-xs text-status-error flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.sale_price.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Số lượng tồn kho */}
                <div>
                  <label className="block text-xs font-semibold text-text-main mb-1.5">
                    Số lượng tồn kho ban đầu <span className="text-status-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register("quantity")}
                      placeholder="0"
                      className={`w-full px-3.5 py-2.5 text-sm bg-surface-card border rounded-xl text-text-main outline-none transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-ring-brand/15 ${
                        errors.quantity
                          ? "border-status-error focus:ring-status-error/15"
                          : "border-surface-border"
                      }`}
                    />
                  </div>
                  {errors.quantity && (
                    <p className="mt-1 text-xs text-status-error flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Image (5 cols) */}
            <div
              className={`lg:col-span-5 space-y-5 ${
                activeTab === "info" ? "hidden sm:block" : "block"
              }`}
            >
              {/* Card Hình ảnh */}
              <div className="bg-surface-bg/50 border border-surface-border rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-sub uppercase tracking-wider">
                    <ImageIcon className="w-3.5 h-3.5 text-accent" />
                    <span>Hình ảnh sản phẩm</span>
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="text-[11px] text-status-error hover:underline cursor-pointer font-medium"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>

                {/* Preview Box or Upload Dropzone */}
                {imagePreview ? (
                  <div className="relative aspect-4/3 w-full rounded-2xl border border-surface-border bg-surface-card overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Xem trước sản phẩm"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreview("")}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="px-3 py-1.5 text-xs font-semibold bg-white text-text-main rounded-xl hover:bg-surface-hover transition-colors cursor-pointer shadow-sm">
                        Đổi ảnh
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="px-3 py-1.5 text-xs font-semibold bg-status-error text-white rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                      >
                        Gỡ bỏ
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-surface-border hover:border-primary/60 rounded-2xl bg-surface-card hover:bg-primary-light/20 transition-all cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-text-main text-center">
                      Nhấp để tải ảnh lên
                    </p>
                    <p className="text-[11px] text-text-muted text-center mt-1">
                      PNG, JPG, WEBP dung lượng tối đa 5MB
                    </p>
                  </label>
                )}

              </div>
            </div>
          </div>

          {/* Product description */}
          <div
            className={`bg-surface-bg/50 border border-surface-border rounded-2xl p-4.5 space-y-3 ${
              activeTab === "info" ? "hidden sm:block" : "block"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-text-sub uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-text-sub" />
              <span>Mô tả sản phẩm</span>
            </div>
            <textarea
              rows={8}
              {...register("description")}
              placeholder="Nhập chi tiết đặc điểm nổi bật, thông số kỹ thuật của sản phẩm..."
              className="w-full px-3.5 py-3 text-sm bg-surface-card border border-surface-border rounded-xl text-text-main outline-none transition-all placeholder:text-text-muted hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-ring-brand/15 resize-y"
            />
            {errors.description && (
              <p className="text-xs text-status-error flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-semibold text-text-sub bg-surface-bg hover:bg-surface-hover border border-surface-border rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-contrast rounded-xl hover:bg-primary-hover shadow-brand-sm hover:shadow-brand-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isSubmitting
                  ? "Đang xử lý..."
                  : productToEdit
                  ? "Lưu thay đổi"
                  : "Thêm sản phẩm"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
