import React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface CartEmptyStateProps {
    message?: string;
    actionText?: string;
}

export default function CartEmptyState({
    message = "Giỏ hàng của bạn đang trống",
    actionText = "Tiếp tục mua sắm",
}: CartEmptyStateProps) {
    return (
        <div className="text-center py-16 text-text-muted text-sm space-y-3">
            <ShoppingBag className="w-12 h-12 mx-auto opacity-30 text-text-sub" />
            <p className="text-text-main font-medium">{message}</p>
            <Link
                href={ROUTES.HOME}
                className="inline-block px-4 py-2 bg-primary text-primary-contrast rounded-xl text-xs font-semibold shadow-brand-sm hover:bg-primary-hover transition-colors"
            >
                {actionText}
            </Link>
        </div>
    );
}

