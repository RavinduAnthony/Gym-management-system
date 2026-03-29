import api from '../../../lib/api';
import type { MembershipPackage, MembershipPackageFormData } from '../types';

// Helper to map frontend data shape to backend DTO
const mapToBackendDto = (data: Partial<MembershipPackageFormData>) => {
    return {
        Name: data.name,
        Duration: data.durationInMonths ? `${data.durationInMonths} Months` : undefined,
        Price: data.price,
        Branch: data.branch,
        Status: data.status,
        MaxVisits: data.maxVisits || null,
        TrainerIncluded: data.trainerIncluded,
        FreezeDays: data.freezeDays || null,
        DiscountAllowed: data.discountAllowed,
        BillingFrequency: data.billingFrequency ?? 'Monthly',
    };
};

// Helper to map backend DTO response to frontend data shape
const mapToFrontendPackage = (data: any): MembershipPackage => {
    return {
        id: data.id,
        name: data.name,
        durationInMonths: parseInt(data.duration?.split(' ')[0]) || 1,
        price: data.price,
        branch: data.branch,
        status: data.status,
        maxVisits: data.maxVisits,
        trainerIncluded: data.trainerIncluded,
        freezeDays: data.freezeDays,
        discountAllowed: data.discountAllowed,
        billingFrequency: data.billingFrequency ?? 'Monthly',
        benefits: [], // Backend doesn't return this yet
        createdAt: data.createdAt,
    };
};

export const membershipsApi = {
    getPackages: async (): Promise<MembershipPackage[]> => {
        const response = await api.get('/package');
        // response.data contains { success: true, data: [...] }
        return response.data.data.map(mapToFrontendPackage);
    },

    createPackage: async (data: MembershipPackageFormData): Promise<MembershipPackage> => {
        const payload = mapToBackendDto(data);
        const response = await api.post('/package', payload);
        return mapToFrontendPackage(response.data.data);
    },

    updatePackage: async (id: string, data: Partial<MembershipPackageFormData>): Promise<MembershipPackage> => {
        const payload = mapToBackendDto(data);
        const response = await api.put(`/package/${id}`, payload);
        return mapToFrontendPackage(response.data.data);
    },

    deletePackage: async (id: string): Promise<void> => {
        await api.delete(`/package/${id}`);
    },
};
