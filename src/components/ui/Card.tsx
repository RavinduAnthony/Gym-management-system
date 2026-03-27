// src/components/ui/Card.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'metric';
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { translateY: -4, borderColor: 'var(--primary)', boxShadow: '0 12px 24px -10px rgba(216, 76, 12, 0.2)' } : {}}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`
          bg-[var(--surface)] 
          border border-[var(--border)] 
          rounded-xl
          p-6 shadow-[var(--shadow-card)]
          ${variant === 'metric' ? 'bg-[var(--surface-alt)]' : ''}
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
