// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="block text-sm font-medium text-[var(--text-primary)]">{label}</label>}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 bg-[var(--surface)] 
            border rounded-[var(--radius-md)] text-sm 
            text-[var(--text-primary)] transition-all
            focus:ring-4 focus:ring-[var(--primary-light)] focus:border-[var(--primary)] outline-none
            placeholder:text-[var(--text-tertiary)]
            ${error ? 'border-[var(--primary)]' : 'border-[var(--border)]'}
            ${className || ''}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[var(--primary)] font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
