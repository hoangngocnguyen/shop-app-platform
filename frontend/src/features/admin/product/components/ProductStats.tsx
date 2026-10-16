"use client";

import React from "react";
import { Package, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { PaginatedProductResponse } from "../types";

interface ProductStatsProps {
  data: PaginatedProductResponse | null;
}

export const ProductStats: React.FC<ProductStatsProps> = ({ data }) => {
  const items = data?.items || [];
  const totalProducts = data?.total || 0;
  const lowStockCount = items.filter((p) => p.quantity > 0 && p.quantity <= 5).length;
  const outOfStockCount = items.filter((p) => p.quantity === 0).length;
  const totalValue = items.reduce((acc, p) => acc + p.price * p.quantity, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-(--color-surface-card) border border-(--color-surface-border) rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-(--color-text-sub) uppercase tracking-wider">Tổng sản phẩm</p>
          <h4 className="text-2xl font-bold text-(--color-text-main) mt-1">{totalProducts}</h4>
        </div>
        <div className="w-10 h-10 rounded-lg bg-(--color-primary-light) text-(--color-primary) flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-(--color-surface-card) border border-(--color-surface-border) rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-(--color-text-sub) uppercase tracking-wider">Sắp hết hàng</p>
          <h4 className="text-2xl font-bold text-(--color-status-warning) mt-1">{lowStockCount}</h4>
        </div>
        <div className="w-10 h-10 rounded-lg bg-(--color-status-warning-bg) text-(--color-status-warning) flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-(--color-surface-card) border border-(--color-surface-border) rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-(--color-text-sub) uppercase tracking-wider">Hết hàng</p>
          <h4 className="text-2xl font-bold text-(--color-status-error) mt-1">{outOfStockCount}</h4>
        </div>
        <div className="w-10 h-10 rounded-lg bg-(--color-status-error-bg) text-(--color-status-error) flex items-center justify-center">
          <XCircle className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-(--color-surface-card) border border-(--color-surface-border) rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-(--color-text-sub) uppercase tracking-wider">Giá trị tồn kho (Trang hiện tại)</p>
          <h4 className="text-xl font-bold text-(--color-text-main) mt-1">
            {totalValue.toLocaleString("vi-VN")} đ
          </h4>
        </div>
        <div className="w-10 h-10 rounded-lg bg-(--color-status-info-bg) text-(--color-status-info) flex items-center justify-center">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};