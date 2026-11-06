import api from "@/lib/axios/client";

export async function syncUser(accessToken?: string) {
  const config = accessToken
    ? { headers: { Authorization: `Bearer ${accessToken}` } }
    : undefined;

  const response = await api.post("/auth/sync", null, config);

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");

  return response.data;
}
