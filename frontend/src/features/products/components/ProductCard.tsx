"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, ShoppingCart, Loader2, Star } from "lucide-react";
import { ProductResponse } from "../types";
import { formatPrice } from "@/lib/formatPrice";
import { ROUTES } from "@/constants/routes";
import { useCartStore } from "@/features/cart/stores";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { toast } from "@/common/stores/useToastStore";
import { useRouter } from "next/navigation";

interface ProductCardProps {
    product: ProductResponse;
}

export default function ProductCard({ product }: ProductCardProps) {
    const router = useRouter();
    const { addToCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const [isAdding, setIsAdding] = useState(false);

    // Tính giá hiển thị
    const currentPrice = product.sale_price ?? product.price;
    const hasDiscount = Boolean(product.discount_percent && product.discount_percent > 0);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated()) {
            toast.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
            router.push(ROUTES.AUTH.LOGIN);
            return;
        }

        setIsAdding(true);
        try {
            await addToCart({
                product_id: product.product_id,
                quantity: 1,
            });
            toast.success(`Đã thêm "${product.product_name}" vào giỏ hàng!`);
        } catch (err) {
            console.error("Lỗi khi thêm vào giỏ:", err);
            toast.error("Không thể thêm vào giỏ hàng, vui lòng thử lại!");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="group relative bg-surface-card rounded-2xl border border-surface-border p-3.5 sm:p-4 shadow-sm hover:shadow-brand-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            
            {/* BADGE GIẢM GIÁ */}
            {hasDiscount && (
                <span className="absolute top-3 left-3 bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-xs z-10">
                    -{product.discount_percent}%
                </span>
            )}

            <div>
                {/* HÌNH ẢNH SẢN PHẨM */}
                <Link
                    href={ROUTES.PRODUCTS.DETAIL(product.product_id)}
                    className="block relative w-full h-44 sm:h-48 mb-3 overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center p-2"
                >
                    <img
                        src={product.image_src || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80"}
                        alt={product.product_name}
                        className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&auto=format&fit=crop&q=80";
                        }}
                    />
                </Link>

                {/* TÊN SẢN PHẨM (2 dòng có truncate) */}
                <Link
                    href={ROUTES.PRODUCTS.DETAIL(product.product_id)}
                    className="block font-bold text-xs sm:text-sm text-text-main line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-primary transition-colors mb-2"
                    title={product.product_name}
                >
                    {product.product_name}
                </Link>

                {/* GIÁ BÁN */}
                <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                    <span className="text-sm sm:text-base font-black text-status-error">
                        {formatPrice(currentPrice)}
                    </span>
                    {product.sale_price && (
                        <span className="text-[11px] text-text-muted line-through font-medium">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>

                {/* ĐÁNH GIÁ & ĐÃ BÁN */}
                <div className="flex items-center gap-1.5 text-[11px] text-text-muted mb-3.5">
                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {Number(product.rating || 5).toFixed(1)}
                    </span>
                    <span>·</span>
                    <span>Đã bán {product.sold}</span>
                </div>
            </div>

            {/* CẶP NÚT HÀNH ĐỘNG */}
            <div className="space-y-2 pt-1">
                {/* Nút Xem chi tiết */}
                <Link
                    href={ROUTES.PRODUCTS.DETAIL(product.product_id)}
                    className="w-full py-2 px-3 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover hover:border-text-sub text-text-main text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs"
                >
                    <Eye className="w-3.5 h-3.5 text-text-sub" />
                    <span>Xem chi tiết</span>
                </Link>

                {/* Nút Thêm vào giỏ */}
                <button
                    onClick={handleAddToCart}
                    disabled={isAdding || product.quantity <= 0}
                    className="w-full py-2 px-3 rounded-xl bg-[#002b49] hover:bg-[#001c30] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow-brand-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isAdding ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang thêm...</span>
                        </>
                    ) : product.quantity <= 0 ? (
                        <span>Hết hàng</span>
                    ) : (
                        <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Thêm vào giỏ</span>
                        </>
                    )}
                </button>
            </div>

        </div>
    );
}
