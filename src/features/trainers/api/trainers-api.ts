import api from '../../../lib/api';
import type { Trainer, TrainerFormData, TrainerSchedule, TrainerScheduleFormData } from '../types';

// Helper to map frontend data shape to backend DTO
const mapToBackendDto = (data: TrainerFormData) => {
    return {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        specialization: data.specialization,
        branchId: data.branchId,
        status: data.status,
        dateOfBirth: data.dateOfBirth || null,
        certifications: data.certifications?.join(', ') || null,
        experienceYears: data.experienceYears || 0,
        availability: data.availability || null,
    };
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
        branchId: data.branchId || "b1",
        status: data.status,
        experienceYears: data.experienceYears,
        certifications: data.certifications ? data.certifications.split(', ') : [],
        availability: data.availability,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        createdAt: data.createdAt,
    };
};

export const trainersApi = {
    // --- Trainers ---
    getTrainers: async (): Promise<Trainer[]> => {
        const response = await api.get('/trainer');
        return response.data.data.map(mapToFrontendTrainer);
    },

    createTrainer: async (data: TrainerFormData): Promise<Trainer> => {
        const payload = mapToBackendDto(data);
        const response = await api.post('/trainer', payload);
        return mapToFrontendTrainer(response.data.data);
    },

    updateTrainer: async (id: string, data: Partial<TrainerFormData>): Promise<Trainer> => {
        const payload = mapToBackendDto(data as TrainerFormData);
        const response = await api.put(`/trainer/${id}`, payload);
        return mapToFrontendTrainer(response.data.data);
    },

    deleteTrainer: async (id: string): Promise<void> => {
        await api.delete(`/trainer/${id}`);
    },

    // --- Schedules (Still Mocked or need backend implementation) ---
    // User only asked for Trainer module CRUD, so I'll keep schedules mocked for now 
    // unless there is a backend for it.
    getSchedulesByTrainer: async (_trainerId: string): Promise<TrainerSchedule[]> => {
        // Implementation for schedules would go here
        return [];
    },

    createSchedule: async (_data: TrainerScheduleFormData): Promise<TrainerSchedule> => {
        // Implementation for schedules would go here
        throw new Error('Not implemented');
    },

    deleteSchedule: async (_id: string): Promise<void> => {
        // Implementation for schedules would go here
        throw new Error('Not implemented');
    }
};
