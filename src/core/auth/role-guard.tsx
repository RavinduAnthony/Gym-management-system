import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './auth-store';
import type { UserRole } from '@/core/types';

interface RoleGuardProps {
    allowed: UserRole[];
}

export function RoleGuard({ allowed }: RoleGuardProps) {
    const user = useAuthStore((s) => s.user);

    if (!user || !allowed.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
