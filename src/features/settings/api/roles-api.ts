import api from '@/lib/api';

export interface AppRoleDto {
    id: string;
    name: string;
    isSystem: boolean;
    color?: string;
}

export interface RolePermissionDto {
    permissionKey: string;
    isAllowed: boolean;
}

export interface CreateRolePayload {
    name: string;
    color?: string;
}

const extract = <T>(res: { data: { data: T } }) => res.data.data;

export const rolesApi = {
    getAll: () => api.get<{ data: AppRoleDto[] }>('/role').then(extract),

    create: (payload: CreateRolePayload) =>
        api.post<{ data: AppRoleDto }>('/role', payload).then(extract),

    remove: (roleName: string) => api.delete(`/role/${encodeURIComponent(roleName)}`),

    getPermissions: (roleName: string) =>
        api.get<{ data: RolePermissionDto[] }>(`/role/${encodeURIComponent(roleName)}/permissions`).then(extract),

    updatePermissions: (roleName: string, permissions: RolePermissionDto[]) =>
        api.put(`/role/${encodeURIComponent(roleName)}/permissions`, { permissions }),
};
