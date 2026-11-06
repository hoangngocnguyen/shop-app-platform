"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Eye, Shield, User, Users, UserCheck, Trash2, Lock, Unlock, Pencil } from "lucide-react";
import { getUserRoleLabel, UserDetailResponse, UserRole, UserStatus } from "../types";

const PAGE_SIZES = [10, 20, 50];

interface UserTableProps {
  items?: UserDetailResponse[];
  isLoading: boolean;
  isDeleting?: boolean;
  search: string;
  selected: Set<string>;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onView: (user: UserDetailResponse) => void;
  onEditRole: (user: UserDetailResponse) => void;
  onToggleBlock: (user: UserDetailResponse) => void;
  onDelete: (user: UserDetailResponse) => void;
  isUpdatingStatus?: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function UserTable({
  items = [],
  isLoading,
  isDeleting = false,
  search,
  selected,
  onToggleAll,
  onToggleOne,
  onView,
  onEditRole,
  onToggleBlock,
  onDelete,
  isUpdatingStatus = false,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: UserTableProps) {
  const safeItems = items ?? [];
  const allSelected =
    safeItems.length > 0 &&
    safeItems.every((user) => selected.has(String(user.userId)));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const displayTotalPages = Math.max(1, totalPages);

  const renderRoleBadge = (role: UserRole | string) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
            <Shield className="size-3" aria-hidden /> {getUserRoleLabel(role)}
          </span>
        );
      case UserRole.STAFF:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <UserCheck className="size-3" aria-hidden /> {getUserRoleLabel(role)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-active px-3 py-1 text-xs font-medium text-text-sub border border-surface-border">
            <User className="size-3" aria-hidden /> {getUserRoleLabel(role)}
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return "-";
    }
  };

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-brand-sm transition-all duration-300 hover:border-primary/25 hover:shadow-brand-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-170 text-left text-sm border-separate border-spacing-y-1.5 px-3">
          <thead className="text-text-sub">
            <tr>
              <th className="w-12 px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  disabled={isDeleting}
                  aria-label="Chọn tất cả người dùng"
                  className="size-4 cursor-pointer rounded accent-primary transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </th>
              <th className="px-4 py-3 font-medium">Họ và tên / Email</th>
              <th className="px-4 py-3 font-medium">Vai trò</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
              <th className="w-52 px-4 py-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && safeItems.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-12 animate-pulse rounded-xl bg-surface-hover" />
                  </td>
                </tr>
              ))
            ) : safeItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-surface-bg text-text-disabled shadow-xs">
                    <Users className="size-8" aria-hidden />
                  </div>
                  <p className="mt-4 font-semibold text-text-main">
                    {search ? "Không có người dùng khớp từ khóa" : "Chưa có người dùng nào"}
                  </p>
                  <p className="mt-1 text-sm text-text-sub">
                    {search ? "Thử tìm kiếm với từ khóa khác." : "Danh sách người dùng đang trống."}
                  </p>
                </td>
              </tr>
            ) : (
              safeItems.map((user) => {
                const isBlocked = user.status === UserStatus.BLOCKED;
                const isSelected = selected.has(String(user.userId));

                return (
                  <tr
                    key={String(user.userId)}
                    className={`group border border-surface-border transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-brand-sm ${
                      isSelected
                        ? "bg-primary-light/80 shadow-xs"
                        : "bg-surface-card hover:bg-surface-card"
                    }`}
                  >
                    <td className="rounded-l-xl px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleOne(String(user.userId))}
                        disabled={isDeleting}
                        aria-label={`Chọn ${user.email}`}
                        className="size-4 cursor-pointer rounded accent-primary transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-text-main group-hover:text-primary transition-colors">
                        {user.fullName || "Tài khoản người dùng"}
                      </p>
                      <p className="font-mono text-xs text-text-muted">{user.email}</p>
                    </td>
                    <td className="px-4 py-3.5">{renderRoleBadge(user.role)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        isBlocked ? "bg-status-error-bg text-status-error border border-status-error/20" : "bg-status-success-bg text-status-success border border-status-success/20"
                      }`}>
                        <span className={`size-1.5 rounded-full ${isBlocked ? "bg-status-error" : "bg-status-success animate-pulse"}`} />
                        {isBlocked ? "Đã khóa" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-text-muted font-mono">{formatDate(user.createdAt)}</td>
                    <td className="rounded-r-xl px-4 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <div className="group/viewbtn relative inline-block">
                          <div className="pointer-events-none absolute -bottom-1 left-1 right-1 h-3 rounded-full bg-primary/40 blur-md opacity-0 transition-opacity duration-300 group-hover/viewbtn:opacity-100" />
                          <button
                            type="button"
                            onClick={() => onView(user)}
                            aria-label={`Xem thông tin ${user.email}`}
                            className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-text-sub shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-active hover:text-primary"
                          >
                            <Eye className="size-4 transition-transform duration-200 group-hover/viewbtn:scale-125" aria-hidden />
                            <span className="text-xs font-medium">Xem</span>
                          </button>
                        </div>
                        <div className="group/rolebtn relative inline-block">
                          <div className="pointer-events-none absolute -bottom-1 left-1 right-1 h-3 rounded-full bg-primary/40 blur-md opacity-0 transition-opacity duration-300 group-hover/rolebtn:opacity-100" />
                          <button
                            type="button"
                            onClick={() => onEditRole(user)}
                            disabled={isUpdatingStatus}
                            aria-label={`Chỉnh sửa vai trò ${user.email}`}
                            className="relative inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-text-sub shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-light hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                          >
                            <Pencil className="size-4 transition-transform duration-200 group-hover/rolebtn:scale-125" aria-hidden />
                          </button>
                        </div>
                        <div className="group/blockbtn relative inline-block">
                          <div className="pointer-events-none absolute -bottom-1 left-1 right-1 h-3 rounded-full bg-status-warning/40 blur-md opacity-0 transition-opacity duration-300 group-hover/blockbtn:opacity-100" />
                          <button
                            type="button"
                            onClick={() => onToggleBlock(user)}
                            disabled={isUpdatingStatus}
                            aria-label={isBlocked ? `Mở khóa tài khoản ${user.email}` : `Khóa tài khoản ${user.email}`}
                            className="relative inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-text-sub shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-status-warning-bg hover:text-status-warning hover:shadow-brand-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                          >
                            {isBlocked
                              ? <Unlock className="size-4 transition-transform duration-200 group-hover/blockbtn:scale-125" aria-hidden />
                              : <Lock className="size-4 transition-transform duration-200 group-hover/blockbtn:scale-125" aria-hidden />}
                          </button>
                        </div>
                        <div className="group/delbtn relative inline-block">
                          <div className="pointer-events-none absolute -bottom-1 left-1 right-1 h-3 rounded-full bg-red-500/40 blur-md opacity-0 transition-opacity duration-300 group-hover/delbtn:opacity-100" />
                          <button
                            type="button"
                            onClick={() => onDelete(user)}
                            disabled={isDeleting}
                            aria-label={`Xóa tài khoản ${user.email}`}
                            className="relative inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-text-sub shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-status-error-bg hover:text-status-error disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                          >
                            <Trash2 className="size-4 transition-transform duration-200 group-hover/delbtn:scale-125" aria-hidden />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border px-4 py-3.5 text-sm text-text-sub bg-surface-bg/50">
        <div className="flex items-center gap-3">
          <span className="font-medium text-text-main">
            {from}–{to} <span className="text-text-muted">/ {total}</span>
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Chọn số dòng mỗi trang"
            className="rounded-xl border border-surface-border bg-surface-card px-2.5 py-1.5 text-text-main shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm cursor-pointer"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s} dòng</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Trang trước"
            className="rounded-xl border border-surface-border bg-surface-card p-2 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-light/50 hover:text-primary hover:shadow-brand-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 cursor-pointer"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <span className="px-2 font-medium text-text-main">Trang {page} / {displayTotalPages}</span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= displayTotalPages}
            aria-label="Trang sau"
            className="rounded-xl border border-surface-border bg-surface-card p-2 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-light/50 hover:text-primary hover:shadow-brand-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 cursor-pointer"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserTable;
