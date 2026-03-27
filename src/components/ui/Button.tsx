// src/components/ui/Button.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'secondary' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isSuccess?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, isSuccess, fullWidth, children, disabled, ...props }, ref) => {
    
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return `bg-[#C62828] text-white font-black hover:bg-[#B71C1C] shadow-md shadow-black/30 hover:shadow-lg hover:shadow-black/40 border border-red-800/30`;
        case 'ghost':
          return `bg-transparent border border-[#FF3B30]/40 text-[#FF3B30] hover:bg-[#FF3B30]/8 hover:border-[#FF3B30]/60`;
        case 'danger':
          return `bg-[var(--danger)] text-white hover:bg-red-700 shadow-lg shadow-red-500/20`;
        case 'secondary':
          return `bg-[var(--surface-alt)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]`;
        case 'success':
           return `bg-[var(--success)] text-white hover:bg-green-600 shadow-lg shadow-green-500/20`;
        default:
          return `bg-[#FF3B30] text-white shadow-[0_4px_20px_0_rgba(255,59,48,0.5)]`;
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm': return 'px-4 py-2 text-xs h-9';
        case 'md': return 'px-6 py-2.5 text-[14px] h-12';
        case 'lg': return 'px-10 py-4 text-base h-16';
        default: return 'px-6 py-2.5 text-sm h-12';
      }
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        disabled={disabled || isLoading}
        className={`
          relative inline-flex items-center justify-center font-bold rounded-lg
          transition-all duration-200 outline-none focus:ring-4 focus:ring-[var(--primary-light)]
          disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter
          ${getVariantStyles()}
          ${getSizeStyles()}
          ${fullWidth ? 'w-full' : ''}
          ${className || ''}
        `}
        {...(props as any)}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
