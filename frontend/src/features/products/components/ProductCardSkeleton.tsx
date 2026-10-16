import React from "react";
import { Skeleton } from "@/components/ui";

export default function ProductCardSkeleton() {
    return (
        <div className="bg-surface-card rounded-2xl border border-surface-border p-3.5 sm:p-4 shadow-sm space-y-3">
            {/* Ảnh skeleton */}
            <Skeleton className="w-full h-44 sm:h-48 rounded-xl" />

            {/* Tên skeleton (2 dòng) */}
            <div className="space-y-1.5 pt-1">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>

            {/* Giá skeleton */}
            <Skeleton className="h-5 w-1/2 rounded-md" />

            {/* Rating skeleton */}
            <Skeleton className="h-3.5 w-1/3 rounded-md" />

            {/* 2 nút skeleton */}
            <div className="space-y-2 pt-2">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
            </div>
        </div>
    );
}
