import { api } from '@/core/api/axios-instance';

export interface Branch {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateBranchDto {
    name: string;
    address?: string;
    phone?: string;
}

export interface UpdateBranchDto {
    name: string;
    address?: string;
    phone?: string;
    isActive: boolean;
}

export const branchesApi = {
    getAll: async () => {
        const response = await api.get<{ data: Branch[] }>('/branch');
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await api.get<{ data: Branch }>(`/branch/${id}`);
        return response.data.data;
    },

    create: async (data: CreateBranchDto) => {
        const response = await api.post<{ data: Branch }>('/branch', data);
        return response.data.data;
    },

    update: async (id: string, data: UpdateBranchDto) => {
        const response = await api.put<{ data: Branch }>(`/branch/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/branch/${id}`);
        return response.data;
    },
};
