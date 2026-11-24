import { create } from "zustand";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";
import { sendChatMessage } from "../api";
import type { ChatHistoryItem, ChatMessage } from "../types";

const MAX_HISTORY_TO_SEND = 10;

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-msg",
  role: "assistant",
  content:
    "Xin chào! Mình là **Trợ lý AI của HoangShop**. Bạn cần tư vấn sản phẩm hay hỏi về chính sách giao hàng, đổi trả 7 ngày cứ nhắn cho mình nhé!",
  createdAt: 0,
};

interface ChatState {
  isOpen: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (rawText: string) => Promise<void>;
  clearHistory: () => void;
}

function createMessageId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiErr = error.response?.data as ApiErrorResponse | undefined;
    if (apiErr?.message) {
      return apiErr.message;
    }
    if (error.response?.status === 429) {
      return "Bạn gửi tin nhắn hơi nhanh, vui lòng đợi một lát rồi thử lại nhé.";
    }
  }
  return "Xin lỗi, trợ lý AI đang gặp sự cố kết nối. Bạn vui lòng thử lại sau giây lát!";
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  isLoading: false,
  messages: [INITIAL_WELCOME_MESSAGE],

  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  clearHistory: () =>
    set({
      messages: [{ ...INITIAL_WELCOME_MESSAGE, createdAt: Date.now() }],
      isLoading: false,
    }),

  sendMessage: async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || get().isLoading) {
      return;
    }

    const userMsg: ChatMessage = {
      id: createMessageId("user"),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    // Chỉ lấy tối đa 10 lượt hội thoại hợp lệ gần nhất (bỏ tin chào mặc định và tin lỗi)
    const historyToSend: ChatHistoryItem[] = get()
      .messages.filter((m) => m.id !== "welcome-msg" && !m.isError)
      .slice(-MAX_HISTORY_TO_SEND)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    set((state) => ({
      messages: [...state.messages, userMsg],
      isLoading: true,
    }));

    try {
      const data = await sendChatMessage({
        message: trimmed,
        history: historyToSend,
      });

      const assistantMsg: ChatMessage = {
        id: createMessageId("bot"),
        role: "assistant",
        content: data.reply,
        createdAt: Date.now(),
        sources: data.sources,
        suggestedProducts: data.suggested_products,
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isLoading: false,
      }));
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: createMessageId("err"),
        role: "assistant",
        content: extractErrorMessage(error),
        createdAt: Date.now(),
        isError: true,
        retryPrompt: trimmed,
      };

      set((state) => ({
        messages: [...state.messages, errorMsg],
        isLoading: false,
      }));
    }
  },
}));
