"use client";

import React from "react";
import { Lock, Unlock } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { UserDetailResponse, UserStatus } from "../types";

type BlockableUser = Partial<UserDetailResponse> & {
  userId: string;
  is_blocked?: boolean;
  full_name?: string;
};

interface UserBlockModalProps {
  user: BlockableUser;
  isSubmitting: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function UserBlockModal({
  user,
  isSubmitting,
  onConfirm,
  onClose,
}: UserBlockModalProps) {
  const isBlocked =
    user.is_blocked || user.status === UserStatus.BLOCKED;
  const actionText = isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản";
  const userLabel =
    user.full_name || user.fullName || user.email || "tài khoản này";

  return (
    <ModalShell title={actionText} onClose={onClose} size="sm">
      <div className="group/alert flex gap-4">
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-all duration-300 group-hover/alert:scale-110 group-hover/alert:shadow-md ${
          isBlocked ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
        }`}>
          {isBlocked ? (
            <Unlock className="size-6 transition-transform duration-300 group-hover/alert:rotate-12" />
          ) : (
            <Lock className="size-6 transition-transform duration-300 group-hover/alert:-rotate-12" />
          )}
        </span>
        <p className="text-sm leading-relaxed text-text-sub">
          Bạn có chắc chắn muốn {isBlocked ? "mở khóa" : "khóa"} cho <strong className="font-semibold text-text-main">{userLabel}</strong> không? {isBlocked ? "Tài khoản sẽ có thể đăng nhập lại bình thường." : "Người dùng này sẽ không thể đăng nhập vào hệ thống."}
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-surface-border">
        {/* Nút Hủy */}
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
        
        {/* Nút Xác nhận Khóa/Mở khóa */}
        <div className="group/actbtn relative inline-block">
          <div className={`absolute -bottom-1 left-1 right-1 h-3 rounded-full blur-md opacity-0 group-hover/actbtn:opacity-100 transition-opacity duration-300 pointer-events-none ${
            isBlocked ? "bg-emerald-500/40" : "bg-amber-500/40"
          }`} />
          <div className="relative transition-all duration-300 group-hover/actbtn:-translate-y-0.5">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`relative inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:opacity-95 hover:shadow-md active:translate-y-0 disabled:opacity-60 cursor-pointer ${
                isBlocked ? "bg-emerald-600" : "bg-amber-600"
              }`}
            >
              <span className="relative z-10">{isSubmitting ? "Đang xử lý..." : actionText}</span>
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export default UserBlockModal;
