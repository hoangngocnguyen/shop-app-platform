"use client";

import React from "react";
import { ShoppingBag, CreditCard } from "lucide-react";

interface UserStatCardsProps {
  totalOrders: number;
  totalSpent: number;
  isLoading: boolean;
}

export function UserStatCards({ totalOrders, totalSpent, isLoading }: UserStatCardsProps) {
  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-brand-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-text-sub uppercase tracking-wider">Tổng đơn hàng</p>
          <p className="text-3xl font-extrabold text-text-main mt-2">
            {isLoading ? "..." : totalOrders}
          </p>
        </div>
        <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <ShoppingBag className="size-6" />
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-brand-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-text-sub uppercase tracking-wider">Tổng chi tiêu</p>
          <p className="text-2xl font-extrabold text-primary mt-2">
            {isLoading ? "..." : formatVND(totalSpent)}
          </p>
        </div>
        <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CreditCard className="size-6" />
        </div>
      </div>
    </div>
  );
}