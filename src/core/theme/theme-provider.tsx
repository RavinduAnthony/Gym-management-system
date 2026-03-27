// src/core/theme/theme-provider.tsx
import { useEffect } from 'react';
import { useThemeStore } from './theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { mode, resolvedTheme, overrides, setMode } = useThemeStore();

    // Listen for system theme changes when mode is 'system'
    useEffect(() => {
        if (mode !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            setMode('system');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [mode, setMode]);

    // Apply class logic: dark is base, .light is override
    useEffect(() => {
        const body = document.body;
        
        if (resolvedTheme === 'light') {
            body.classList.add('light');
        } else {
            body.classList.remove('light');
        }
        
        // Also set data-theme on root for CSS color-mix or other advanced logic
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        
        console.log(`Powerhouse Theme: ${resolvedTheme} (mode: ${mode})`);
    }, [resolvedTheme, mode]);

    // Apply runtime token overrides as inline CSS variables
    useEffect(() => {
        const root = document.documentElement;
        const overrideEntries = Object.entries(overrides);

        for (const [token, value] of overrideEntries) {
            root.style.setProperty(`--${token}`, value);
        }

        return () => {
            for (const [token] of overrideEntries) {
                root.style.removeProperty(`--${token}`);
            }
        };
    }, [overrides]);

    return <>{children}</>;
}
