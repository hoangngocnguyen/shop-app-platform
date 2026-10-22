'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-[2px] sm:p-6"
      onClick={onClose}
    >
      <div
        className={`relative my-4 w-full ${maxWidthStyles} overflow-hidden rounded-[28px] border border-surface-border bg-surface-card shadow-[0_24px_80px_rgba(15,23,42,0.18)] animate-in fade-in duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-surface-border bg-surface-bg/70 px-5 py-4 sm:px-6">
            <h3 className="text-base font-bold tracking-tight text-text-main sm:text-lg">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-surface-border bg-surface-card text-text-muted transition hover:bg-surface-hover hover:text-text-main"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
