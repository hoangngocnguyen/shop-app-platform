"use client";

import React, { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { UserDetailResponse, UserStatus } from "../types";

export type BlockableUser = Partial<UserDetailResponse> & {
  userId: string | number;
  is_blocked?: boolean;
  full_name?: string;
};

interface UserBlockModalProps {
  user: BlockableUser;
  isSubmitting: boolean;
  onConfirm: (reason?: string) => void | Promise<void>;
  onClose: () => void;
}

export function UserBlockModal({
  user,
  isSubmitting,
  onConfirm,
  onClose,
}: UserBlockModalProps) {
  const isBlocked = Boolean(user.is_blocked || user.status === UserStatus.BLOCKED);
  const actionText = isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản";
  const userLabel = user.full_name || user.fullName || user.email || "tài khoản này";

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    // Bắt buộc nhập lý do nếu là thao tác KHÓA tài khoản
    if (!isBlocked && !reason.trim()) {
      setError("Vui lòng nhập lý do khóa tài khoản");
      return;
    }
    setError("");
    void onConfirm(isBlocked ? undefined : reason.trim());
  };

  return (
    <ModalShell title={actionText} onClose={onClose} size="sm">
      <div className="space-y-4">
        {/* Banner Cảnh báo */}
        <div className="group/alert flex gap-4">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-all duration-300 group-hover/alert:scale-110 group-hover/alert:shadow-md ${
              isBlocked ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {isBlocked ? (
              <Unlock className="size-6 transition-transform duration-300 group-hover/alert:rotate-12" />
            ) : (
              <Lock className="size-6 transition-transform duration-300 group-hover/alert:-rotate-12" />
            )}
          </span>
          <p className="text-sm leading-relaxed text-text-sub">
            Bạn có chắc chắn muốn {isBlocked ? "mở khóa" : "khóa"} cho{" "}
            <strong className="font-semibold text-text-main">{userLabel}</strong> không?{" "}
            {isBlocked
              ? "Tài khoản sẽ có thể đăng nhập lại bình thường."
              : "Người dùng này sẽ không thể đăng nhập vào hệ thống."}
          </p>
        </div>

        {/* Ô Nhập lý do (Chỉ hiển thị khi KHÓA tài khoản) */}
        {!isBlocked && (
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-text-main">
              Lý do khóa tài khoản <span className="text-status-error">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder="Nhập lý do vi phạm hoặc khóa tài khoản..."
              rows={3}
              maxLength={500}
              className="w-full rounded-xl border border-surface-border bg-surface-bg p-3 text-sm text-text-main placeholder:text-text-muted outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
            />
            {error && <p className="text-xs text-status-error font-medium">{error}</p>}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-surface-border">
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
          <div
            className={`absolute -bottom-1 left-1 right-1 h-3 rounded-full blur-md opacity-0 group-hover/actbtn:opacity-100 transition-opacity duration-300 pointer-events-none ${
              isBlocked ? "bg-emerald-500/40" : "bg-amber-500/40"
            }`}
          />
          <div className="relative transition-all duration-300 group-hover/actbtn:-translate-y-0.5">
            <button
              type="button"
              onClick={handleConfirm}
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
