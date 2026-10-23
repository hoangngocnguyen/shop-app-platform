"use client";

import React from "react";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { PaginatedProductResponse, StockStatus } from "../types";

interface ProductStatsProps {
  data: PaginatedProductResponse | null;
  activeStockStatus?: StockStatus;
  onSelectStockStatus?: (status: StockStatus) => void;
}

export const ProductStats: React.FC<ProductStatsProps> = ({
  data,
  activeStockStatus = "all",
  onSelectStockStatus,
}) => {
  const items = data?.items || [];
  const totalProducts = data?.total || 0;

  // Tính toán nhanh trên danh sách hiện tại
  const inStockCount = items.filter((p) => p.quantity > 5).length;
  const lowStockCount = items.filter((p) => p.quantity > 0 && p.quantity <= 5).length;
  const outOfStockCount = items.filter((p) => p.quantity === 0).length;

  const statCards = [
    {
      id: "all" as StockStatus,
      label: "Tổng sản phẩm",
      value: totalProducts,
      subtext: "Toàn bộ danh mục sản phẩm",
      icon: Package,
      colorClass: "text-primary bg-primary-light border-primary/20",
      activeRing: "ring-2 ring-primary border-primary shadow-brand-sm",
      badgeColor: "bg-primary-light text-primary",
    },
    {
      id: "in_stock" as StockStatus,
      label: "Tồn kho an toàn",
      value: inStockCount,
      subtext: "Số lượng trên 5 sản phẩm",
      icon: CheckCircle2,
      colorClass: "text-status-success bg-status-success-bg border-status-success/20",
      activeRing: "ring-2 ring-status-success border-status-success shadow-sm",
      badgeColor: "bg-status-success-bg text-status-success",
    },
    {
      id: "low_stock" as StockStatus,
      label: "Cảnh báo sắp hết",
      value: lowStockCount,
      subtext: "Tồn kho dưới 5 sản phẩm",
      icon: AlertTriangle,
      colorClass: "text-status-warning bg-status-warning-bg border-status-warning/20",
      activeRing: "ring-2 ring-status-warning border-status-warning shadow-sm",
      badgeColor: "bg-status-warning-bg text-status-warning",
    },
    {
      id: "out_of_stock" as StockStatus,
      label: "Hết hàng",
      value: outOfStockCount,
      subtext: "Cần nhập kho bổ sung ngay",
      icon: XCircle,
      colorClass: "text-status-error bg-status-error-bg border-status-error/20",
      activeRing: "ring-2 ring-status-error border-status-error shadow-sm",
      badgeColor: "bg-status-error-bg text-status-error",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStockStatus === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStockStatus?.(card.id)}
            className={`group text-left relative bg-surface-card border rounded-2xl p-4.5 transition-all duration-200 cursor-pointer overflow-hidden ${
              isActive
                ? `${card.activeRing} bg-surface-card`
                : "border-surface-border hover:border-primary/40 hover:bg-surface-hover/60 hover:-translate-y-0.5 hover:shadow-brand-sm"
            }`}
          >
            {/* Background decorative glow on active */}
            {isActive && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-light/50 rounded-full blur-2xl pointer-events-none" />
            )}

            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-semibold text-text-sub uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${card.colorClass}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-2xl font-black text-text-main tracking-tight">
                {card.value.toLocaleString("vi-VN")}
              </h3>
              {isActive && (
                <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Đang lọc
                </span>
              )}
            </div>

            <p className="text-[12px] text-text-muted mt-1.5 flex items-center gap-1.5">
              <span>{card.subtext}</span>
            </p>
          </button>
        );
      })}
    </div>
  );
};
