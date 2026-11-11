"use client";

import React, { useCallback, useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/common/stores/useToastStore";

import { adminUserApi } from "@/features/admin/user/api";
import {
  UserDetailStatisticsResponse,
  UserDetailResponse,
  UserRole,
  UserStatus,
} from "@/features/admin/user/types";
import { parseErrorMessage } from "@/lib/axios/parseError";

import { UserProfileCard } from "@/features/admin/user/components/UserProfileCard";
import { UserStatCards } from "@/features/admin/user/components/UserStatCards";
import { UserOrderHistoryTable } from "@/features/admin/user/components/UserOrderHistoryTable";
import { UserRoleModal } from "@/features/admin/user/components/UserRoleModal";
import { UserAddressListModal } from "@/features/admin/user/components/UserAddressListModal";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();

  const [data, setData] = useState<UserDetailStatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);
  const [isViewingAddresses, setIsViewingAddresses] = useState(false);

  // Filter & Pagination States
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const statisticsRequestId = useRef(0);

  // Debounce Search 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchStatistics = useCallback(async () => {
    const requestId = ++statisticsRequestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminUserApi.getUserStatistics(userId, {
        page,
        page_size: 10,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      if (requestId === statisticsRequestId.current) setData(res);
    } catch (err) {
      if (requestId === statisticsRequestId.current) {
        setError(parseErrorMessage(err, "Không thể tải thông tin chi tiết người dùng"));
      }
    } finally {
      if (requestId === statisticsRequestId.current) setIsLoading(false);
    }
  }, [page, search, statusFilter, userId]);

  useEffect(() => {
    let isActive = true;
    void Promise.resolve().then(() => {
      if (isActive) return fetchStatistics();
    });
    return () => {
      isActive = false;
      statisticsRequestId.current += 1;
    };
  }, [fetchStatistics]);

  const handleRoleConfirm = async (role: UserRole) => {
    setIsSubmittingRole(true);
    try {
      await adminUserApi.updateUserRole(userId, { role });
      toast.success("Cập nhật vai trò người dùng thành công");
      setIsEditingRole(false);
      setData((prev) => (prev ? { ...prev, role } : prev));
    } catch (err) {
      toast.error(parseErrorMessage(err, "Không thể cập nhật vai trò người dùng"));
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const userForModal: UserDetailResponse | null = data
    ? ({
        userId: data.user_id,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        role: data.role as UserRole,
        status: data.status as UserStatus,
        createdAt: data.created_at,
      } as UserDetailResponse)
    : null;

  return (
    <div className="w-full text-text-main antialiased">
      <div className="max-w-[1240px] mx-auto space-y-4 sm:space-y-5">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <UserProfileCard
            data={data}
            isLoading={isLoading}
            onEditRole={() => setIsEditingRole(true)}
            onViewAllAddresses={() => setIsViewingAddresses(true)}
          />
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

        {/* Modal Sửa Vai Trò */}
        {isEditingRole && userForModal && (
          <UserRoleModal
            user={userForModal}
            isSubmitting={isSubmittingRole}
            onConfirm={handleRoleConfirm}
            onClose={() => setIsEditingRole(false)}
          />
        )}

        {/* Modal Xem Tất Cả Địa Chỉ Giao Hàng */}
        {isViewingAddresses && data && (
          <UserAddressListModal
            addresses={data.shipping_addresses || []}
            userName={data.full_name}
            onClose={() => setIsViewingAddresses(false)}
          />
        )}
      </div>
    </div>
  );
}
