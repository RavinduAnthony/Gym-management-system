import { api } from '@/core/api/axios-instance';
import type { Trainer, TrainerFormData, TrainerSchedule, TrainerScheduleFormData } from '../types';

// Helper to build FormData payload for trainer create/update
const buildFormData = (data: TrainerFormData, photoFile?: File | null): FormData => {
    const fd = new FormData();
    fd.append('firstName', data.firstName);
    fd.append('lastName', data.lastName);
    fd.append('phone', data.phone);
    fd.append('email', data.email);
    fd.append('specialization', data.specialization);
    if (data.branchId) fd.append('branchId', data.branchId);
    if (data.trainerTypeId) fd.append('trainerTypeId', data.trainerTypeId);
    if (data.status) fd.append('status', data.status);
    if (data.dateOfBirth) fd.append('dateOfBirth', data.dateOfBirth);
    if (data.certifications?.length) fd.append('certifications', data.certifications.join(', '));
    if (data.experienceYears != null) fd.append('experienceYears', String(data.experienceYears));
    if (data.availability) fd.append('availability', data.availability);
    if (photoFile) fd.append('photo', photoFile);
    return fd;
};

// Helper to map backend DTO response to frontend data shape
const mapToFrontendTrainer = (data: any): Trainer => {
    return {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        specialization: data.specialization,
        branchId: data.branchId || 'b1',
        trainerTypeId: data.trainerTypeId || undefined,
        trainerTypeName: data.trainerTypeName || undefined,
        status: data.status,
        experienceYears: data.experienceYears,
        certifications: data.certifications ? data.certifications.split(', ') : [],
        availability: data.availability,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        photo: data.photo || undefined,
        age: data.age || undefined,
        createdAt: data.createdAt,
    };
};

export const trainersApi = {
    // --- Trainers ---
    getTrainers: async (): Promise<Trainer[]> => {
        const response = await api.get('/trainer');
        return response.data.data.map(mapToFrontendTrainer);
    },

    createTrainer: async (data: TrainerFormData, photoFile?: File | null): Promise<Trainer> => {
        const fd = buildFormData(data, photoFile);
        const response = await api.post('/trainer', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return mapToFrontendTrainer(response.data.data);
    },

    updateTrainer: async (id: string, data: Partial<TrainerFormData>, photoFile?: File | null): Promise<Trainer> => {
        const fd = buildFormData(data as TrainerFormData, photoFile);
        const response = await api.put(`/trainer/${id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return mapToFrontendTrainer(response.data.data);
    },

    deleteTrainer: async (id: string): Promise<void> => {
        await api.delete(`/trainer/${id}`);
    },

    deleteTrainerPhoto: async (id: string): Promise<void> => {
        await api.delete(`/trainer/${id}/photo`);
    },

    // --- Schedules ---
    getSchedulesByTrainer: async (_trainerId: string): Promise<TrainerSchedule[]> => {
        return [];
    },

    createSchedule: async (_data: TrainerScheduleFormData): Promise<TrainerSchedule> => {
        throw new Error('Not implemented');
    },

    deleteSchedule: async (_id: string): Promise<void> => {
        throw new Error('Not implemented');
    }
};
