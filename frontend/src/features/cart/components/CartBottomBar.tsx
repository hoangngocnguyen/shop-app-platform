import React from "react";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";

interface CartBottomBarProps {
    totalPrice: number;
    selectedCount: number;
    onCheckout?: () => void;
}

export default function CartBottomBar({
    totalPrice,
    selectedCount,
    onCheckout,
}: CartBottomBarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-surface-border shadow-lg py-4 px-4 sm:px-6 z-40">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-text-sub">Tổng cộng:</span>
                        <span className="text-xl font-bold text-status-error">
                            {formatPrice(totalPrice)}
                        </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                        Phí vận chuyển và các chi phí khác sẽ được tính tại bước thanh toán.
                    </p>
                </div>

                <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={onCheckout}
                    className="px-8 py-3 bg-status-error hover:bg-status-error/90 text-white font-bold text-sm rounded-xl transition-all shadow-brand-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                    <span>Mua ngay</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
