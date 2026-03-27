import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from './auth-store';

export function SetupGuard() {
    const { user } = useAuthStore();
    const location = useLocation();

    // If user is an Owner and hasn't completed setup, force them to /setup
    if (user?.role === 'Owner' && user?.setupCompleted === false && location.pathname !== '/setup') {
        return <Navigate to="/setup" replace />;
    }

    // If user has already completed setup or isn't an Owner, prevent access to /setup
    if (location.pathname === '/setup' && (user?.setupCompleted !== false || user?.role !== 'Owner')) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
