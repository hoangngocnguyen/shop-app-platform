"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import {
  Bot,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useChatStore } from "../stores/useChatStore";
import { ChatProductCard } from "./ChatProductCard";

const QUICK_PROMPTS = [
  "Chính sách đổi trả 7 ngày thế nào?",
  "Phí ship và thời gian giao hàng?",
  "Gợi ý sản phẩm nổi bật của shop",
];

function isSafeInternalPath(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

function isSafeExternalUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

interface ChatPanelProps {
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onClose }) => {
  const { isLoading, messages, sendMessage, clearHistory } = useChatStore();

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const resetTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue("");
    resetTextareaHeight();
    await sendMessage(text);
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <section
      aria-label="Cửa sổ Trợ lý mua sắm AI"
      className="flex h-[540px] max-h-[calc(100vh-6rem)] w-[calc(100vw-2rem)] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-2xl"
    >
      {/* Header */}
      <header className="flex items-center justify-between bg-primary px-4 py-3 text-primary-contrast">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Bot className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold leading-tight">
              Trợ lý AI HoangShop
            </h2>
            <p className="flex items-center gap-1.5 text-[11px] opacity-90">
              <span className="inline-block size-2 rounded-full bg-emerald-300" />
              Sẵn sàng tư vấn 24/7
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearHistory}
            title="Làm mới cuộc trò chuyện"
            aria-label="Làm mới cuộc trò chuyện"
            className="rounded-lg p-1.5 text-primary-contrast/85 transition hover:bg-white/15 hover:text-primary-contrast"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Đóng hộp chat"
            aria-label="Đóng hộp chat"
            className="rounded-lg p-1.5 text-primary-contrast/85 transition hover:bg-white/15 hover:text-primary-contrast"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Danh sách tin nhắn */}
      <div
        role="log"
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto bg-surface-bg px-3.5 py-4"
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? "rounded-br-sm bg-primary text-primary-contrast"
                    : msg.isError
                      ? "rounded-bl-sm border border-rose-200 bg-rose-50 text-rose-700"
                      : "rounded-bl-sm border border-surface-border bg-surface-card text-text-main"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                ) : (
                  <div className="space-y-1.5 break-words [&_h3]:text-sm [&_h3]:font-bold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        a: ({ href, children }) => {
                          const rawHref = (href || "").trim();
                          if (isSafeInternalPath(rawHref)) {
                            return (
                              <Link
                                href={rawHref}
                                className="font-semibold text-primary underline underline-offset-2 hover:opacity-80"
                              >
                                {children}
                              </Link>
                            );
                          }
                          if (isSafeExternalUrl(rawHref)) {
                            return (
                              <a
                                href={rawHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-primary underline underline-offset-2"
                              >
                                {children}
                              </a>
                            );
                          }
                          return <span>{children}</span>;
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>

                    {msg.isError && msg.retryPrompt && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => void sendMessage(msg.retryPrompt!)}
                        className="mt-1 inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                      >
                        <RefreshCw className="size-3" aria-hidden="true" />
                        Thử lại
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Thẻ sản phẩm gợi ý đi kèm (nếu có) */}
              {!isUser &&
                msg.suggestedProducts &&
                msg.suggestedProducts.length > 0 && (
                  <div className="mt-2 w-[85%] space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                      Sản phẩm liên quan
                    </p>
                    {msg.suggestedProducts.map((product) => (
                      <ChatProductCard
                        key={`${msg.id}-p-${product.product_id}`}
                        product={product}
                      />
                    ))}
                  </div>
                )}
            </div>
          );
        })}

        {/* Gợi ý câu hỏi nhanh khi mới mở chat */}
        {messages.length === 1 && !isLoading && (
          <div className="pt-1">
            <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-text-muted">
              <Sparkles className="size-3 text-primary" aria-hidden="true" />
              Gợi ý câu hỏi nhanh:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-full border border-surface-border bg-surface-card px-3 py-1.5 text-left text-xs font-medium text-text-main transition hover:border-primary/50 hover:text-primary"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trạng thái AI đang suy nghĩ */}
        {isLoading && (
          <div className="flex items-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-surface-border bg-surface-card px-3.5 py-2.5 text-xs text-text-muted shadow-xs">
              <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-primary" />
              <span className="ml-1">Đang trả lời...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ô nhập liệu */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-surface-border bg-surface-card p-3"
      >
        <textarea
          ref={inputRef}
          rows={1}
          maxLength={2000}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleTextareaKeyDown}
          placeholder="Nhập câu hỏi của bạn..."
          disabled={isLoading}
          aria-label="Nhập tin nhắn cho trợ lý AI"
          className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border border-surface-border bg-surface-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          aria-label="Gửi tin nhắn"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-contrast transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="size-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
};

export default ChatPanel;
