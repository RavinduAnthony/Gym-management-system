import { api } from '@/core/api/axios-instance';

export type ServiceType = 'Classes' | 'PersonalTrainers';

export interface ServiceSetting {
    id: string;
    serviceType: ServiceType;
    defaultAmount: number;
    notes?: string;
    updatedAt?: string;
}

export interface UpdateServiceSettingDto {
    defaultAmount: number;
    notes?: string;
}

export const serviceSettingsApi = {
    getAll: async () => {
        const response = await api.get<{ data: ServiceSetting[] }>('/servicesetting');
        return response.data.data;
    },

    update: async (serviceType: ServiceType, data: UpdateServiceSettingDto) => {
        const response = await api.put<{ data: ServiceSetting }>(`/servicesetting/${serviceType}`, data);
        return response.data.data;
    },
};
