// src/components/branding/IronCoreLogo.tsx
import { Dumbbell } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const IronCoreLogo = ({ className = '', iconOnly = false }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-[var(--primary)] p-2.5 rounded-lg text-white shadow-xl shadow-red-950/20">
        <Dumbbell className="w-6 h-6 stroke-[2.5]" />
      </div>
      {!iconOnly && (
        <span className="font-display text-2xl font-black tracking-tighter text-[var(--text-primary)] leading-none uppercase">
          IRON<span className="text-[var(--primary)]">CORE</span>
          <div className="h-1 w-full bg-[var(--primary)]/10 mt-1 rounded-full overflow-hidden">
             <div className="h-full w-1/3 bg-[var(--primary)]" />
          </div>
        </span>
      )}
    </div>
  );
};
