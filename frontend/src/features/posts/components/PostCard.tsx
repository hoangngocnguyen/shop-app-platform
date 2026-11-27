import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight } from "lucide-react";
import { PublicPostListItem } from "../types";
import { ROUTES } from "@/constants/routes";

interface PostCardProps {
  post: PublicPostListItem;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const topicSlug = post.topic_slug || "huong-dan";
  const postUrl = ROUTES.POSTS.DETAIL(topicSlug, post.slug);

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : new Date(post.created_at).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

  return (
    <article className="group flex flex-col bg-surface-card border border-surface-border rounded-2xl overflow-hidden hover:border-[#002b49]/30 hover:shadow-lg transition-all duration-300">
      {/* Thumbnail */}
      <Link href={postUrl} className="relative aspect-video w-full overflow-hidden bg-surface-bg block">
        {post.thumbnail_url ? (
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#002b49]/5 to-[#002b49]/15 text-[#002b49]/40 font-bold text-sm">
            ShopApp Media
          </div>
        )}
        {post.topic_name && (
          <span className="absolute top-3 left-3 bg-[#002b49]/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
            {post.topic_name}
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-text-muted mb-2.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base sm:text-lg text-text-main line-clamp-2 group-hover:text-[#002b49] transition-colors leading-snug mb-2">
            <Link href={postUrl}>{post.title}</Link>
          </h3>

          {/* Summary */}
          {post.summary && (
            <p className="text-xs sm:text-sm text-text-sub line-clamp-3 leading-relaxed mb-4">
              {post.summary}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-text-sub font-medium truncate">
            <User className="w-3.5 h-3.5 shrink-0 text-text-muted" />
            <span className="truncate">{post.author_name || "Ban Biên Tập"}</span>
          </div>

          <Link
            href={postUrl}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#002b49] group-hover:translate-x-0.5 transition-transform shrink-0"
          >
            Đọc tiếp
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
