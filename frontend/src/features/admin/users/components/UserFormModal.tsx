"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Lock, Shield } from "lucide-react";
import { ModalShell } from "../../category/components/ModalShell";
import { UserDetailResponse, UserRole } from "../types";

export interface UserFormValues {
  full_name: string;
  email: string;
  phone?: string;
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
    full_name: user?.full_name || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    role: user?.role || UserRole.CUSTOMER || "CUSTOMER",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            <span>Họ và tên</span>
          </label>
          <input
            type="text"
            required
            placeholder="Nhập họ và tên..."
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-sub">
            <Mail className="size-3.5 text-text-muted" />
            <span>Email</span>
          </label>
          <input
            type="email"
            required
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
            <span>Số điện thoại</span>
          </label>
          <input
            type="tel"
            placeholder="0987xxxxxx"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15"
          />
        </div>

        {/* Mật khẩu */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-sub">
            <Lock className="size-3.5 text-text-muted" />
            <span>{isEdit ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu (Tối thiểu 6 ký tự)"}</span>
          </label>
          <input
            type="password"
            required={!isEdit}
            minLength={6}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15"
          />
        </div>

        {/* Vai trò */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-sub">
            <Shield className="size-3.5 text-text-muted" />
            <span>Vai trò hệ thống</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full rounded-xl border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-text-main shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-ring-brand focus:outline-none focus:ring-4 focus:ring-ring-brand/15 cursor-pointer"
          >
            <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
            <option value="ADMIN">ADMIN (Quản trị viên)</option>
            <option value="STAFF">STAFF (Nhân viên)</option>
          </select>
        </div>

        {/* CÁC NÚT THAO TÁC CÓ CẢ BOTTOM GLOW & HOVER LIFT */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-surface-border">
          
          {/* NÚT HỦY VỚI BOTTOM GLOW & HOVER LIFT */}
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

          {/* NÚT TẠO/LƯU VỚI BOTTOM GLOW & HOVER LIFT CHUẨN XÁC */}
          <div className="group/savebtn relative inline-block">
            {/* Vòng đèn phát sáng ánh xanh mờ dưới đáy */}
            <div className="absolute -bottom-1 left-1 right-1 h-3 bg-primary/40 rounded-full blur-md opacity-0 group-hover/savebtn:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative transition-all duration-300 group-hover/savebtn:-translate-y-0.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-contrast shadow-md transition-all duration-200 hover:bg-primary-hover hover:shadow-lg active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
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