import api from '@/lib/api';

export async function fetchMyPermissions(): Promise<string[]> {
    const res = await api.get<{ success: boolean; data: string[] }>('/role/my-permissions');
    return res.data.data ?? [];
}
