"use client";

import { createClient } from "@/lib/supabase/client";

export default function AuthTestPage() {
  const testBackendAuth = async () => {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.log("Chưa đăng nhập Supabase");
      return;
    }

    const response = await fetch("http://localhost:8000/auth/me", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    console.log("BE response:", data);
  };

  return (
    <main>
      <h1>Auth Integration Test</h1>

      <button onClick={testBackendAuth}>
        Test FE → BE
      </button>
    </main>
  );
}