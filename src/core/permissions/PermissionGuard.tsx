import { Navigate } from 'react-router-dom';
import { usePermissions } from './use-permissions';

interface Props {
    permission: string;
    children: React.ReactNode;
}

/** Route-level guard — redirects to /dashboard if the permission is not granted. */
export function PermissionGuard({ permission, children }: Props) {
    const { canDo, isLoading } = usePermissions();

    // While permissions are loading, render nothing to avoid flash
    if (isLoading) return null;

    if (!canDo(permission)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
