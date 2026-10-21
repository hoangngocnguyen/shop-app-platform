import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    }[size];

    const variantStyles = {
      primary:
        'bg-primary hover:bg-primary-hover text-primary-contrast shadow-brand-sm hover:-translate-y-0.5 active:translate-y-0',
      secondary:
        'bg-primary-light hover:bg-primary-light/80 text-primary',
      outline:
        'border border-surface-border bg-surface-card hover:bg-surface-hover text-text-main shadow-brand-sm',
      danger:
        'bg-status-error hover:bg-status-error/90 text-white shadow-brand-sm',
      ghost:
        'text-text-sub hover:text-text-main hover:bg-surface-hover',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
