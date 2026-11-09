"use client";

import React from "react";
import { Search, Shield, UserCheck, ArrowUpDown, ChevronDown } from "lucide-react";
import { UserRole, USER_ROLE_LABELS } from "../types";

export type UserSortBy = "id_desc" | "name_asc" | "email_asc";

export const SORT_OPTIONS: { value: UserSortBy; label: string }[] = [
  { value: "id_desc", label: "Mới nhất" },
  { value: "name_asc", label: "Tên A → Z" },
  { value: "email_asc", label: "Email A → Z" },
];

interface UserFilterBarProps {
  searchInput: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  sortBy: UserSortBy;
  onSortChange: (val: UserSortBy) => void;
}

export function UserFilterBar({
  searchInput,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}: UserFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-surface-border bg-surface-card/90 p-4 shadow-brand-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-brand-md">
      {/* Ô tìm kiếm từ khóa */}
      <div className="relative min-w-[240px] flex-1 transition-all duration-300 hover:-translate-y-0.5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên, email, sđt hoặc ID..."
          aria-label="Tìm kiếm người dùng"
          className="w-full rounded-xl border border-surface-border bg-surface-card py-2.5 pl-10 pr-3.5 text-sm text-text-main placeholder:text-text-muted shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15"
        />
      </div>

      {/* Lọc theo Vai trò */}
      <div className="relative transition-all duration-300 hover:-translate-y-0.5">
        <Shield className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden />
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          aria-label="Lọc theo vai trò"
          className="rounded-xl border border-surface-border bg-surface-card py-2.5 pl-9 pr-9 text-sm text-text-main shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15 cursor-pointer appearance-none"
        >
          <option value="all">Tất cả vai trò</option>
          <option value={UserRole.ADMIN}>{USER_ROLE_LABELS[UserRole.ADMIN]}</option>
          <option value={UserRole.STAFF}>{USER_ROLE_LABELS[UserRole.STAFF]}</option>
          <option value={UserRole.CUSTOMER}>{USER_ROLE_LABELS[UserRole.CUSTOMER]}</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden />
      </div>

      {/* Lọc theo Trạng thái */}
      <div className="relative transition-all duration-300 hover:-translate-y-0.5">
        <UserCheck className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden />
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Lọc theo trạng thái"
          className="rounded-xl border border-surface-border bg-surface-card py-2.5 pl-9 pr-9 text-sm text-text-main shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15 cursor-pointer appearance-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động (ACTIVE)</option>
          <option value="blocked">Đã khóa (BLOCKED)</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden />
      </div>

      {/* Sắp xếp */}
      <div className="relative transition-all duration-300 hover:-translate-y-0.5">
        <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as UserSortBy)}
          aria-label="Sắp xếp danh sách"
          className="rounded-xl border border-surface-border bg-surface-card py-2.5 pl-9 pr-9 text-sm text-text-main shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-brand-sm focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15 cursor-pointer appearance-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden />
      </div>
    </div>
  );
}

export default UserFilterBar;