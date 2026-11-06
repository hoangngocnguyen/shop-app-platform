"use client";

import React from "react";
import { Mail, MapPin, Phone, Shield, User } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { getUserRoleLabel, UserDetailResponse, UserStatus } from "../types";

interface UserDetailsModalProps {
  user: UserDetailResponse;
  onClose: () => void;
}

export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  const roleLabel = getUserRoleLabel(user.role);

  const formatDate = (date: string) => new Date(date).toLocaleString("vi-VN");

  return (
    <ModalShell title="Thông tin người dùng" onClose={onClose} size="md">
      <div className="space-y-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-surface-border bg-surface-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-brand-sm">
            <dt className="flex items-center gap-2 text-xs font-semibold text-text-muted">
              <User className="size-3.5" /> Họ và tên
            </dt>
            <dd className="text-sm font-medium text-text-main">{user.fullName || "—"}</dd>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-brand-sm">
            <dt className="flex items-center gap-2 text-xs font-semibold text-text-muted">
              <Mail className="size-3.5" /> Email
            </dt>
            <dd className="break-all text-sm font-medium text-text-main">{user.email}</dd>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-brand-sm">
            <dt className="flex items-center gap-2 text-xs font-semibold text-text-muted">
              <Phone className="size-3.5" /> Số điện thoại
            </dt>
            <dd className="text-sm font-medium text-text-main">{user.phone || "—"}</dd>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-brand-sm">
            <dt className="flex items-center gap-2 text-xs font-semibold text-text-muted">
              <Shield className="size-3.5" /> Vai trò hệ thống
            </dt>
            <dd className="text-sm font-medium text-text-main">{roleLabel}</dd>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-brand-sm">
            <dt className="text-xs font-semibold text-text-muted">Trạng thái</dt>
            <dd className="text-sm font-medium text-text-main">
              {user.status === UserStatus.BLOCKED ? "Đã khóa" : "Hoạt động"}
            </dd>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-brand-sm">
            <dt className="text-xs font-semibold text-text-muted">Ngày tạo</dt>
            <dd className="text-sm font-medium text-text-main">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>

        <section className="space-y-3 border-t border-surface-border pt-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-main">
            <MapPin className="size-4 text-text-muted" /> Địa chỉ giao hàng
          </h3>
          {user.shippingAddresses?.length ? (
            <ul className="space-y-3">
              {user.shippingAddresses.map((address) => (
                <li key={address.id} className="rounded-xl border border-surface-border bg-surface-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-brand-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-text-main">
                      {address.recipientName || user.fullName}
                    </span>
                    {address.isDefault && (
                      <span className="rounded-full border border-primary/20 bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
                        Mặc định
                      </span>
                    )}
                  </div>
                  {address.phone && <p className="mt-1 text-xs text-text-sub">{address.phone}</p>}
                  <p className="mt-1 text-sm text-text-sub">
                    {[address.detailAddress, address.ward, address.province].filter(Boolean).join(", ") || "—"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">Người dùng chưa có địa chỉ giao hàng.</p>
          )}
        </section>

        <div className="flex justify-end border-t border-surface-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-surface-border bg-surface-card px-4 py-2 text-sm font-medium text-text-main shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-light/50 hover:text-primary hover:shadow-brand-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default UserDetailsModal;
