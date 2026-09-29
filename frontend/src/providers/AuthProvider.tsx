"use client";

import { useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { createClient } from "@/lib/supabase/client";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const sync = useAuthStore((state) => state.sync);
  const fetchUser = useAuthStore((state) => state.fetchUser); // Thêm fetchUser
  const setUser = useAuthStore((state) => state.setUser);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);

  useEffect(() => {
    const supabase = createClient();

    // 1. Kiểm tra session ngay khi app mount lần đầu (F5 trang, mở tab mới)
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Nếu có session sẵn, gọi fetchUser để lấy thông tin app user đưa vào store
          await fetchUser();
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setUser(null);
        setIsLoading(false);
      }
    };

    initAuth();

    // 2. Lắng nghe các thay đổi tiếp theo (Login, Logout, Token change...)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Khi vừa đăng nhập hoặc refresh token thì gọi sync
          await sync();
        } else if (event === "SIGNED_OUT" || !session) {
          // Khi đăng xuất
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [sync, fetchUser, setUser, setIsLoading]);

  return <>{children}</>;
}