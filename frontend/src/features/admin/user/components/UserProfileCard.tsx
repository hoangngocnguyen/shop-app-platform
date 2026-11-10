"use client";

import React from "react";
import { User, Mail, Phone, MapPin, Shield } from "lucide-react";
import { UserDetailStatisticsResponse } from "../types";

interface UserProfileCardProps {
  data: UserDetailStatisticsResponse | null;
  isLoading: boolean;
}

export function UserProfileCard({ data, isLoading }: UserProfileCardProps) {
  if (isLoading && !data) {
    return (
      <div className="lg:col-span-2 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-brand-sm">
        <div className="h-44 animate-pulse rounded-xl bg-surface-hover" />
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-brand-sm">
      <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
        <User className="size-5 text-primary" /> Thông tin cá nhân
      </h2>
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
                {data?.role}
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

        <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-surface-bg border border-surface-border/50">
          <MapPin className="size-4 text-text-muted shrink-0" />
          <div>
            <p className="text-xs text-text-muted">Địa chỉ mặc định</p>
            <p className="font-semibold">{data?.address || "Chưa có địa chỉ giao hàng"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}