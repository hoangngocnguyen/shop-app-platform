import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export function Skeleton({
  className = '',
  variant = 'rounded',
  ...props
}: SkeletonProps) {
  const variantStyles = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
  }[variant];

  return (
    <div
      className={`animate-pulse bg-surface-border/80 ${variantStyles} ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton mẫu cho thẻ danh sách địa chỉ hoặc sản phẩm
 */
export function CardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-surface-border/60 bg-surface-card space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
