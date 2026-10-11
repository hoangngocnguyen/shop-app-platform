"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useToastStore, ToastMessage, ToastType } from "../stores/useToastStore";

const toastConfig: Record<
    ToastType,
    { icon: React.ElementType; borderClass: string; iconClass: string; bgClass: string }
> = {
    success: {
        icon: CheckCircle2,
        borderClass: "border-l-status-success",
        iconClass: "text-status-success",
        bgClass: "bg-status-success-bg",
    },
    error: {
        icon: AlertCircle,
        borderClass: "border-l-status-error",
        iconClass: "text-status-error",
        bgClass: "bg-status-error-bg",
    },
    warning: {
        icon: AlertTriangle,
        borderClass: "border-l-status-warning",
        iconClass: "text-status-warning",
        bgClass: "bg-status-warning-bg",
    },
    info: {
        icon: Info,
        borderClass: "border-l-status-info",
        iconClass: "text-status-info",
        bgClass: "bg-status-info-bg",
    },
};

function ToastItem({ toast }: { toast: ToastMessage }) {
    const removeToast = useToastStore((s) => s.removeToast);
    const config = toastConfig[toast.type];
    const Icon = config.icon;

    return (
        <div
            className={`group relative flex items-start gap-3 w-80 sm:w-96 p-4 rounded-xl border border-surface-border border-l-4 bg-surface-card text-text-main shadow-brand-md transition-all duration-300 animate-in fade-in slide-in-from-top-5 ${config.borderClass}`}
        >
            <div className={`p-1.5 rounded-lg shrink-0 ${config.bgClass}`}>
                <Icon className={`w-5 h-5 ${config.iconClass}`} />
            </div>

            <div className="flex-1 pt-0.5 min-w-0">
                {toast.title && (
                    <h4 className="text-xs font-bold text-text-main leading-tight mb-1">
                        {toast.title}
                    </h4>
                )}
                <p className="text-xs text-text-sub font-medium leading-relaxed wrap-break-word">
                    {toast.message}
                </p>
            </div>

            <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-auto">
            {toasts.map((item) => (
                <ToastItem key={item.id} toast={item} />
            ))}
        </div>
    );
}