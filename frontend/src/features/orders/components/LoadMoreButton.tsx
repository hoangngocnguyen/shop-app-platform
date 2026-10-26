import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
}

export function LoadMoreButton({ hasMore, isLoading, onLoadMore }: LoadMoreButtonProps) {
    if (!hasMore) return null;

    return (
        <div className="flex justify-center pt-3">
            <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-card px-4 py-2 text-xs sm:text-sm font-medium text-text-main shadow-xs transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Đang tải thêm...</span>
                    </>
                ) : (
                    <span>Xem thêm đơn hàng</span>
                )}
            </button>
        </div>
    );
}
