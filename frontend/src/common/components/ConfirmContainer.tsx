"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useConfirmStore } from "../stores/useConfirmStore";

export default function ConfirmContainer() {
    const { isOpen, options, close } = useConfirmStore();

    if (!isOpen) return null;

    const variant = options.variant || "danger";

    const variantStyles = {
        danger: {
            icon: AlertCircle,
            bgIcon: "bg-status-error-bg",
            textIcon: "text-status-error",
            btnConfirm: "bg-status-error hover:opacity-90 text-white",
        },
        warning: {
            icon: AlertTriangle,
            bgIcon: "bg-status-warning-bg",
            textIcon: "text-status-warning",
            btnConfirm: "bg-status-warning hover:opacity-90 text-white",
        },
        info: {
            icon: Info,
            bgIcon: "bg-status-info-bg",
            textIcon: "text-status-info",
            btnConfirm: "bg-primary hover:bg-primary-hover text-primary-contrast",
        },
    }[variant];

    const Icon = variantStyles.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity">
            <div className="w-full max-w-md bg-surface-card rounded-t-2xl sm:rounded-2xl border border-surface-border shadow-brand-md overflow-hidden animate-in fade-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-surface-border">
                    <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${variantStyles.bgIcon} ${variantStyles.textIcon}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-text-main">
                            {options.title || "Xác nhận hành động"}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => close(false)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                    <p className="text-sm text-text-sub font-medium leading-relaxed">
                        {options.message}
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 p-4 bg-surface-bg border-t border-surface-border">
                    <button
                        type="button"
                        onClick={() => close(false)}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-sm font-medium text-text-sub hover:bg-surface-hover transition-colors cursor-pointer text-center"
                    >
                        {options.cancelText || "Hủy"}
                    </button>
                    <button
                        type="button"
                        onClick={() => close(true)}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-xl text-sm font-medium transition-all shadow-brand-sm cursor-pointer ${variantStyles.btnConfirm}`}
                    >
                        {options.confirmText || "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    );
}