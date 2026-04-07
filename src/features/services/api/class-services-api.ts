import { api } from '@/core/api/axios-instance';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { GymClass, GymClassFormData, ClassScheduleItem } from '../schemas/class-service-schema';

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
    schedules: (data.schedules ?? []).map((s: any): ClassScheduleItem => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
    })),
    batchStartDate: data.batchStartDate?.split('T')[0] ?? '',
    batchEndDate: data.batchEndDate?.split('T')[0] ?? '',
    maxCapacity: data.maxCapacity,
    hourlyRate: data.hourlyRate ?? 0,
    defaultAmount: data.defaultAmount,
    branchId: data.branchId,
    branchName: data.branchName,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    timeSlots: (data.timeSlots ?? []).map((s: any) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
    })),
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
            name: dto.name,
            category: dto.category,
            description: dto.description,
            instructorId: dto.instructorId || null,
            branchId: dto.branchId || null,
            timeSlots: dto.timeSlots,
            batchStartDate: dto.batchStartDate || null,
            batchEndDate: dto.batchEndDate || null,
            maxCapacity: dto.maxCapacity,
            hourlyRate: dto.hourlyRate,
            defaultAmount: dto.defaultAmount,
            status: dto.status,
        };
        const res = await api.post(ENDPOINTS.GYM_CLASSES, payload);
        return mapToGymClass(res.data.data);
    },

    update: async (id: string, dto: GymClassFormData): Promise<GymClass> => {
        const payload = {
            name: dto.name,
            category: dto.category,
            description: dto.description,
            instructorId: dto.instructorId || null,
            branchId: dto.branchId || null,
            timeSlots: dto.timeSlots,
            batchStartDate: dto.batchStartDate || null,
            batchEndDate: dto.batchEndDate || null,
            maxCapacity: dto.maxCapacity,
            hourlyRate: dto.hourlyRate,
            defaultAmount: dto.defaultAmount,
            status: dto.status,
        };
        const res = await api.put(ENDPOINTS.GYM_CLASS_BY_ID(id), payload);
        return mapToGymClass(res.data.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(ENDPOINTS.GYM_CLASS_BY_ID(id));
    },
};

