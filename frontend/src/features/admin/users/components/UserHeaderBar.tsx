"use client";

import React from "react";
import { Users } from "lucide-react";

export function UserHeaderBar() {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-surface-border bg-surface-card px-4 py-3.5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-brand-sm">
      <div className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary-light text-primary shadow-xs transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-contrast group-hover:shadow-brand-sm">
        <Users className="size-5 transition-transform duration-300 group-hover:rotate-6" aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <h3 className="text-lg font-extrabold leading-tight tracking-tight text-text-main transition-colors duration-300 group-hover:text-primary">
          Danh sách tài khoản hệ thống
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Tra cứu và xem thông tin tài khoản người dùng
        </p>
      </div>
    </div>
  );
}

export default UserHeaderBar;