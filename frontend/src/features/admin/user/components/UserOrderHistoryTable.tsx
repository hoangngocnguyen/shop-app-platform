"use client";

import React from "react";
import { Calendar, Search } from "lucide-react";
import { UserOrdersPaginated } from "../types";

interface UserOrderHistoryTableProps {
  orders?: UserOrdersPaginated;
  isLoading: boolean;
  searchInput: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  page: number;
  onPageChange: (page: number) => void;
}

export function UserOrderHistoryTable({
  orders,
  isLoading,
  searchInput,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  onPageChange,
}: UserOrderHistoryTableProps) {
  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-brand-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
          <Calendar className="size-5 text-primary" /> Lịch sử đơn hàng
        </h3>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <input
              type="text"
              placeholder="Mã đơn / Người nhận..."
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-bg pl-9 pr-3 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-xl border border-surface-border bg-surface-bg px-3 py-1.5 text-sm outline-none focus:border-primary cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-surface-border text-text-sub">
              <th className="py-3 px-4 font-medium">Mã đơn hàng</th>
              <th className="py-3 px-4 font-medium">Người nhận</th>
              <th className="py-3 px-4 font-medium">Tổng tiền</th>
              <th className="py-3 px-4 font-medium">Trạng thái</th>
              <th className="py-3 px-4 font-medium">Ngày đặt</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="py-3 px-4">
                    <div className="h-8 animate-pulse bg-surface-hover rounded-lg" />
                  </td>
                </tr>
              ))
            ) : !orders?.items || orders.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-sub">
                  Không tìm thấy lịch sử đơn hàng nào.
                </td>
              </tr>
            ) : (
              orders.items.map((order) => (
                <tr key={order.order_id} className="border-b border-surface-border/50 hover:bg-surface-hover">
                  <td className="py-3 px-4 font-mono font-semibold text-primary">{order.order_id}</td>
                  <td className="py-3 px-4">{order.recipient_name}</td>
                  <td className="py-3 px-4 font-semibold">{formatVND(order.total_amount)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-bg border border-surface-border">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-text-muted">
                    {new Date(order.created_at).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {orders && orders.total_pages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm text-text-sub">
          <span>
            Trang {orders.page} / {orders.total_pages} (Tổng {orders.total} đơn)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-surface-border bg-surface-bg disabled:opacity-40 cursor-pointer"
            >
              Trước
            </button>
            <button
              disabled={page >= orders.total_pages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-surface-border bg-surface-bg disabled:opacity-40 cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}