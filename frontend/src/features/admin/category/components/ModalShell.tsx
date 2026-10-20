"use client";

import React, { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export interface ModalShellProps {
  title: string;
  onClose: () => void;
  size?: "sm" | "md";
  children: ReactNode;
}

/** Khung modal dùng chung (đóng bằng Esc hoặc bấm nền) */
export function ModalShell({ title, onClose, size = "md", children }: ModalShellProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-main/40 p-4 backdrop-blur-xs transition-opacity duration-200" 
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-label={title} 
        className={`w-full rounded-2xl border border-surface-border bg-surface-card p-6 shadow-brand-md transition-all duration-300 animate-in fade-in zoom-in-95 ${
          size === "sm" ? "max-w-md" : "max-w-lg"
        }`}
      >
        <div className="mb-5 flex items-center justify-between border-b border-surface-border pb-4">
          <h2 className="text-lg font-semibold text-text-main">{title}</h2>
          
          {/* NÚT ĐÓNG VỚI BOTTOM GLOW & HOVER LIFT CHUẨN XÁC */}
          <div className="group/closebtn relative inline-block">
            {/* Ánh sáng đèn xanh dưới đáy */}
            <div className="absolute -bottom-1 left-1 right-1 h-2.5 bg-primary/40 rounded-full blur-xs opacity-0 group-hover/closebtn:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative transition-all duration-300 group-hover/closebtn:-translate-y-0.5">
              <button 
                type="button" 
                onClick={onClose} 
                aria-label="Đóng" 
                className="relative inline-flex items-center justify-center rounded-lg p-1.5 text-text-muted transition-all duration-200 hover:bg-surface-hover hover:text-text-main cursor-pointer shadow-2xs"
              >
                <X className="size-4 relative z-10 transition-transform duration-200 group-hover/closebtn:scale-125 group-hover/closebtn:rotate-90" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default ModalShell;