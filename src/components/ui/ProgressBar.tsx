// src/components/ui/ProgressBar.tsx
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'primary' | 'success';
  label?: string;
  className?: string;
}

export const ProgressBar = ({ value, color = 'primary', label, className }: ProgressBarProps) => {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {label && <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>}
      <div className="h-2 w-full bg-[var(--surface-alt)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={`h-full rounded-full ${color === 'primary' ? 'bg-[var(--primary)]' : 'bg-[var(--success)]'}`}
        />
      </div>
    </div>
  );
};
