import React from "react";
import { Users, UserPlus } from "lucide-react";

interface UserHeaderBarProps {
  onAddUser: () => void;
}

export const UserHeaderBar: React.FC<UserHeaderBarProps> = ({ onAddUser }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[var(--color-surface-border,#e2e8f0)] shadow-md">
      <div className="group/iconbox flex items-center gap-3.5 cursor-pointer">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--color-primary,#0f766e)] flex items-center justify-center shadow-inner transition-all duration-300 group-hover/iconbox:-translate-y-1.5 group-hover/iconbox:scale-110 group-hover/iconbox:bg-primary group-hover/iconbox:text-white group-hover/iconbox:shadow-md">
          <Users className="w-6 h-6 transition-transform duration-300 group-hover/iconbox:rotate-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-base text-[var(--color-text-main,#0f172a)] transition-colors group-hover/iconbox:text-primary">
            Danh sách tài khoản hệ thống
          </h3>
          <p className="text-xs text-[var(--color-text-muted,#94a3b8)]">
            Tìm kiếm, thay đổi vai trò, mở hoặc khóa quyền truy cập
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddUser}
        className="group/btn relative inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-contrast shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover hover:shadow-xl active:translate-y-0 cursor-pointer"
      >
        <UserPlus className="size-4 transition-transform duration-300 group-hover/btn:scale-125" aria-hidden="true" />
        <span>Thêm người dùng mới</span>
      </button>
    </div>
  );
};