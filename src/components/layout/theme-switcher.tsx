import { Sun, Moon, Monitor, type LucideIcon } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/core/theme';
import { useState, useRef, useEffect } from 'react';

interface ThemeOption {
    mode: ThemeMode;
    label: string;
    icon: LucideIcon;
}

const THEME_OPTIONS: ThemeOption[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Monitor },
];

export function ThemeSwitcher() {
    const { mode, setTheme, isDark } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const CurrentIcon = isDark ? Moon : Sun;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center w-9 h-9 rounded-lg
          text-foreground/60 hover:bg-accent hover:text-foreground
          transition-colors duration-150"
                aria-label="Switch theme"
            >
                <CurrentIcon className="w-5 h-5" />
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-40
          bg-popover text-popover-foreground
          border border-border rounded-xl shadow-lg
          py-1.5 z-50
          animate-in fade-in-0 zoom-in-95"
                >
                    {THEME_OPTIONS.map(({ mode: m, label, icon: Icon }) => (
                        <button
                            key={m}
                            onClick={() => {
                                setTheme(m);
                                setOpen(false);
                            }}
                            className={`
                w-full flex items-center gap-3 px-3 py-2 text-sm
                transition-colors duration-150
                ${mode === m
                                    ? 'text-primary bg-accent'
                                    : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                                }
              `}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                            {mode === m && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
