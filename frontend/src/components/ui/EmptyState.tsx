import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateActionObject {
  label: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode | EmptyStateActionObject;
  className?: string;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const renderAction = () => {
    if (!action) return null;
    if (React.isValidElement(action)) return action;
    if (typeof action === 'object' && 'label' in action) {
      const actionObj = action as EmptyStateActionObject;
      return (
        <Button
          onClick={actionObj.onClick}
          size="sm"
          className="shadow-brand-sm"
        >
          {actionObj.label}
        </Button>
      );
    }
    return action as React.ReactNode;
  };

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
      {action && <div className="pt-2">{renderAction()}</div>}
    </div>
  );
}
