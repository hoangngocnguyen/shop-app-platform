import api from "@/lib/axios/client";
import type { ApiResponse } from "@/types/api";
import type { ChatRequest, ChatResponseData } from "../types";

export async function sendChatMessage(
  payload: ChatRequest,
): Promise<ChatResponseData> {
  const response = await api.post<ApiResponse<ChatResponseData>>(
    "/chat",
    payload,
  );
  if (!response.data?.data) {
    throw new Error("Phản hồi từ máy chủ không hợp lệ.");
  }
  return response.data.data;
}
