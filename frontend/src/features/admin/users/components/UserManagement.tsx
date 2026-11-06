"use client";

import React, { useEffect, useState } from "react";
import { toast } from "@/common/stores/useToastStore";
import { useAdminUserStore } from "../stores";
import { SortDirection, UserDetailResponse, UserRole, UserStatus } from "../types";
import { UserHeroBanner } from "./UserHeroBanner";
import { UserHeaderBar } from "./UserHeaderBar";
import { UserFilterBar, UserSortBy } from "./UserFilterBar";
import { UserBulkActionBar } from "./UserBulkActionBar";
import { UserTable } from "./UserTable";
import { UserFormModal, UserFormValues } from "./UserFormModal";
import { UserBlockModal } from "./UserBlockModal";

const SORT_PARAMS: Record<UserSortBy, { sortBy: string; sortDir: SortDirection }> = {
  id_desc: { sortBy: "createdAt", sortDir: SortDirection.DESC },
  name_asc: { sortBy: "fullName", sortDir: SortDirection.ASC },
  email_asc: { sortBy: "email", sortDir: SortDirection.ASC },
};

export const UserManagement: React.FC = () => {
  const {
    users, isLoading, total, totalPages, queryParams, isSubmitting,
    fetchUsers, createUser, updateUser, blockUser, deleteUser,
  } = useAdminUserStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const safeUsers = users ?? [];

  // Quản lý chọn checkbox
  const toggleAll = () => {
    const allSelected = safeUsers.length > 0 && safeUsers.every((u) => selected.has(String(u.userId)));
    setSelected(allSelected ? new Set() : new Set(safeUsers.map((u) => String(u.userId))));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Thao tác xóa (1 người dùng hoặc hàng loạt)
  const handleDeleteBatch = async (ids: (string | number)[], label: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${label}?`)) return;

    let allDeleted = true;
    for (const id of ids) {
      const ok = await deleteUser(id);
      if (!ok) allDeleted = false;
    }
    setSelected(new Set());
    if (allDeleted) {
      toast.success("Đã xóa người dùng thành công");
    } else {
      toast.error("Không thể xóa một số tài khoản");
    }
  };

  // Submit Form Thêm/Sửa (không truyền nhầm password hay secret key khi sửa)
  const handleFormSubmit = async (values: UserFormValues) => {
    const isEdit = Boolean(selectedUser);
    const succeeded = isEdit && selectedUser
      ? await updateUser(selectedUser.userId, {
          fullName: values.full_name.trim(),
          phone: values.phone.trim(),
          address: values.address?.trim() || undefined,
          role: values.role,
        })
      : await createUser({
          fullName: values.full_name.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim(),
          password: values.password ?? "",
          role: values.role,
        });

    if (succeeded) {
      toast.success(isEdit ? "Đã cập nhật thông tin thành công" : "Đã tạo tài khoản thành công");
      setIsFormOpen(false);
    } else {
      toast.error("Không thể lưu thông tin người dùng");
    }
  };

  // Xác nhận Khóa / Mở khóa (Lấy lý do từ Modal)
  const handleConfirmBlock = async (reason?: string) => {
    if (!selectedUser) return;

    const isBlocked = selectedUser.status === UserStatus.BLOCKED;
    const succeeded = await blockUser(selectedUser.userId, {
      isBlocked: !isBlocked,
      reason: !isBlocked ? reason?.trim() : undefined,
    });

    if (succeeded) {
      toast.success(isBlocked ? `Đã mở khóa tài khoản ${selectedUser.email}` : `Đã khóa tài khoản ${selectedUser.email}`);
      setIsBlockOpen(false);
    } else {
      toast.error("Thao tác khóa/mở khóa thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg text-text-main antialiased selection:bg-primary selection:text-white">
      <main className="max-w-[1240px] mx-auto px-4 py-6 md:py-10 space-y-8">
        {/* Banner Hero */}
        <UserHeroBanner total={total} />

        {/* Thanh Header & Nút Thêm */}
        <UserHeaderBar onAddUser={() => { setSelectedUser(null); setIsFormOpen(true); }} />

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

        {/* Thanh Thao Tác Hàng Loạt */}
        <UserBulkActionBar
          selectedCount={selected.size}
          isSubmitting={isSubmitting}
          onClearSelection={() => setSelected(new Set())}
          onDeleteSelected={() => void handleDeleteBatch(Array.from(selected), `${selected.size} tài khoản đã chọn`)}
        />

        {/* Bảng Dữ Liệu */}
        <UserTable
          items={safeUsers}
          isLoading={isLoading}
          search={search}
          selected={selected}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onEdit={(user) => { setSelectedUser(user); setIsFormOpen(true); }}
          onToggleBlock={(user) => { setSelectedUser(user); setIsBlockOpen(true); }}
          onDelete={(user) => void handleDeleteBatch([user.userId], `tài khoản "${user.email}"`)}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={(p) => { setPage(p); setSelected(new Set()); }}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); setSelected(new Set()); }}
        />

        {/* Modal Thêm/Sửa */}
        {isFormOpen && (
          <UserFormModal
            target={{ mode: selectedUser ? "edit" : "create", user: selectedUser ?? undefined }}
            isSubmitting={isSubmitting}
            onSubmit={handleFormSubmit}
            onClose={() => setIsFormOpen(false)}
          />
        )}

        {/* Modal Khóa/Mở khóa */}
        {isBlockOpen && selectedUser && (
          <UserBlockModal
            user={selectedUser}
            isSubmitting={isSubmitting}
            onConfirm={handleConfirmBlock}
            onClose={() => setIsBlockOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

export default UserManagement;
