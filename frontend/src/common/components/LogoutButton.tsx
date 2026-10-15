"use client";

import { useAuthStore } from "@/features/auth";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/**
 * Nút đăng xuất tái sử dụng.
 * Phải là Client Component ("use client") vì sử dụng React hook của Zustand (useAuthStore) và useRouter.
 * Sử dụng sự kiện onClick thay vì form action để gọi hàm logout của Client Supabase và điều hướng an toàn về trang chủ.
 */
export function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.HOME);
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm px-4 py-2 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-bg text-text-sub font-medium transition shadow-brand-sm cursor-pointer"
    >
      Đăng xuất
    </button>
  );
}