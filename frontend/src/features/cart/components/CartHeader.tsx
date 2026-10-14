import React from "react";
import Link from "next/link";
import { ShoppingBag, Home } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface CartHeaderProps {
    title?: string;
    description?: string;
}

export default function CartHeader({
    title = "Giỏ hàng",
    description = "Quản lý các sản phẩm trong giỏ hàng của bạn",
}: CartHeaderProps) {
    return (
        <div className="flex items-center justify-between bg-surface-card p-4 sm:p-6 rounded-2xl border border-surface-border shadow-brand-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                    <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-text-main">{title}</h1>
                    <p className="text-xs text-text-muted">{description}</p>
                </div>
            </div>
            <Link
                href={ROUTES.HOME}
                className="w-10 h-10 rounded-xl border border-surface-border flex items-center justify-center text-text-sub hover:bg-surface-hover hover:text-text-main transition-colors"
                title="Trang chủ"
            >
                <Home className="w-5 h-5" />
            </Link>
        </div>
    );
}

