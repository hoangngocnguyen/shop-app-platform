import api from "@/lib/axios/client";

export async function syncUser() {
  const response = await api.post("/auth/sync");

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");

  return response.data;
}