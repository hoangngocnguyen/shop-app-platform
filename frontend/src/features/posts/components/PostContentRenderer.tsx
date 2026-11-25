"use client";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface PostContentRendererProps {
  content: string;
  className?: string;
}

const HTML_TAG_REGEX =
  /<\/?(?:p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|section|article|span|strong|em|b|i|br|hr|img|a)\b[^>]*>/i;

const ARTICLE_CLASSES = `prose max-w-none text-text-main text-sm sm:text-base leading-relaxed space-y-4
  [&>h1]:text-2xl sm:[&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-text-main [&>h1]:mt-8 [&>h1]:mb-3 [&>h1]:tracking-tight
  [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-text-main [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:tracking-tight
  [&>h3]:text-lg sm:[&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-text-main [&>h3]:mt-6 [&>h3]:mb-2
  [&>p]:text-text-sub [&>p]:leading-relaxed [&>p]:mb-4
  [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:bg-surface-hover/70 [&>blockquote]:py-3 [&>blockquote]:px-4 [&>blockquote]:rounded-r-xl [&>blockquote]:my-6
  [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ul]:text-text-sub
  [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2 [&>ol]:text-text-sub
  [&>img]:rounded-xl [&>img]:my-6 [&>img]:shadow-xs
  [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:border [&_th]:border-surface-border [&_th]:bg-surface-bg [&_th]:px-3 [&_th]:py-2 [&_td]:border [&_td]:border-surface-border [&_td]:px-3 [&_td]:py-2`;

/**
 * Render nội dung bài viết: tự động nhận diện HTML hoặc Markdown.
 */
export function PostContentRenderer({ content, className = "" }: PostContentRendererProps) {
  const trimmed = content.trim();

  if (!trimmed) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface-bg/50 px-4 py-10 text-center text-sm text-text-muted">
        Chưa có nội dung để xem trước.
      </div>
    );
  }

  if (HTML_TAG_REGEX.test(trimmed)) {
    return (
      <article
        className={`${ARTICLE_CLASSES} ${className}`}
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  return (
    <article className={`${ARTICLE_CLASSES} ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{trimmed}</ReactMarkdown>
    </article>
  );
}
