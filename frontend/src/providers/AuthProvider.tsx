"use client";

import { useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { syncUser } from "@/features/auth/api/auth";
import { createClient } from "@/lib/supabase/client";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const setUser = useAuthStore((state) => state.setUser);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);

  useEffect(() => {
    const supabase = createClient();

    // 1. Kiểm tra session ngay khi app mount lần đầu (F5 trang, mở tab mới)
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Cập nhật provider cho cả application user đã tồn tại.
          try {
            await syncUser(session.access_token);
          } catch (error) {
            console.error("Failed to sync auth provider:", error);
          }
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
          // route.ts đã syncUser trước khi redirect → chỉ cần fetchUser để load store
          await fetchUser();
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
  }, [fetchUser, setUser, setIsLoading]);

  return <>{children}</>;
}
