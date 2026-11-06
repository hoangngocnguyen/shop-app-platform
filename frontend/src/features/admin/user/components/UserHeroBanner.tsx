"use client";

import React from "react";
import { ShieldCheck, UserCheck, UserX, Users, BriefcaseBusiness } from "lucide-react";
import { UserStatsResponse } from "../types";

export interface UserHeroBannerProps {
  stats: UserStatsResponse;
}

const STAT_CARDS = [
  {
    key: "total",
    label: "TỔNG TÀI KHOẢN",
    icon: Users,
    valueClass: "text-text-main",
    iconClass: "bg-primary-light text-primary",
    glowClass: "bg-primary/25",
  },
  {
    key: "customers",
    label: "KHÁCH HÀNG",
    icon: UserCheck,
    valueClass: "text-text-main",
    iconClass: "bg-status-info-bg text-status-info",
    glowClass: "bg-status-info/20",
  },
  {
    key: "admins",
    label: "QUẢN TRỊ VIÊN",
    icon: ShieldCheck,
    valueClass: "text-text-main",
    iconClass: "bg-status-warning-bg text-status-warning",
    glowClass: "bg-status-warning/20",
  },
  {
    key: "staff",
    label: "NHÂN VIÊN",
    icon: BriefcaseBusiness,
    valueClass: "text-text-main",
    iconClass: "bg-status-success-bg text-status-success",
    glowClass: "bg-status-success/20",
  },
  {
    key: "blocked",
    label: "TÀI KHOẢN BỊ KHÓA",
    icon: UserX,
    valueClass: "text-status-error",
    iconClass: "bg-status-error-bg text-status-error",
    glowClass: "bg-status-error/20",
  },
] as const;

export function UserHeroBanner({ stats }: UserHeroBannerProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {STAT_CARDS.map(({ key, label, icon: Icon, valueClass, iconClass, glowClass }) => (
        <div
          key={key}
          className="group/stat relative isolate overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-5 shadow-brand-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-brand-md"
        >
          <div className={`pointer-events-none absolute -right-7 -top-7 -z-10 size-24 rounded-full ${glowClass} opacity-0 blur-2xl transition-opacity duration-300 group-hover/stat:opacity-100`} />
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-text-sub">
            <span>{label}</span>
            <div className={`flex size-9 items-center justify-center rounded-xl transition-all duration-300 group-hover/stat:-translate-y-0.5 group-hover/stat:scale-110 group-hover/stat:shadow-brand-sm ${iconClass}`}>
              <Icon className="size-4 transition-transform duration-300 group-hover/stat:scale-110" aria-hidden />
            </div>
          </div>
          <div className={`mt-3 text-3xl font-black transition-transform duration-300 group-hover/stat:translate-x-0.5 ${valueClass}`}>
            {stats[key]}
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserHeroBanner;
