"use client";

import React, { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface ModalShellProps {
  title: string;
  onClose: () => void;
  size?: "sm" | "md";
  children: ReactNode;
}

const emptySubscribe = () => () => {};

/** Khung modal chuẩn chống xuyên thấu 100% bằng React Portal */
export function ModalShell({ title, onClose, size = "md", children }: ModalShellProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    // Lưu lại overflow cũ và khóa cuộn trang
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md transition-opacity duration-200 isolate" 
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-label={title} 
        style={{ backgroundColor: "#ffffff" }}
        className={`relative z-[10000] w-full rounded-3xl border border-slate-200 !bg-white p-6 md:p-8 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 ${
          size === "sm" ? "max-w-md" : "max-w-lg"
        }`}
      >
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>

          {/* NÚT ĐÓNG VỚI BOTTOM GLOW & HOVER LIFT */}
          <div className="group/closebtn relative inline-block">
            <div className="absolute -bottom-1 left-1 right-1 h-2.5 bg-emerald-500/40 rounded-full blur-xs opacity-0 group-hover/closebtn:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative transition-all duration-300 group-hover/closebtn:-translate-y-0.5">
              <button 
                type="button" 
                onClick={onClose} 
                aria-label="Đóng" 
                className="relative inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200 cursor-pointer shadow-xs"
              >
                <X className="size-4 relative z-10 transition-transform duration-200 group-hover/closebtn:scale-125 group-hover/closebtn:rotate-90" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default ModalShell;
