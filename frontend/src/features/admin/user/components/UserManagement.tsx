"use client";

import React, { useEffect, useState } from "react";
import { toast } from "@/common/stores/useToastStore";
import { useAdminUserStore } from "../stores";
import { SortDirection, UserDetailResponse, UserRole, UserStatus } from "../types";
import { UserHeroBanner } from "./UserHeroBanner";
import { UserHeaderBar } from "./UserHeaderBar";
import { UserFilterBar, UserSortBy } from "./UserFilterBar";
import { UserTable } from "./UserTable";
import { UserDetailsModal } from "./UserDetailsModal";
import { UserBlockModal } from "./UserBlockModal";
import { UserRoleModal } from "./UserRoleModal";
import { UserBulkActionBar } from "./UserBulkActionBar";

const SORT_PARAMS: Record<UserSortBy, { sortBy: string; sortDir: SortDirection }> = {
  id_desc: { sortBy: "createdAt", sortDir: SortDirection.DESC },
  name_asc: { sortBy: "fullName", sortDir: SortDirection.ASC },
  email_asc: { sortBy: "email", sortDir: SortDirection.ASC },
};

export const UserManagement: React.FC = () => {
  const {
    users, isLoading, isSubmitting, total, totalPages, stats, queryParams, fetchUsers, fetchUserStats, deleteUser, blockUser, updateUserRole,
  } = useAdminUserStore();

  const [viewedUser, setViewedUser] = useState<UserDetailResponse | null>(null);
  const [blockTarget, setBlockTarget] = useState<UserDetailResponse | null>(null);
  const [roleTarget, setRoleTarget] = useState<UserDetailResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchInput, setSearchInput] = useState(queryParams.search ?? "");
  const [search, setSearch] = useState(queryParams.search ?? "");
  const [roleFilter, setRoleFilter] = useState<string>(queryParams.role ?? "all");
  const [statusFilter, setStatusFilter] = useState<string>(queryParams.status ?? "all");
  const [sortBy, setSortBy] = useState<UserSortBy>("id_desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(queryParams.page_size ?? 10);

  // Debounce ô tìm kiếm 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== search) {
        setSearch(searchInput.trim());
        setPage(1);
        setSelected(new Set());
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  // Fetch dữ liệu với 0-based pagination (page - 1)
  useEffect(() => {
    const sortParams = SORT_PARAMS[sortBy];
    void fetchUsers({
      page: page - 1,
      page_size: pageSize,
      search,
      role: roleFilter === "all" ? undefined : (roleFilter as UserRole),
      status: statusFilter === "all" ? undefined : (statusFilter.toUpperCase() as UserStatus),
      ...sortParams,
    });
  }, [fetchUsers, page, pageSize, roleFilter, search, sortBy, statusFilter]);

  useEffect(() => {
    void fetchUserStats();
  }, [fetchUserStats]);

  const safeUsers = users ?? [];
  const toggleAll = () => {
    const allSelected =
      safeUsers.length > 0 &&
      safeUsers.every((user) => selected.has(String(user.userId)));
    setSelected(
      allSelected
        ? new Set()
        : new Set(safeUsers.map((user) => String(user.userId))),
    );
  };
  const toggleOne = (id: string) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteBatch = async (ids: string[], targetLabel: string) => {
    if (isDeleting) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${targetLabel}? Dữ liệu địa chỉ giao hàng cũng sẽ bị xóa.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      let deletedCount = 0;
      for (const id of ids) {
        if (await deleteUser(id)) deletedCount += 1;
      }

      setSelected(new Set());
      if (deletedCount === ids.length) {
        toast.success(ids.length === 1 ? "Đã xóa tài khoản thành công" : `Đã xóa ${deletedCount} tài khoản thành công`);
      } else {
        toast.error(
          deletedCount
            ? `Đã xóa ${deletedCount}/${ids.length} tài khoản. Một số tài khoản không thể xóa do còn đơn hàng hoặc dữ liệu liên quan.`
            : "Không thể xóa tài khoản có đơn hàng hoặc dữ liệu liên quan.",
        );
      }

      const nextPage =
        page > 1 && (page - 1) * pageSize >= total - deletedCount
          ? page - 1
          : page;
      if (nextPage !== page) setPage(nextPage);
      else await fetchUsers({ page: nextPage - 1, page_size: pageSize });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBlockConfirm = async (reason?: string) => {
    if (!blockTarget) return;

    const isBlocked = blockTarget.status === UserStatus.BLOCKED;
    const succeeded = await blockUser(blockTarget.userId, {
      isBlocked: !isBlocked,
      reason,
    });

    if (!succeeded) {
      toast.error("Không thể thay đổi trạng thái tài khoản");
      return;
    }

    toast.success(
      isBlocked
        ? `Đã mở khóa tài khoản ${blockTarget.email}`
        : `Đã khóa tài khoản ${blockTarget.email}`,
    );
    setBlockTarget(null);
  };

  const handleRoleConfirm = async (role: UserRole) => {
    if (!roleTarget) return;

    const succeeded = await updateUserRole(roleTarget.userId, { role });
    if (!succeeded) {
      toast.error("Không thể cập nhật vai trò người dùng");
      return;
    }

    toast.success(`Đã cập nhật vai trò của ${roleTarget.email}`);
    setRoleTarget(null);
  };

  return (
    <div className="min-h-screen bg-surface-bg text-text-main antialiased selection:bg-primary selection:text-primary-contrast">
      <main className="max-w-[1240px] mx-auto px-4 py-6 md:py-10 space-y-8">
        <UserHeaderBar />

        {/* Banner thống kê */}
        <UserHeroBanner stats={stats} />

        {/* Thanh Bộ Lọc & Tìm Kiếm */}
        <UserFilterBar
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          roleFilter={roleFilter}
          onRoleChange={(v) => { setRoleFilter(v); setPage(1); setSelected(new Set()); }}
          statusFilter={statusFilter}
          onStatusChange={(v) => { setStatusFilter(v); setPage(1); setSelected(new Set()); }}
          sortBy={sortBy}
          onSortChange={(v) => { setSortBy(v); setPage(1); setSelected(new Set()); }}
        />

        <UserBulkActionBar
          selectedCount={selected.size}
          isSubmitting={isSubmitting || isDeleting}
          onClearSelection={() => setSelected(new Set())}
          onDeleteSelected={() =>
            void handleDeleteBatch(Array.from(selected), `${selected.size} tài khoản đã chọn`)
          }
        />

        {/* Bảng Dữ Liệu */}
        <UserTable
          items={safeUsers}
          isLoading={isLoading}
          isDeleting={isDeleting}
          search={search}
          selected={selected}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onView={setViewedUser}
          onEditRole={setRoleTarget}
          onToggleBlock={setBlockTarget}
          onDelete={(user) =>
            void handleDeleteBatch([String(user.userId)], `“${user.email}”`)
          }
          isUpdatingStatus={isSubmitting}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={(nextPage) => { setPage(nextPage); setSelected(new Set()); }}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); setSelected(new Set()); }}
        />

        {viewedUser && (
          <UserDetailsModal user={viewedUser} onClose={() => setViewedUser(null)} />
        )}
        {blockTarget && (
          <UserBlockModal
            user={blockTarget}
            isSubmitting={isSubmitting}
            onConfirm={handleBlockConfirm}
            onClose={() => setBlockTarget(null)}
          />
        )}
        {roleTarget && (
          <UserRoleModal
            user={roleTarget}
            isSubmitting={isSubmitting}
            onConfirm={handleRoleConfirm}
            onClose={() => setRoleTarget(null)}
          />
        )}
      </main>
    </div>
  );
};

export default UserManagement;
