"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar, AdminHeader } from "@/features/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load sidebar collapsed state from localStorage for persistent UX
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage read errors in private browsing
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  return (
    <div className="min-h-screen bg-surface-bg flex antialiased text-text-main selection:bg-primary-light selection:text-primary">
      {/* 1. DESKTOP FIXED SIDEBAR */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* 2. MOBILE DRAWER SIDEBAR + BACKDROP */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-text-main/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-surface-card shadow-2xl z-50 animate-in slide-in-from-left duration-300">
            <AdminSidebar
              isCollapsed={false}
              onToggleCollapse={() => {}}
              onCloseMobile={() => setIsMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminHeader onOpenMobile={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
