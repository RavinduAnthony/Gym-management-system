import { z } from 'zod';

export const trainerSchema = z.object({
    id: z.string().optional(),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required'),
    specialization: z.string().min(2, 'Specialization is required'),
    status: z.enum(['Active', 'Inactive', 'On Leave']),
    branchId: z.string().min(1, 'Branch is required'),

    // Optional Fields
    dateOfBirth: z.string().optional(),
    photo: z.string().optional(),
    certifications: z.array(z.string()).default([]),
    experienceYears: z.number().min(0).optional(),
    availability: z.string().optional(), // e.g. "Mon-Fri 8AM-5PM"
});

export const trainerScheduleSchema = z.object({
    id: z.string().optional(),
    trainerId: z.string().min(1, 'Trainer is required'),
    branchId: z.string().min(1, 'Branch is required'),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    sessionType: z.enum(['One-on-One', 'Group']),
});

export type TrainerFormData = z.infer<typeof trainerSchema>;
export type TrainerScheduleFormData = z.infer<typeof trainerScheduleSchema>;

export interface Trainer extends TrainerFormData {
    id: string;
    createdAt: string;
}

export interface TrainerSchedule extends TrainerScheduleFormData {
    id: string;
    tenantId?: string; // For data isolation
}
