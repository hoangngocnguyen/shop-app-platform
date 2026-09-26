'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { createClient } from '@/lib/supabase/client';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const sync = useAuthStore((state) => state.sync);
  const logout = useAuthStore((state) => state.logout);
  const supabase = createClient();

  useEffect(() => {
    // Lắng nghe sự thay đổi Auth State từ Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Chỉ gọi sync sang Backend khi đã chắc chắn có session từ Supabase
        await sync();
      } else {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [sync, logout, supabase]);

  return <>{children}</>;
}