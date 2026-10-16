"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Package, ShieldCheck, Truck, RotateCcw } from "lucide-react";

interface ProductImageGalleryProps {
    imageSrc?: string | null;
    productName: string;
    discountPercent?: number | null;
}

export default function ProductImageGallery({
    imageSrc,
    productName,
    discountPercent,
}: ProductImageGalleryProps) {
    const [imgError, setImgError] = useState(false);

    return (
        <div className="space-y-4">
            {/* KHUNG HIỂN THỊ HÌNH ẢNH CHÍNH */}
            <div className="relative aspect-square w-full rounded-3xl bg-surface-hover/30 border border-surface-border overflow-hidden flex items-center justify-center p-6 sm:p-8 group shadow-xs">
                {/* NHÃN GIẢM GIÁ (NẾU CÓ) */}
                {discountPercent && discountPercent > 0 && (
                    <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 text-xs sm:text-sm font-black shadow-brand-sm tracking-wide">
                        GIẢM {discountPercent}%
                    </div>
                )}

                {imageSrc && !imgError ? (
                    <Image
                        src={imageSrc}
                        alt={productName}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImgError(true)}
                        priority
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-text-muted gap-2">
                        <Package className="w-16 h-16 stroke-[1.2]" />
                        <span className="text-xs font-medium">Hình ảnh sản phẩm</span>
                    </div>
                )}
            </div>

            {/* DẢI CAM KẾT CHÍNH HÃNG VÀ DỊCH VỤ DƯỚI ẢNH */}
            <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-surface-card border border-surface-border gap-1">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[11px] font-semibold text-text-main">100% Chính hãng</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-surface-card border border-surface-border gap-1">
                    <Truck className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[11px] font-semibold text-text-main">Freeship toàn quốc</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-surface-card border border-surface-border gap-1">
                    <RotateCcw className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[11px] font-semibold text-text-main">Đổi trả 7 ngày</span>
                </div>
            </div>
        </div>
    );
}
