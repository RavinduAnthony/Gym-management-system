import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/core/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;

    // Helper selectors
    hasRole: (roles: UserRole[]) => boolean;
    tenantId: () => string | null;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (user, token) => {
                localStorage.setItem('gym-app-token', token);
                localStorage.setItem('gym-app-tenant-id', user.tenantId);
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('gym-app-token');
                localStorage.removeItem('gym-app-tenant-id');
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (data) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...data } : null,
                })),

            hasRole: (roles) => {
                const user = get().user;
                return user ? roles.includes(user.role) : false;
            },

            tenantId: () => get().user?.tenantId ?? null,
        }),
        {
            name: 'gym-app-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
