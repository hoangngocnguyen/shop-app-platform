"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Lock, Shield, MapPin } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { UserDetailResponse, UserRole } from "../types";

export interface UserFormValues {
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  password?: string;
  role: string;
}

type UserFormUser = Partial<UserDetailResponse> & {
  full_name?: string;
  name?: string;
};

interface UserFormModalProps {
  target: { mode: "create" | "edit"; user?: UserFormUser };
  isSubmitting: boolean;
  onSubmit: (values: UserFormValues) => void | Promise<void>;
  onClose: () => void;
}

export function UserFormModal({
  target,
  isSubmitting,
  onSubmit,
  onClose,
}: UserFormModalProps) {
  const isEdit = target.mode === "edit";
  const user = target.user;

  const [formData, setFormData] = useState<UserFormValues>({
    full_name: user?.fullName || user?.full_name || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    password: "",
    role: (user?.role as string) || UserRole.CUSTOMER,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit(formData);
  };

  return (
    <ModalShell
      title={isEdit ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Họ và tên */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-sub">
            <User className="size-3.5 text-text-muted" />
            <span>Họ và tên <span className="text-status-error">*</span></span>
          </label>
          <input
            type="text"
            required
            maxLength={256}
            placeholder="Nhập họ và tên..."
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15"
          />
        </div>

        {/* Email (Khóa khi sửa để tránh thay đổi định danh) */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-sub">
            <Mail className="size-3.5 text-text-muted" />
            <span>Email {!isEdit && <span className="text-status-error">*</span>}</span>
          </label>
          <input
            type="email"
            required={!isEdit}
            disabled={isEdit}
            placeholder="example@domain.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15 disabled:translate-y-0 disabled:bg-surface-hover disabled:text-text-muted disabled:cursor-not-allowed disabled:hover:shadow-xs"
          />
        </div>

        {/* Số điện thoại */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-sub">
            <Phone className="size-3.5 text-text-muted" />
            <span>Số điện thoại <span className="text-status-error">*</span></span>
          </label>
          <input
            type="tel"
            required
            pattern="^(0|\+84)[0-9]{9}$"
            placeholder="0987xxxxxx"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15"
          />
        </div>

        {/* Địa chỉ (Nếu sửa) */}
        {isEdit && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-text-sub">
              <MapPin className="size-3.5 text-text-muted" />
              <span>Địa chỉ</span>
            </label>
            <input
              type="text"
              maxLength={255}
              placeholder="Nhập địa chỉ người dùng..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15"
            />
          </div>
        )}

        {/* Mật khẩu (Chỉ hiển thị khi TẠO MỚI, bảo mật không lộ key) */}
        {!isEdit && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-text-sub">
              <Lock className="size-3.5 text-text-muted" />
              <span>Mật khẩu (Tối thiểu 6 ký tự) <span className="text-status-error">*</span></span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15"
            />
          </div>
        )}

        {/* Vai trò */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-sub">
            <Shield className="size-3.5 text-text-muted" />
            <span>Vai trò hệ thống <span className="text-status-error">*</span></span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-text-main shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15 cursor-pointer"
          >
            <option value={UserRole.CUSTOMER}>Khách hàng</option>
            <option value={UserRole.STAFF}>Nhân viên</option>
            <option value={UserRole.ADMIN}>Quản trị viên</option>
          </select>
        </div>

        {/* Thao tác nút Lưu / Hủy */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-surface-border">
          <div className="group/cancelbtn relative inline-block">
            <div className="absolute -bottom-1 left-1 right-1 h-2.5 bg-primary/30 rounded-full blur-xs opacity-0 group-hover/cancelbtn:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative transition-all duration-300 group-hover/cancelbtn:-translate-y-0.5">
              <button
                type="button"
                onClick={onClose}
                className="relative inline-flex items-center justify-center rounded-xl border border-surface-border px-4 py-2.5 text-sm font-medium text-text-main transition-all duration-200 hover:bg-surface-hover hover:shadow-xs active:translate-y-0 cursor-pointer"
              >
                <span className="relative z-10">Hủy</span>
              </button>
            </div>
          </div>

          <div className="group/savebtn relative inline-block">
            <div className="absolute -bottom-1 left-1 right-1 h-3 bg-primary/40 rounded-full blur-md opacity-0 group-hover/savebtn:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative transition-all duration-300 group-hover/savebtn:-translate-y-0.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-primary-hover hover:shadow-lg active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
              >
                <span className="relative z-10">
                  {isSubmitting ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Tạo người dùng"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

export default UserFormModal;
