import api from '@/lib/api';
import type { PtPackage, PtPackageFormData } from '../schemas/pt-package-schema';

export const ptPackagesApi = {
    getAll: async (): Promise<PtPackage[]> => {
        const res = await api.get('/ptregistration');
        return (res.data.data ?? []).map(mapFromApi);
    },

    create: async (data: PtPackageFormData): Promise<PtPackage> => {
        const res = await api.post('/ptregistration', data);
        return mapFromApi(res.data.data);
    },

    update: async (id: string, data: PtPackageFormData): Promise<PtPackage> => {
        const res = await api.put(`/ptregistration/${id}`, data);
        return mapFromApi(res.data.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/ptregistration/${id}`);
    },
};

// Map backend camelCase/PascalCase response to frontend PtPackage shape
function mapFromApi(d: Record<string, unknown>): PtPackage {
    return {
        id: d.id as string,
        trainerId: d.trainerId as string,
        trainerName: d.trainerName as string | undefined,
        studentCount: d.studentCount as number,
        paymentRatePerStudent: d.paymentRatePerStudent as number,
        status: d.status as 'Active' | 'Inactive',
        createdAt: d.createdAt as string,
    };
}

