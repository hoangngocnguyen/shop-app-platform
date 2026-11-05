"use client";

import React, { useEffect, useState } from "react";
import { useAdminUserStore } from "../stores";
import {
  SortDirection,
  UserDetailResponse,
  UserRole,
  UserStatus,
} from "../types";
import { UserFilterBar, UserSortBy } from "./UserFilterBar";
import { UserTable } from "./UserTable";
import { UserFormModal, UserFormValues } from "./UserFormModal";
import { UserBlockModal } from "./UserBlockModal";

const SORT_PARAMS: Record<
  UserSortBy,
  { sortBy: string; sortDir: SortDirection }
> = {
  id_desc: { sortBy: "createdAt", sortDir: SortDirection.DESC },
  name_asc: { sortBy: "fullName", sortDir: SortDirection.ASC },
  email_asc: { sortBy: "email", sortDir: SortDirection.ASC },
};

export const UserManagement: React.FC = () => {
  const {
    users,
    isLoading,
    total,
    totalPages,
    queryParams,
    fetchUsers,
    createUser,
    updateUser,
    blockUser,
    deleteUser,
    isSubmitting,
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

  const sortParams = SORT_PARAMS[sortBy];

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void fetchUsers({
      page: page - 1,
      page_size: pageSize,
      search,
      role: roleFilter === "all" ? undefined : (roleFilter as UserRole),
      status:
        statusFilter === "all"
          ? undefined
          : (statusFilter.toUpperCase() as UserStatus),
      ...sortParams,
    });
  }, [
    fetchUsers,
    page,
    pageSize,
    roleFilter,
    search,
    sortBy,
    statusFilter,
    sortParams,
  ]);

  const tableUsers = users;

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: UserDetailResponse) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleBlockToggle = (user: UserDetailResponse) => {
    setSelectedUser(user);
    setIsBlockOpen(true);
  };

  const handleDelete = async (user: UserDetailResponse) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.email}"?`)) {
      await deleteUser(user.userId);
    }
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    let succeeded: boolean;
    if (selectedUser) {
      succeeded = await updateUser(selectedUser.userId, {
        fullName: values.full_name,
        phone: values.phone ?? "",
        role: values.role as UserRole,
      });
    } else {
      succeeded = await createUser({
        fullName: values.full_name,
        email: values.email,
        phone: values.phone ?? "",
        password: values.password ?? "",
        role: values.role as UserRole,
      });
    }
    if (succeeded) setIsFormOpen(false);
  };

  const handleConfirmBlock = async () => {
    if (!selectedUser) return;

    const isCurrentlyBlocked = selectedUser.status === UserStatus.BLOCKED;
    const reason = isCurrentlyBlocked
      ? undefined
      : window.prompt("Nhập lý do khóa tài khoản")?.trim();
    if (!isCurrentlyBlocked && !reason) return;

    const succeeded = await blockUser(selectedUser.userId, {
      isBlocked: !isCurrentlyBlocked,
      reason,
    });
    if (succeeded) setIsBlockOpen(false);
  };

  const toggleAll = () => {
    const allSelected =
      tableUsers.length > 0 &&
      tableUsers.every((user) => selected.has(user.userId));
    setSelected(
      allSelected
        ? new Set()
        : new Set(tableUsers.map((user) => user.userId)),
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

  const updateFilter = (update: () => void) => {
    update();
    setPage(1);
    setSelected(new Set());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500">
            Danh sách người dùng hệ thống, phân quyền và quản lý trạng thái tài khoản.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Thêm người dùng
        </button>
      </div>

      <UserFilterBar
        searchInput={searchInput}
        onSearchChange={(value) => updateFilter(() => setSearchInput(value))}
        roleFilter={roleFilter}
        onRoleChange={(value) => updateFilter(() => setRoleFilter(value))}
        statusFilter={statusFilter}
        onStatusChange={(value) => updateFilter(() => setStatusFilter(value))}
        sortBy={sortBy}
        onSortChange={(value) => updateFilter(() => setSortBy(value))}
      />

      <UserTable
        items={tableUsers}
        isLoading={isLoading}
        search={search}
        selected={selected}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        onEdit={handleEdit}
        onToggleBlock={handleBlockToggle}
        onDelete={handleDelete}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          setSelected(new Set());
        }}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
          setSelected(new Set());
        }}
      />

      {isFormOpen && (
        <UserFormModal
          target={{
            mode: selectedUser ? "edit" : "create",
            user: selectedUser ?? undefined,
          }}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {isBlockOpen && selectedUser && (
        <UserBlockModal
          user={selectedUser}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmBlock}
          onClose={() => setIsBlockOpen(false)}
        />
      )}
    </div>
  );
};
