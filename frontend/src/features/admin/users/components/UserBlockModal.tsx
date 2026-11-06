"use client";

import React, { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { UserDetailResponse, UserStatus } from "../types";

interface UserBlockModalProps {
  user: UserDetailResponse;
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
  const isBlocked = user.status === UserStatus.BLOCKED;
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const actionText = isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản";

  const handleConfirm = () => {
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
        <div className="flex gap-4">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-brand-md ${
              isBlocked
                ? "border-status-success/20 bg-status-success-bg text-status-success"
                : "border-status-warning/20 bg-status-warning-bg text-status-warning"
            }`}
          >
            {isBlocked ? <Unlock className="size-6" /> : <Lock className="size-6" />}
          </span>
          <p className="text-sm leading-relaxed text-text-sub">
            Bạn có chắc chắn muốn {isBlocked ? "mở khóa" : "khóa"} tài khoản{" "}
            <strong className="font-semibold text-text-main">{user.email}</strong> không?
            {isBlocked
              ? " Người dùng sẽ có thể đăng nhập lại."
              : " Người dùng sẽ không thể đăng nhập."}
          </p>
        </div>

        {!isBlocked && (
          <div className="space-y-1.5 pt-2">
            <label htmlFor="user-block-reason" className="block text-xs font-semibold text-text-main">
              Lý do khóa tài khoản <span className="text-status-error">*</span>
            </label>
            <textarea
              id="user-block-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError("");
              }}
              placeholder="Nhập lý do khóa tài khoản..."
              rows={3}
              maxLength={500}
              aria-invalid={Boolean(error)}
              className="w-full rounded-xl border border-surface-border bg-surface-card p-3 text-sm text-text-main shadow-xs placeholder:text-text-muted outline-none transition-all duration-200 hover:border-status-warning/50 hover:shadow-brand-sm focus:border-status-warning focus:bg-white focus:ring-2 focus:ring-status-warning/20"
            />
            {error && <p className="text-xs font-medium text-status-error">{error}</p>}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-surface-border bg-surface-card px-4 py-2.5 text-sm font-medium text-text-main shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-light/50 hover:text-primary hover:shadow-brand-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`group/action relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-brand-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-brand-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${
              isBlocked
                ? "bg-status-success hover:brightness-90"
                : "bg-status-warning hover:brightness-90"
            }`}
          >
            {isBlocked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
            {isSubmitting ? "Đang xử lý..." : actionText}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default UserBlockModal;
