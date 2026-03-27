import { useThemeStore, type ThemeMode } from './theme-store';

export function useTheme() {
    const mode = useThemeStore((s) => s.mode);
    const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
    const setMode = useThemeStore((s) => s.setMode);
    const setTokenOverride = useThemeStore((s) => s.setTokenOverride);
    const resetOverrides = useThemeStore((s) => s.resetOverrides);

    return {
        /** Current mode setting: 'light' | 'dark' | 'system' */
        mode,
        /** Resolved actual theme: 'light' | 'dark' */
        theme: resolvedTheme,
        /** Set the theme mode */
        setTheme: (mode: ThemeMode) => setMode(mode),
        /** Override a specific design token at runtime */
        setTokenOverride,
        /** Reset all runtime overrides */
        resetOverrides,
        /** Convenience: is current theme dark? */
        isDark: resolvedTheme === 'dark',
    };
}
