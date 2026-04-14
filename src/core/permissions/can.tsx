import { usePermissions } from './use-permissions';

interface CanProps {
    /** The permission key required to render children. */
    permission: string;
    /** Optional fallback to render when permission is denied. */
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's permissions.
 *
 * @example
 * <Can permission="members.create">
 *   <Button>Add Member</Button>
 * </Can>
 */
export function Can({ permission, fallback = null, children }: CanProps) {
    const { canDo, isLoading } = usePermissions();

    // While loading permissions, hide the gated content to avoid flicker
    if (isLoading) return null;

    return canDo(permission) ? <>{children}</> : <>{fallback}</>;
}
