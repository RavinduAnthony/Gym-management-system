import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    mode: ThemeMode;
    resolvedTheme: 'light' | 'dark';
    overrides: Record<string, string>;
    setMode: (mode: ThemeMode) => void;
    setTokenOverride: (token: string, value: string) => void;
    resetOverrides: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: 'dark',
            resolvedTheme: 'dark',
            overrides: {},

            setMode: (mode) =>
                set({
                    mode,
                    resolvedTheme: mode === 'system' ? getSystemTheme() : mode,
                }),

            setTokenOverride: (token, value) =>
                set((state) => ({
                    overrides: { ...state.overrides, [token]: value },
                })),

            resetOverrides: () => set({ overrides: {} }),
        }),
        {
            name: 'gym-app-theme',
            partialize: (state) => ({
                mode: state.mode,
                overrides: state.overrides,
            }),
        }
    )
);
