"use client";

import React from "react";
import { Users, UserPlus } from "lucide-react";

export interface UserHeaderBarProps {
  onAddUser: () => void;
}

export function UserHeaderBar({ onAddUser }: UserHeaderBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-surface-border shadow-md transition-all duration-300">
      
      {/* Khối tiêu đề & Icon minh họa */}
      <div className="group/iconbox flex items-center gap-3.5 cursor-pointer">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center shadow-inner transition-all duration-300 group-hover/iconbox:-translate-y-1 group-hover/iconbox:scale-110 group-hover/iconbox:bg-primary group-hover/iconbox:text-white group-hover/iconbox:shadow-md">
          <Users className="size-6 transition-transform duration-300 group-hover/iconbox:rotate-6" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-extrabold text-base text-text-main transition-colors group-hover/iconbox:text-primary">
            Danh sách tài khoản hệ thống
          </h3>
          <p className="text-xs text-text-muted">
            Tìm kiếm, thay đổi vai trò, mở hoặc khóa quyền truy cập
          </p>
        </div>
      </div>

      {/* Nút Thêm người dùng mới (Có Bottom Glow & Hover Lift) */}
      <div className="group/btn relative inline-block w-full sm:w-auto">
        <div className="absolute -bottom-1 left-1 right-1 h-3 bg-primary/40 rounded-full blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="relative transition-all duration-300 group-hover/btn:-translate-y-0.5">
          <button
            type="button"
            onClick={onAddUser}
            className="relative inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-primary-hover hover:shadow-xl active:translate-y-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <UserPlus className="size-4 transition-transform duration-300 group-hover/btn:scale-125" aria-hidden="true" />
            <span className="relative z-10">Thêm người dùng mới</span>
          </button>
        </div>
      </div>

    </div>
  );
}

export default UserHeaderBar;