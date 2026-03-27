// src/app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/core/theme';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                {children}
                <Toaster
                    position="top-right"
                    theme="system"
                    toastOptions={{
                        className: 'bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-2xl shadow-2xl font-body',
                    }}
                />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
