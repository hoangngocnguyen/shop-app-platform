export type ChatRole = "user" | "assistant";

export interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatHistoryItem[];
}

export interface SuggestedProductItem {
  product_id: number;
  product_name: string;
  price: number | string;
  sale_price?: number | string | null;
  in_stock: boolean;
  image_src?: string | null;
  brand?: string | null;
}

export interface ChatResponseData {
  reply: string;
  model?: string | null;
  sources: string[];
  suggested_products: SuggestedProductItem[];
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  sources?: string[];
  suggestedProducts?: SuggestedProductItem[];
  isError?: boolean;
  retryPrompt?: string;
}
