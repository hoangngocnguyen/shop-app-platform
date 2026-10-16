"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-(--color-surface-card) border border-(--color-surface-border) rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-(--color-status-error-bg) text-(--color-status-error) flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-(--color-text-main)">{title}</h3>
            <p className="text-sm text-(--color-text-sub) mt-1">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-(--color-surface-bg) border border-(--color-surface-border) text-(--color-text-main) rounded-lg hover:bg-(--color-surface-hover) transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium bg-(--color-status-error) text-white rounded-lg hover:opacity-90 transition-colors cursor-pointer"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};