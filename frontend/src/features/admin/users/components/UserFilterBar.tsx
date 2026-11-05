"use client";

import React from "react";
import { Search, Shield, UserCheck, ArrowUpDown } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-3 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-surface-border shadow-sm">
      <div className="relative min-w-[240px] flex-1 transition-all duration-300 hover:-translate-y-0.5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          className="w-full rounded-xl border border-surface-border bg-surface-card py-2.5 pl-10 pr-3.5 text-sm text-text-main placeholder:text-text-muted shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15"
        />
      </div>

      <div className="relative transition-all duration-300 hover:-translate-y-0.5">
        <Shield className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden />
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="rounded-xl border border-surface-border bg-surface-card py-2.5 pl-9 pr-8 text-sm text-text-main shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15 cursor-pointer appearance-none"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="ADMIN">ADMIN</option>
          <option value="CUSTOMER">CUSTOMER</option>
        </select>
      </div>

      <div className="relative transition-all duration-300 hover:-translate-y-0.5">
        <UserCheck className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden />
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-surface-border bg-surface-card py-2.5 pl-9 pr-8 text-sm text-text-main shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15 cursor-pointer appearance-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="blocked">Đã khóa</option>
        </select>
      </div>

      <div className="relative transition-all duration-300 hover:-translate-y-0.5">
        <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" aria-hidden />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as UserSortBy)}
          className="rounded-xl border border-surface-border bg-surface-card py-2.5 pl-9 pr-8 text-sm text-text-main shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15 cursor-pointer appearance-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}