import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
}

export function LoadMoreButton({ hasMore, isLoading, onLoadMore }: LoadMoreButtonProps) {
    if (!hasMore) return null;

    return (
        <div className="flex justify-center pt-4">
            <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-4 py-2.5 text-sm font-semibold text-text-main shadow-sm transition hover:bg-surface-bg disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải...
                    </>
                ) : (
                    "Xem thêm"
                )}
            </button>
        </div>
    );
}
