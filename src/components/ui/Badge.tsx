// src/components/ui/Badge.tsx
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = ({ className, variant = 'info', children, ...props }: BadgeProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]';
      case 'warning':
        return 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]';
      case 'danger':
        return 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
      case 'info':
        return 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 shadow-[0_0_10px_rgba(216,76,12,0.1)]';
      default:
        return 'bg-white/5 text-[var(--text-secondary)] border-white/10';
    }
  };

  return (
    <div
      className={`
        inline-flex items-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border
        ${getVariantStyles()}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
