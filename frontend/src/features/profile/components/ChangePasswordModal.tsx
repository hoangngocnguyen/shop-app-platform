"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2, X } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/common/stores/useToastStore";
import { parseErrorMessage } from "@/lib/axios/parseError";
import { userApi } from "../api";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../schemas/change-password-schema";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const passwordFields = [
  { name: "current_password", label: "Mật khẩu hiện tại", autoComplete: "current-password" },
  { name: "new_password", label: "Mật khẩu mới", autoComplete: "new-password" },
  { name: "confirm_password", label: "Xác nhận mật khẩu mới", autoComplete: "new-password" },
] as const;

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ current_password: "", new_password: "", confirm_password: "" });
      setSubmitError(null);
      setVisibleFields({});
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setSubmitError(null);
    try {
      await userApi.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      reset();
      toast.success("Mật khẩu đã được đổi thành công.");
      onClose();
    } catch (error: unknown) {
      setSubmitError(
        parseErrorMessage(error, "Không thể đổi mật khẩu. Vui lòng thử lại sau."),
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-surface-border bg-surface-card shadow-brand-md"
      >
        <header className="flex items-center justify-between border-b border-surface-border bg-surface-bg/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <KeyRound aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 id="change-password-title" className="text-base font-bold text-text-main">
                Đổi mật khẩu
              </h2>
              <p className="text-xs text-text-sub">Xác nhận mật khẩu hiện tại để tiếp tục</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng cửa sổ đổi mật khẩu"
            className="rounded-xl p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-main disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6 sm:p-7">
          {submitError && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-status-error-bg p-3 text-sm text-status-error">
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {passwordFields.map((field) => {
            const fieldError = errors[field.name]?.message;
            const isVisible = visibleFields[field.name] ?? false;
            return (
              <div key={field.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label htmlFor={field.name} className="block text-sm font-semibold text-text-main">
                    {field.label}
                  </label>
                  {field.name === "current_password" && (
                    <Link
                      href={ROUTES.AUTH.FORGOT_PASSWORD}
                      className="text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      Quên mật khẩu?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    id={field.name}
                    type={isVisible ? "text" : "password"}
                    autoFocus={field.name === "current_password"}
                    autoComplete={field.autoComplete}
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby={fieldError ? `${field.name}-error` : undefined}
                    {...register(field.name)}
                    className={`w-full rounded-xl border bg-surface-bg px-4 py-3 pr-12 text-sm text-text-main outline-none transition focus:border-primary focus:ring-4 focus:ring-ring-brand/15 ${
                      fieldError ? "border-status-error" : "border-surface-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setVisibleFields((current) => ({ ...current, [field.name]: !isVisible }))}
                    aria-label={isVisible ? `Ẩn ${field.label.toLowerCase()}` : `Hiện ${field.label.toLowerCase()}`}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-text-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {isVisible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                  </button>
                </div>
                {fieldError && (
                  <p id={`${field.name}-error`} className="mt-1.5 text-xs font-medium text-status-error">
                    {fieldError}
                  </p>
                )}
              </div>
            );
          })}

          <p className="text-xs text-text-sub">Mật khẩu mới cần có từ 6 đến 64 ký tự và khác mật khẩu hiện tại.</p>

          <div className="flex justify-end gap-3 border-t border-surface-border pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-surface-border px-4 py-2.5 text-sm font-semibold text-text-sub transition hover:bg-surface-hover disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-contrast transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
