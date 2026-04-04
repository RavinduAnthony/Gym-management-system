import { z } from 'zod';

export const gymClassSchema = z.object({
    name: z.string().min(1, 'Class name is required'),
    category: z.string().optional(),
    description: z.string().optional(),
    instructorId: z.string().min(1, 'Instructor is required'),
    daysOfWeek: z.array(z.string()).min(1, 'Select at least one day'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    durationMinutes: z.number().min(1, 'Duration must be positive'),
    batchStartDate: z.string().min(1, 'Start date is required'),
    batchEndDate: z.string().min(1, 'End date is required'),
    maxCapacity: z.number().min(1, 'Capacity must be at least 1'),
    defaultAmount: z.number().min(0, 'Amount must be 0 or more'),
    branchId: z.string().min(1, 'Branch is required'),
    status: z.enum(['Active', 'Inactive']),
});

export type GymClassFormData = z.infer<typeof gymClassSchema>;

export interface GymClass {
    id: string;
    tenantId: string;
    name: string;
    category?: string;
    description?: string;
    instructorId?: string;
    instructorName?: string;
    instructorPhone?: string;
    instructorEmail?: string;
    instructorPhoto?: string;
    instructorSpecialization?: string;
    instructorCertifications?: string[];
    daysOfWeek?: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    batchStartDate: string;
    batchEndDate: string;
    maxCapacity: number;
    defaultAmount: number;
    branchId?: string;
    branchName?: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
}

