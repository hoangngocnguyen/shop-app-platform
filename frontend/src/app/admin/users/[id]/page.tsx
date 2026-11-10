"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { adminUserApi } from "@/features/admin/user/api";
import { UserDetailStatisticsResponse } from "@/features/admin/user/types";
import { parseErrorMessage } from "@/lib/axios/parseError";

import { UserProfileCard } from "@/features/admin/user/components/UserProfileCard";
import { UserStatCards } from "@/features/admin/user/components/UserStatCards";
import { UserOrderHistoryTable } from "@/features/admin/user/components/UserOrderHistoryTable";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();

  const [data, setData] = useState<UserDetailStatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination States
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce Search 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminUserApi.getUserStatistics(userId, {
        page,
        page_size: 10,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setData(res);
    } catch (err) {
      setError(parseErrorMessage(err, "Không thể tải thông tin chi tiết người dùng"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchStatistics();
  }, [userId, page, statusFilter, search]);

  return (
    <div className="min-h-screen bg-surface-bg p-6 text-text-main antialiased">
      <div className="max-w-[1240px] mx-auto space-y-6">
        <button
          onClick={() => router.push("/admin/users")}
          className="inline-flex items-center gap-2 text-sm font-medium text-text-sub hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách người dùng
        </button>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => void fetchStatistics()} className="font-semibold underline">
              Thử lại
            </button>
          </div>
        )}

        {/* Khối Thông tin cá nhân & Thống kê */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UserProfileCard data={data} isLoading={isLoading} />
          <UserStatCards
            totalOrders={data?.total_orders ?? 0}
            totalSpent={data?.total_spent ?? 0}
            isLoading={isLoading}
          />
        </div>

        {/* Khối Bảng Lịch sử Đơn hàng */}
        <UserOrderHistoryTable
          orders={data?.orders}
          isLoading={isLoading}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          statusFilter={statusFilter}
          onStatusFilterChange={(val: string) => {
            setStatusFilter(val);
            setPage(1);
          }}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}