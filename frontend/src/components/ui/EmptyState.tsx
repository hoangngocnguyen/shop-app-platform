import React from 'react';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center space-y-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center text-text-muted">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-semibold text-text-main">{title}</h3>
        {description && (
          <p className="text-xs text-text-sub leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
