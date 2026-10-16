"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart, Zap, Plus, Minus, Check, ShieldAlert } from "lucide-react";
import { ProductDetailResponse } from "../types";
import { formatPrice } from "@/lib/formatPrice";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useCartStore } from "@/features/cart/stores";
import { toast } from "@/common/stores/useToastStore";
import { ROUTES } from "@/constants/routes";

interface ProductInfoProps {
    product: ProductDetailResponse;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { addToCart } = useCartStore();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const isOutOfStock = product.quantity <= 0;
    const maxQuantity = Math.max(1, product.quantity);

    const handleQuantityChange = (delta: number) => {
        setQuantity((prev) => {
            const next = prev + delta;
            if (next < 1) return 1;
            if (next > maxQuantity) return maxQuantity;
            return next;
        });
    };

    const handleAddToCart = async (redirectCheckout: boolean = false) => {
        if (!isAuthenticated()) {
            toast.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
            router.push(ROUTES.AUTH.LOGIN);
            return;
        }

        if (isOutOfStock) {
            toast.error("Sản phẩm hiện tại đã hết hàng!");
            return;
        }

        try {
            setIsAdding(true);
            await addToCart({
                product_id: product.product_id,
                quantity: quantity,
            });

            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);

            if (redirectCheckout) {
                toast.success("Đang chuyển đến giỏ hàng...");
                router.push(ROUTES.CART);
            } else {
                toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
            }
        } catch {
            toast.error("Không thể thêm vào giỏ hàng, vui lòng thử lại!");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="flex flex-col justify-between h-full space-y-6">
            <div className="space-y-4">
                {/* DANH MỤC & TRẠNG THÁI KHO */}
                <div className="flex items-center gap-2 flex-wrap">
                    {product.category && (
                        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
                            {product.category.category_name}
                        </span>
                    )}
                    <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            isOutOfStock
                                ? "bg-status-error-bg text-status-error border border-status-error/30"
                                : "bg-status-success-bg text-status-success border border-status-success/30"
                        }`}
                    >
                        {isOutOfStock ? "Tạm hết hàng" : `Còn hàng (${product.quantity})`}
                    </span>
                    {product.brand && (
                        <span className="text-xs text-text-sub font-medium">
                            Thương hiệu: <strong className="text-text-main">{product.brand}</strong>
                        </span>
                    )}
                </div>

                {/* TIÊU ĐỀ SẢN PHẨM */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text-main leading-snug">
                    {product.product_name}
                </h1>

                {/* ĐÁNH GIÁ VÀ LƯỢT BÁN */}
                <div className="flex items-center gap-3 text-xs sm:text-sm text-text-sub flex-wrap">
                    <div className="flex items-center gap-1 text-amber-500">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className="w-4 h-4 fill-amber-400 text-amber-400"
                                />
                            ))}
                        </div>
                        <span className="font-bold text-text-main ml-1">
                            {product.rating ? Number(product.rating).toFixed(1) : "5.0"}
                        </span>
                    </div>
                    <span>•</span>
                    <span>
                        Đã bán: <strong className="text-text-main font-semibold">{product.sold}</strong>
                    </span>
                    {product.origin && (
                        <>
                            <span>•</span>
                            <span>
                                Xuất xứ: <strong className="text-text-main font-semibold">{product.origin}</strong>
                            </span>
                        </>
                    )}
                </div>

                {/* KHỐI GIÁ SẢN PHẨM */}
                <div className="p-4 sm:p-5 rounded-2xl bg-surface-hover/50 border border-surface-border flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-[#ef4444] tracking-tight">
                        {formatPrice(product.price)}
                    </span>
                    {product.discount_percent && product.discount_percent > 0 && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-amber-950 text-xs font-black">
                            -{product.discount_percent}%
                        </span>
                    )}
                </div>

                {/* BỘ CHỌN SỐ LƯỢNG */}
                <div className="pt-2 space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-text-main block">
                        Số lượng:
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-xl border border-surface-border bg-surface-card overflow-hidden shadow-xs">
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1 || isOutOfStock}
                                aria-label="Giảm số lượng"
                                className="p-2 sm:p-2.5 hover:bg-surface-hover text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-sm font-bold text-text-main select-none">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(1)}
                                disabled={quantity >= maxQuantity || isOutOfStock}
                                aria-label="Tăng số lượng"
                                className="p-2 sm:p-2.5 hover:bg-surface-hover text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <span className="text-xs text-text-sub">
                            {product.quantity > 0
                                ? `${product.quantity} sản phẩm có sẵn`
                                : "Hết hàng"}
                        </span>
                    </div>
                </div>
            </div>

            {/* NÚT THAO TÁC (THÊM VÀO GIỎ & MUA NGAY) */}
            <div className="pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleAddToCart(false)}
                        disabled={isAdding || isOutOfStock}
                        className={`h-12 px-6 rounded-2xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                            isSuccess
                                ? "bg-status-success text-white border-status-success"
                                : "border-primary text-primary hover:bg-primary/5 active:scale-[0.98]"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isSuccess ? (
                            <>
                                <Check className="w-4 h-4 stroke-[2.5]" />
                                <span>Đã thêm vào giỏ</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4" />
                                <span>Thêm vào giỏ</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleAddToCart(true)}
                        disabled={isAdding || isOutOfStock}
                        className="h-12 px-6 rounded-2xl font-bold text-sm bg-primary text-white hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-brand-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Mua ngay</span>
                    </button>
                </div>

                {isOutOfStock && (
                    <div className="flex items-center gap-2 text-xs text-status-error font-medium p-3 rounded-xl bg-status-error-bg">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Sản phẩm hiện đang tạm hết hàng. Quý khách vui lòng chọn sản phẩm khác hoặc quay lại sau.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
