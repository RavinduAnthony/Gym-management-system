import { api } from '@/core/api/axios-instance';

export interface ClassType {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateClassTypeDto {
    name: string;
    description?: string;
}

export interface UpdateClassTypeDto {
    name: string;
    description?: string;
    isActive: boolean;
}

export const classTypesApi = {
    getAll: async () => {
        const response = await api.get<{ data: ClassType[] }>('/classtype');
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await api.get<{ data: ClassType }>(`/classtype/${id}`);
        return response.data.data;
    },

    create: async (data: CreateClassTypeDto) => {
        const response = await api.post<{ data: ClassType }>('/classtype', data);
        return response.data.data;
    },

    update: async (id: string, data: UpdateClassTypeDto) => {
        const response = await api.put<{ data: ClassType }>(`/classtype/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/classtype/${id}`);
        return response.data;
    },
};
