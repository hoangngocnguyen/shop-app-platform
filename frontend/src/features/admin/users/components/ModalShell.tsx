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
      className="fixed inset-0 z-[9999] isolate flex items-center justify-center bg-text-main/70 p-4 backdrop-blur-md transition-opacity duration-200"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-[10000] w-full rounded-3xl border border-surface-border bg-surface-card p-6 shadow-brand-md transition-all duration-300 animate-in fade-in zoom-in-95 md:p-8 ${
          size === "sm" ? "max-w-md" : "max-w-lg"
        }`}
      >
        <div className="mb-5 flex items-center justify-between border-b border-surface-border pb-4">
          <h2 className="text-xl font-black tracking-tight text-text-main">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl p-2 text-text-muted shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-light hover:text-primary hover:shadow-brand-sm"
          >
            <X className="size-4 transition-transform duration-200 hover:rotate-90" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default ModalShell;
