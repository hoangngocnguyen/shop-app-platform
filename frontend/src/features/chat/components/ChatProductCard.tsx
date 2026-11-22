"use client";

import React from "react";
import Link from "next/link";
import { Package, ArrowUpRight } from "lucide-react";
import type { SuggestedProductItem } from "../types";

function formatVnd(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const numeric = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(numeric)) return "";
  return `${numeric.toLocaleString("vi-VN")}đ`;
}

interface ChatProductCardProps {
  product: SuggestedProductItem;
}

export const ChatProductCard: React.FC<ChatProductCardProps> = ({ product }) => {
  const hasDiscount =
    product.sale_price !== null &&
    product.sale_price !== undefined &&
    Number(product.sale_price) < Number(product.price);
  const displayPrice = hasDiscount ? product.sale_price : product.price;
  const inStock = product.quantity > 0;

  return (
    <Link
      href={`/products/${product.product_id}`}
      className="group flex items-center gap-2.5 rounded-xl border border-surface-border bg-surface-card p-2 transition-all hover:border-primary/40 hover:shadow-xs"
    >
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-bg border border-surface-border">
        {product.image_src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_src}
            alt={product.product_name}
            className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <Package className="size-5 text-text-muted" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-text-main group-hover:text-primary">
          {product.product_name}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-xs font-bold text-primary">
            {formatVnd(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-text-muted line-through">
              {formatVnd(product.price)}
            </span>
          )}
        </div>
        <span
          className={`mt-0.5 inline-block text-[10px] font-medium ${
            inStock ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {inStock ? "Còn hàng" : "Hết hàng"}
        </span>
      </div>

      <ArrowUpRight
        className="size-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
};
