import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface ProductBreadcrumbProps {
    categoryName?: string | null;
    productName: string;
}

export default function ProductBreadcrumb({
    categoryName,
    productName,
}: ProductBreadcrumbProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-text-sub py-3 sm:py-4 overflow-x-auto whitespace-nowrap scrollbar-none"
        >
            <Link
                href={ROUTES.HOME}
                className="flex items-center gap-1 hover:text-primary transition-colors font-medium shrink-0"
            >
                <Home className="w-3.5 h-3.5" />
                <span>Trang chủ</span>
            </Link>

            {categoryName && (
                <>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="hover:text-primary transition-colors font-medium cursor-pointer shrink-0">
                        {categoryName}
                    </span>
                </>
            )}

            <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="text-text-main font-semibold truncate max-w-[200px] sm:max-w-md">
                {productName}
            </span>
        </nav>
    );
}
