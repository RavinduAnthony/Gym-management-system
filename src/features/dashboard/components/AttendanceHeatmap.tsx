// src/features/dashboard/components/AttendanceHeatmap.tsx
import { motion } from 'framer-motion';

export const AttendanceHeatmap = () => {
    // Generate dummy data for 12 weeks (84 days)
    const weeks = 12;
    const days = 7;
    const data = Array.from({ length: weeks * days }, () => Math.floor(Math.random() * 5));

    const getColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-[var(--surface-alt)] dark:bg-white/5';
            case 1: return 'bg-[var(--success-light)] opacity-60';
            case 2: return 'bg-[var(--success-light)]';
            case 3: return 'bg-[var(--success)] opacity-80';
            case 4: return 'bg-[var(--success)]';
            default: return 'bg-[var(--surface-alt)]';
        }
    };

    return (
        <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-lg uppercase tracking-tight text-[var(--secondary)] dark:text-white">
                    Attendance Heatmap
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-[var(--surface-alt)]" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-[var(--success-light)]" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-[var(--success)]" />
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                {Array.from({ length: weeks }).map((_, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1.5 shrink-0">
                        {Array.from({ length: days }).map((_, dayIdx) => {
                            const level = data[weekIdx * days + dayIdx];
                            return (
                                <motion.div
                                    key={dayIdx}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: (weekIdx * days + dayIdx) * 0.005 }}
                                    className={`w-3.5 h-3.5 rounded-sm ${getColor(level)} cursor-help transition-colors hover:ring-2 hover:ring-[var(--primary)]`}
                                    title={`Level ${level} attendance`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            
            <p className="mt-4 text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider">
                Showing gym activity for the last 12 weeks
            </p>
        </div>
    );
};
