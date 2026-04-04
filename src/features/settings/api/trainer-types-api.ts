import { api } from '@/core/api/axios-instance';

export interface TrainerType {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateTrainerTypeDto {
    name: string;
    description?: string;
}

export interface UpdateTrainerTypeDto {
    name: string;
    description?: string;
    isActive: boolean;
}

export const trainerTypesApi = {
    getAll: async () => {
        const response = await api.get<{ data: TrainerType[] }>('/trainertype');
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await api.get<{ data: TrainerType }>(`/trainertype/${id}`);
        return response.data.data;
    },

    create: async (data: CreateTrainerTypeDto) => {
        const response = await api.post<{ data: TrainerType }>('/trainertype', data);
        return response.data.data;
    },

    update: async (id: string, data: UpdateTrainerTypeDto) => {
        const response = await api.put<{ data: TrainerType }>(`/trainertype/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/trainertype/${id}`);
        return response.data;
    },
};
