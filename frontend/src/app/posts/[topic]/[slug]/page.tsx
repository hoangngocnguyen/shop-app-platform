"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Calendar,
  ChevronRight,
  Home,
  ArrowLeft,
} from "lucide-react";
import { publicPostApi } from "@/features/posts/api";
import { PublicPostDetail } from "@/features/posts/types";
import { PostContentRenderer } from "@/features/posts/components/PostContentRenderer";
import { ROUTES } from "@/constants/routes";

export default function PostDetailPage() {
  const params = useParams();
  const topicSlug = (params?.topic as string) || "";
  const postSlug = (params?.slug as string) || "";

  const currentKey = topicSlug && postSlug ? `${topicSlug}/${postSlug}` : "";
  const [post, setPost] = useState<PublicPostDetail | null>(null);
  const [loadedKey, setLoadedKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const loading = Boolean(currentKey && loadedKey !== currentKey);

  useEffect(() => {
    let isCancelled = false;
    if (!currentKey) return;

    publicPostApi
      .getPostDetail(topicSlug, postSlug)
      .then((data) => {
        if (!isCancelled) {
          setPost(data);
          setError(null);
          setLoadedKey(currentKey);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải bài viết:", err);
        if (!isCancelled) {
          setPost(null);
          setError(
            err.response?.data?.message ||
              "Không tìm thấy bài viết hoặc bài viết đã bị gỡ."
          );
          setLoadedKey(currentKey);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentKey, topicSlug, postSlug]);

  /* ── SKELETON ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-bg py-6 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="w-48 h-3 bg-surface-hover rounded mb-6" />
          <div className="flex gap-8">
            <div className="flex-1 space-y-4">
              <div className="w-24 h-6 bg-surface-hover rounded-full" />
              <div className="w-full h-9 bg-surface-hover rounded" />
              <div className="w-3/4 h-9 bg-surface-hover rounded" />
              <div className="flex gap-3 mt-2">
                <div className="w-9 h-9 rounded-full bg-surface-hover" />
                <div className="space-y-2 mt-1">
                  <div className="w-28 h-4 bg-surface-hover rounded" />
                  <div className="w-20 h-3 bg-surface-hover rounded" />
                </div>
              </div>
              <div className="w-full aspect-video bg-surface-hover rounded-2xl mt-4" />
              <div className="space-y-3 mt-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-4 bg-surface-hover rounded ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
                ))}
              </div>
            </div>
            <div className="hidden lg:block w-72 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-20 h-14 bg-surface-hover rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface-hover rounded w-full" />
                    <div className="h-3 bg-surface-hover rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── ERROR ── */
  if (error || !post) {
    return (
      <div className="min-h-screen bg-surface-bg py-16 flex items-center justify-center">
        <div className="bg-surface-card border border-surface-border rounded-2xl p-8 sm:p-12 text-center max-w-md mx-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-status-error/10 text-status-error flex items-center justify-center mx-auto mb-4 font-bold text-2xl">!</div>
          <h2 className="text-lg font-bold text-text-main mb-2">Không tìm thấy bài viết</h2>
          <p className="text-xs sm:text-sm text-text-sub mb-6">
            {error || "Bài viết bạn đang tìm không tồn tại hoặc đã bị thay đổi đường dẫn."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={ROUTES.POSTS.ROOT} className="w-full sm:w-auto px-4 py-2 bg-[#002b49] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity">
              Tất cả bài viết
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : new Date(post.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="min-h-screen bg-surface-bg py-5 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── BREADCRUMB (giữ nguyên như cũ) ── */}
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-6 overflow-x-auto pb-1 scrollbar-none">
          <Link href={ROUTES.HOME} className="flex items-center gap-1 hover:text-text-main transition-colors shrink-0">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-text-muted/60 shrink-0" />
          <Link href={ROUTES.POSTS.ROOT} className="hover:text-text-main transition-colors shrink-0">Bài viết</Link>
          <ChevronRight className="w-3 h-3 text-text-muted/60 shrink-0" />
          <Link href={ROUTES.POSTS.TOPIC(topicSlug)} className="hover:text-text-main transition-colors capitalize shrink-0 font-medium">
            {post.topic_name || topicSlug.replace(/-/g, " ")}
          </Link>
          <ChevronRight className="w-3 h-3 text-text-muted/60 shrink-0" />
          <span className="font-semibold text-text-main truncate max-w-[180px] sm:max-w-sm shrink-0">{post.title}</span>
        </nav>

        {/* ── 2-COL LAYOUT ── */}
        <div className="flex gap-8 xl:gap-10 items-start">

          {/* ════ CỘT CHÍNH ════ */}
          <main className="flex-1 min-w-0">
            <div className="bg-surface-card border border-surface-border rounded-2xl shadow-xs overflow-hidden">

              {/* HEADER BÊN TRONG CARD */}
              <div className="px-5 sm:px-8 pt-6 pb-0">
                {/* Topic tag + date (giữ nguyên style) */}
                <div className="flex items-center gap-3 mb-4">
                  <Link
                    href={ROUTES.POSTS.TOPIC(topicSlug)}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-[#002b49]/10 text-[#002b49] text-xs font-bold hover:bg-[#002b49]/20 transition-colors"
                  >
                    {post.topic_name || topicSlug}
                  </Link>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formattedDate}
                  </span>

                </div>

                {/* Tiêu đề */}
                <h1 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight leading-tight mb-5">
                  {post.title}
                </h1>

                {/* Author bar */}
                <div className="flex items-center gap-3 pb-5 border-b border-surface-border">
                  <div className="w-9 h-9 rounded-full bg-[#002b49] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {post.author_name ? post.author_name.charAt(0).toUpperCase() : "B"}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-text-main leading-none mb-0.5">
                      {post.author_name || "Ban Biên Tập ShopApp"}
                    </p>
                  </div>
                </div>
              </div>

              {/* THUMBNAIL — full-width, không có padding */}
              {post.thumbnail_url && (
                <div className="w-full overflow-hidden my-5 px-5 sm:px-8">
                  <div className="rounded-xl overflow-hidden aspect-video bg-surface-bg border border-surface-border/60">
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* SUMMARY */}
              {post.summary && (
                <div className="mx-5 sm:mx-8 mb-5 p-4 rounded-xl bg-primary/5 border-l-4 border-[#002b49] text-text-sub text-sm leading-relaxed italic">
                  &ldquo;{post.summary}&rdquo;
                </div>
              )}

              {/* NỘI DUNG */}
              <div className="px-5 sm:px-8 pb-8">
                <PostContentRenderer content={post.content} className="mb-8" />

                {/* Footer nav */}
                <div className="pt-5 border-t border-surface-border flex items-center justify-between flex-wrap gap-3">
                  <Link
                    href={ROUTES.POSTS.TOPIC(topicSlug)}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#002b49] hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Xem thêm bài viết trong chuyên mục
                  </Link>
                  <Link
                    href={ROUTES.POSTS.ROOT}
                    className="px-4 py-2 rounded-xl bg-surface-bg border border-surface-border text-xs sm:text-sm font-semibold text-text-main hover:bg-surface-hover transition-colors"
                  >
                    Tất cả bài viết
                  </Link>
                </div>
              </div>
            </div>
          </main>

          {/* ════ SIDEBAR BÀI LIÊN QUAN (desktop) ════ */}
          {post.related_posts && post.related_posts.length > 0 && (
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
              <div className="sticky top-6 bg-surface-card border border-surface-border rounded-2xl shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-surface-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-text-main">
                      Bài viết liên quan
                    </h2>
                    <Link href={ROUTES.POSTS.TOPIC(topicSlug)} className="text-[11px] font-semibold text-[#002b49] hover:underline">
                      Xem tất cả →
                    </Link>
                  </div>
                </div>
                <div className="divide-y divide-surface-border">
                  {post.related_posts.slice(0, 6).map((rel) => (
                    <Link
                      key={rel.id}
                      href={ROUTES.POSTS.DETAIL(rel.topic_slug || topicSlug, rel.slug)}
                      className="flex gap-3 p-3 group hover:bg-surface-hover transition-colors"
                    >
                      <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-bg border border-surface-border/50">
                        {rel.thumbnail_url ? (
                          <img
                            src={rel.thumbnail_url}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-text-muted font-bold tracking-wider">
                            SHOP
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-main line-clamp-3 leading-snug group-hover:text-[#002b49] transition-colors">
                          {rel.title}
                        </p>
                        {rel.topic_name && (
                          <span className="mt-1 inline-block text-[10px] font-semibold text-text-muted">
                            {rel.topic_name}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* ── BÀI LIÊN QUAN MOBILE (dưới content) ── */}
        {post.related_posts && post.related_posts.length > 0 && (
          <section className="lg:hidden mt-6">
            <div className="bg-surface-card border border-surface-border rounded-2xl shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-text-main">Bài viết liên quan</h2>
                <Link href={ROUTES.POSTS.TOPIC(topicSlug)} className="text-[11px] font-semibold text-[#002b49] hover:underline">Xem tất cả →</Link>
              </div>
              <div className="divide-y divide-surface-border">
                {post.related_posts.slice(0, 4).map((rel) => (
                  <Link
                    key={rel.id}
                    href={ROUTES.POSTS.DETAIL(rel.topic_slug || topicSlug, rel.slug)}
                    className="flex gap-3 p-3 group hover:bg-surface-hover transition-colors"
                  >
                    <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-bg border border-surface-border/50">
                      {rel.thumbnail_url ? (
                        <img src={rel.thumbnail_url} alt={rel.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-surface-hover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-main line-clamp-3 leading-snug group-hover:text-[#002b49] transition-colors">
                        {rel.title}
                      </p>
                      {rel.topic_name && (
                        <span className="mt-1 inline-block text-[10px] text-text-muted">{rel.topic_name}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
