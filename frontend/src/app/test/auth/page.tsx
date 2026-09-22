"use client";

import api from "@/lib/axios/client";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

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


  useEffect(() => {
    const testAuth = async () => {
      try {
        const response = await api.get("/auth/me");

        console.log("Current user:", response.data);
      } catch (error) {
        console.error("Auth request failed:", error);
      }
    };

    testAuth();
  }, []);



  return (
    <main>
      <h1>Auth Integration Test</h1>
      <div>Testing authentication...</div>;
      {/* <button onClick={testBackendAuth}>
        Test FE → BE
      </button> */}
    </main>
  );
}