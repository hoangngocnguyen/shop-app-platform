import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthBackground, ResetPasswordForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu | Shop App Platform',
  description: 'Thiết lập mật khẩu mới cho tài khoản của bạn',
};

function LoadingFallback() {
  return (
    <div className="flex w-full items-center justify-center p-12 text-sm text-text-sub">
      <div className="flex items-center gap-3">
        <svg
          className="h-5 w-5 animate-spin text-primary"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Đang chuẩn bị trang đặt lại mật khẩu...</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthBackground>
      <Suspense fallback={<LoadingFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthBackground>
  );
}
