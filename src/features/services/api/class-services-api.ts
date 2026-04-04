import { api } from '@/core/api/axios-instance';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { GymClass, GymClassFormData } from '../schemas/class-service-schema';

const mapToGymClass = (data: any): GymClass => ({
    id: data.id,
    tenantId: data.tenantId,
    name: data.name,
    category: data.category,
    description: data.description,
    instructorId: data.instructorId,
    instructorName: data.instructorName,
    instructorPhone: data.instructorPhone,
    instructorEmail: data.instructorEmail,
    instructorPhoto: data.instructorPhoto,
    instructorSpecialization: data.instructorSpecialization,
    instructorCertifications: data.instructorCertifications ?? [],
    daysOfWeek: data.daysOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    durationMinutes: data.durationMinutes,
    batchStartDate: data.batchStartDate?.split('T')[0] ?? '',
    batchEndDate: data.batchEndDate?.split('T')[0] ?? '',
    maxCapacity: data.maxCapacity,
    defaultAmount: data.defaultAmount,
    branchId: data.branchId,
    branchName: data.branchName,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
});

export const gymClassesApi = {
    getAll: async (): Promise<GymClass[]> => {
        const res = await api.get(ENDPOINTS.GYM_CLASSES);
        return (res.data.data ?? []).map(mapToGymClass);
    },

    getById: async (id: string): Promise<GymClass> => {
        const res = await api.get(ENDPOINTS.GYM_CLASS_BY_ID(id));
        return mapToGymClass(res.data.data);
    },

    create: async (dto: GymClassFormData): Promise<GymClass> => {
        const payload = {
            ...dto,
            daysOfWeek: dto.daysOfWeek.join(','),
            instructorId: dto.instructorId || null,
            branchId: dto.branchId || null,
        };
        const res = await api.post(ENDPOINTS.GYM_CLASSES, payload);
        return mapToGymClass(res.data.data);
    },

    update: async (id: string, dto: GymClassFormData): Promise<GymClass> => {
        const payload = {
            ...dto,
            daysOfWeek: dto.daysOfWeek.join(','),
            instructorId: dto.instructorId || null,
            branchId: dto.branchId || null,
        };
        const res = await api.put(ENDPOINTS.GYM_CLASS_BY_ID(id), payload);
        return mapToGymClass(res.data.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(ENDPOINTS.GYM_CLASS_BY_ID(id));
    },
};

