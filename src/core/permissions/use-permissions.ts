import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/core/auth/auth-store';
import { fetchMyPermissions } from './permissions-api';

/**
 * Fetches and caches the current user's allowed permissions.
 *
 * Owners always get full access without hitting the server.
 * All other roles fetch their permission set from /api/role/my-permissions.
 */
export function usePermissions() {
    const user = useAuthStore((s) => s.user);
    const isOwner = user?.role === 'Owner' || user?.role === 'SuperAdmin';

    const { data: permissions = [], isLoading } = useQuery({
        queryKey: ['my-permissions', user?.id],
        queryFn: fetchMyPermissions,
        // Skip fetch entirely for Owner/SuperAdmin — they have everything
        enabled: !!user && !isOwner,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    /**
     * Returns true if the current user has the given permission.
     * Owner/SuperAdmin always returns true.
     */
    function canDo(permission: string): boolean {
        if (!user) return false;
        if (isOwner) return true;
        return permissions.includes(permission);
    }

    return { canDo, isLoading, permissions };
}
