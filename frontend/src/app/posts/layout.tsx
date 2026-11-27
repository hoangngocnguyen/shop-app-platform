import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
