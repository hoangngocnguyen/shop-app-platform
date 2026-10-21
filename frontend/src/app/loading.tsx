/**
 * File loading.tsx chuẩn của Next.js App Router.
 * Tự động kích hoạt cơ chế React Suspense & Streaming:
 * Ngay khi chuyển trang, Next.js sẽ hiển thị ngay khung Skeleton nhấp nháy này
 * trong khi dữ liệu thật đang được tải từ server/API.
 */
export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] max-w-7xl mx-auto px-6 py-12 space-y-8 animate-pulse">
      {/* Skeleton Header / Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="h-5 w-24 bg-surface-border/80 rounded-lg" />
        <div className="h-5 w-4 bg-surface-border/60 rounded" />
        <div className="h-5 w-36 bg-surface-border/80 rounded-lg" />
      </div>

      {/* Skeleton Hero Banner */}
      <div className="h-48 w-full rounded-3xl bg-surface-card border border-surface-border/80 p-8 flex flex-col justify-center space-y-4 shadow-brand-sm">
        <div className="h-8 w-2/5 bg-surface-border/90 rounded-xl" />
        <div className="h-4 w-3/5 bg-surface-border/60 rounded-lg" />
      </div>

      {/* Skeleton Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="h-40 rounded-2xl bg-surface-card border border-surface-border/70 p-6 space-y-3 shadow-brand-sm">
          <div className="w-10 h-10 rounded-xl bg-surface-border/80" />
          <div className="h-5 w-3/4 bg-surface-border/80 rounded" />
          <div className="h-4 w-1/2 bg-surface-border/50 rounded" />
        </div>
        <div className="h-40 rounded-2xl bg-surface-card border border-surface-border/70 p-6 space-y-3 shadow-brand-sm">
          <div className="w-10 h-10 rounded-xl bg-surface-border/80" />
          <div className="h-5 w-3/4 bg-surface-border/80 rounded" />
          <div className="h-4 w-1/2 bg-surface-border/50 rounded" />
        </div>
        <div className="h-40 rounded-2xl bg-surface-card border border-surface-border/70 p-6 space-y-3 shadow-brand-sm">
          <div className="w-10 h-10 rounded-xl bg-surface-border/80" />
          <div className="h-5 w-3/4 bg-surface-border/80 rounded" />
          <div className="h-4 w-1/2 bg-surface-border/50 rounded" />
        </div>
      </div>
    </div>
  );
}
