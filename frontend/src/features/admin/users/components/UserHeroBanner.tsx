import React from "react";

interface UserHeroBannerProps {
  total: number;
}

export const UserHeroBanner: React.FC<UserHeroBannerProps> = ({ total }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary,#0f766e)] via-[#115e59] to-[#042f2e] p-8 md:p-12 text-white shadow-2xl shadow-[var(--color-primary,#0f766e)]/40 border border-white/20 group transition-all duration-500 hover:shadow-[var(--color-primary,#0f766e)]/50">
      <div className="relative z-10 max-w-2xl space-y-4">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-lg flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-300">
          Quản lý người dùng
        </h1>
        <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed font-normal">
          Hệ thống đang quản lý tổng số <strong className="text-white font-bold">{total}</strong> tài khoản người dùng. Phân quyền truy cập, kiểm soát trạng thái bảo mật và quản lý hồ sơ dễ dàng.
        </p>
      </div>

      <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
      <div className="absolute right-1/4 -top-20 w-60 h-60 bg-teal-300/30 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
    </div>
  );
};