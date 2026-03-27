// src/components/layout/DarkModeToggle.tsx
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/core/theme';

export const DarkModeToggle = () => {
    const { resolvedTheme, setMode } = useThemeStore();

    const isDark = resolvedTheme === 'dark';

    const toggleTheme = () => {
        setMode(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--border)] transition-colors group"
            aria-label="Toggle dark mode"
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.div
                        key="moon"
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Moon className="w-5 h-5 text-[var(--primary)]" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sun className="w-5 h-5 text-[var(--warning)]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
};
