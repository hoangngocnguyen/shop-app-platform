import api from "@/lib/axios/client";
import type { ApiResponse } from "@/types/api";
import type { ChatRequest, ChatResponseData } from "../types";

export async function sendChatMessage(
  payload: ChatRequest,
): Promise<ChatResponseData> {
  // Axios response interceptor trong @/lib/axios/client đã unwrap sẵn response.data
  const res = (await api.post<ApiResponse<ChatResponseData>>(
    "/chat",
    payload,
  )) as unknown as ApiResponse<ChatResponseData>;

  if (!res?.data) {
    throw new Error("Phản hồi từ máy chủ không hợp lệ.");
  }
  return res.data;
}
