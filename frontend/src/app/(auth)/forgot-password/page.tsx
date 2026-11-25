import type { Metadata } from 'next';
import { AuthBackground, ForgotPasswordForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Quên mật khẩu | Shop App Platform',
  description: 'Khôi phục mật khẩu tài khoản Shop App Platform',
};

export default function ForgotPasswordPage() {
  return (
    <AuthBackground>
      <ForgotPasswordForm />
    </AuthBackground>
  );
}
