// src/core/auth/temp-password-guard.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './auth-store';

/**
 * Blocks access to protected app routes when the logged-in user
 * is still using a temporary password. Redirects to /reset-password.
 */
export function TempPasswordGuard() {
    const user = useAuthStore((s) => s.user);

    if (user?.isTemporaryPassword) {
        return <Navigate to="/reset-password" replace />;
    }

    return <Outlet />;
}
