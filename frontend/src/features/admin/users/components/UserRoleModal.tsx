"use client";

import React, { useState } from "react";
import { Shield } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { UserDetailResponse, UserRole } from "../types";

interface UserRoleModalProps {
  user: UserDetailResponse;
  isSubmitting: boolean;
  onConfirm: (role: UserRole) => void | Promise<void>;
  onClose: () => void;
}

const ROLE_OPTIONS = [
  { value: UserRole.CUSTOMER, label: "Khách hàng" },
  { value: UserRole.STAFF, label: "Nhân viên" },
  { value: UserRole.ADMIN, label: "Quản trị viên" },
];

export function UserRoleModal({
  user,
  isSubmitting,
  onConfirm,
  onClose,
}: UserRoleModalProps) {
  const [role, setRole] = useState<UserRole>(user.role as UserRole);
  const roleChanged = role !== user.role;

  return (
    <ModalShell title="Chỉnh sửa vai trò" onClose={onClose} size="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary-light/60 p-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-brand-sm">
          <Shield className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <p className="text-sm leading-relaxed text-text-sub">
            Chỉ vai trò hệ thống của <strong className="text-text-main">{user.email}</strong> sẽ
            được thay đổi. Thông tin cá nhân và địa chỉ không bị ảnh hưởng.
          </p>
        </div>

        <div className="space-y-1.5 transition-transform duration-200 hover:-translate-y-0.5">
          <label htmlFor="user-system-role" className="block text-xs font-semibold text-text-main">
            Vai trò hệ thống
          </label>
          <select
            id="user-system-role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-surface-border bg-surface-card px-3 py-2.5 text-sm text-text-main shadow-xs outline-none transition-all duration-200 hover:border-primary/40 hover:shadow-brand-sm focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.value})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-surface-border bg-surface-card px-4 py-2.5 text-sm font-medium text-text-main shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-light/50 hover:text-primary hover:shadow-brand-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => void onConfirm(role)}
            disabled={isSubmitting || !roleChanged}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-contrast shadow-brand-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-brand-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu vai trò"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default UserRoleModal;
