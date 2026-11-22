"use client";

import React, { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { useChatStore } from "../stores/useChatStore";

// Lazy-load toàn bộ ChatPanel (kèm react-markdown & remark) chỉ khi người dùng bấm mở hộp thoại
const LazyChatPanel = dynamic(
  () => import("./ChatPanel").then((mod) => mod.ChatPanel),
  { ssr: false },
);

export const ChatWidget: React.FC = () => {
  const pathname = usePathname();
  const { isOpen, toggleChat, closeChat } = useChatStore();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    closeChat();
    // Trả focus về nút mở chat để hỗ trợ điều hướng bằng bàn phím
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, [closeChat]);

  // Ẩn widget tư vấn khách hàng trên các trang quản trị /admin/*
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && <LazyChatPanel onClose={handleClose} />}

      <button
        ref={triggerRef}
        type="button"
        onClick={toggleChat}
        aria-label={isOpen ? "Đóng trợ lý AI" : "Mở trợ lý AI HoangShop"}
        aria-expanded={isOpen}
        className="group flex size-14 items-center justify-center rounded-full bg-primary text-primary-contrast shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
      >
        {isOpen ? (
          <X className="size-6" aria-hidden="true" />
        ) : (
          <MessageCircle
            className="size-6 transition-transform group-hover:rotate-6"
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  );
};
