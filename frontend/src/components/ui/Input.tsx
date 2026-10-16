import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text-main"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border bg-surface-bg/70 px-4 py-2.5 text-sm text-text-main placeholder-text-muted shadow-sm transition-all duration-200 outline-none focus:bg-surface-card disabled:opacity-60 ${
              error
                ? 'border-status-error focus:border-status-error focus:ring-4 focus:ring-status-error/15'
                : 'border-surface-border hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-ring-brand/15'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-status-error font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
