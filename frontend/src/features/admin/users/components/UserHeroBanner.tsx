"use client";

import React from "react";

export interface UserHeroBannerProps {
  total: number;
}

export function UserHeroBanner({ total }: UserHeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#115e59] to-[#042f2e] p-8 md:p-12 text-white shadow-2xl shadow-primary/40 border border-white/20 group transition-all duration-500 hover:shadow-primary/50">
      <div className="relative z-10 max-w-2xl space-y-4">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-lg flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-300">
          Quản lý người dùng
        </h1>
        <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed font-normal">
          Hệ thống đang quản lý tổng số <strong className="text-white font-bold">{total}</strong> tài khoản người dùng. Phân quyền truy cập, kiểm soát trạng thái bảo mật và quản lý hồ sơ dễ dàng.
        </p>
      </div>

      {/* Hiệu ứng đốm màu phát sáng nền (Background Glow) */}
      <div className="absolute -right-16 -bottom-16 size-80 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
      <div className="absolute right-1/4 -top-20 size-60 bg-teal-300/30 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
    </div>
  );
}

export default UserHeroBanner;