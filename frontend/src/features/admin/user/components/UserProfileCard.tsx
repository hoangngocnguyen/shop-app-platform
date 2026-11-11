"use client";

import React from "react";
import { User, Mail, Phone, MapPin, Shield, Pencil, Eye } from "lucide-react";
import { getUserRoleLabel, UserDetailStatisticsResponse } from "../types";

interface UserProfileCardProps {
  data: UserDetailStatisticsResponse | null;
  isLoading: boolean;
  onEditRole?: () => void;
  onViewAllAddresses?: () => void;
}

export function UserProfileCard({
  data,
  isLoading,
  onEditRole,
  onViewAllAddresses,
}: UserProfileCardProps) {
  if (isLoading && !data) {
    return (
      <div className="lg:col-span-2 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-brand-sm">
        <div className="h-44 animate-pulse rounded-xl bg-surface-hover" />
      </div>
    );
  }

  const addressCount = data?.shipping_addresses?.length ?? 0;

  return (
    <div className="lg:col-span-2 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-brand-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
          <User className="size-5 text-primary" /> Thông tin cá nhân
        </h2>
        {onEditRole && (
          <button
            type="button"
            onClick={onEditRole}
            disabled={!data}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-primary/20 bg-primary-light/70 px-3 py-1.5 text-xs font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-contrast hover:shadow-brand-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil className="size-3.5" />
            <span>Sửa</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-bg border border-surface-border/50">
          <User className="size-4 text-text-muted shrink-0" />
          <div>
            <p className="text-xs text-text-muted">Họ và tên</p>
            <p className="font-semibold">{data?.full_name || "Chưa cập nhật"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-bg border border-surface-border/50">
          <Mail className="size-4 text-text-muted shrink-0" />
          <div>
            <p className="text-xs text-text-muted">Email</p>
            <p className="font-semibold font-mono">{data?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-bg border border-surface-border/50">
          <Phone className="size-4 text-text-muted shrink-0" />
          <div>
            <p className="text-xs text-text-muted">Số điện thoại</p>
            <p className="font-semibold">{data?.phone || "Chưa cập nhật"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-bg border border-surface-border/50">
          <Shield className="size-4 text-text-muted shrink-0" />
          <div>
            <p className="text-xs text-text-muted">Vai trò / Trạng thái</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-semibold text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                {data ? getUserRoleLabel(data.role) : ""}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
                  data?.status === "BLOCKED"
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {data?.status === "BLOCKED" ? "Đã khóa" : "Hoạt động"}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-bg border border-surface-border/50">
          <div className="flex items-center gap-3 min-w-0">
            <MapPin className="size-4 text-text-muted shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-text-muted">Địa chỉ mặc định</p>
              <p className="font-semibold truncate">{data?.address || "Chưa có địa chỉ giao hàng"}</p>
            </div>
          </div>

          {onViewAllAddresses && (
            <button
              type="button"
              onClick={onViewAllAddresses}
              disabled={addressCount === 0}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover hover:underline shrink-0 self-end sm:self-auto disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
            >
              <Eye className="size-3.5" />
              <span>Xem tất cả {addressCount > 0 ? `(${addressCount})` : ""}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}