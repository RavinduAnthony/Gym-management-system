import { z } from 'zod';

export const timeSlotItemSchema = z.object({
    dayOfWeek: z.string(),
    startTime: z.string(),
    endTime: z.string(),
});

export interface ClassScheduleItem {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}

export const gymClassSchema = z.object({
    branchId: z.string().min(1, 'Branch is required'),
    name: z.string().min(1, 'Class name is required'),
    category: z.string().optional(),
    description: z.string().optional(),
    instructorId: z.string().min(1, 'Instructor is required'),
    timeSlots: z.array(timeSlotItemSchema).min(1, 'Select at least one time slot'),
    batchStartDate: z.string().min(1, 'Start date is required'),
    batchEndDate: z.string().optional().default(''),
    maxCapacity: z.number().min(1, 'Capacity must be at least 1'),
    hourlyRate: z.number().min(0, 'Hourly rate must be 0 or more'),
    defaultAmount: z.number().min(0, 'Amount must be 0 or more'),
    status: z.enum(['Active', 'Inactive']),
});

export type GymClassFormData = z.infer<typeof gymClassSchema>;
export type TimeSlotItem = z.infer<typeof timeSlotItemSchema>;

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
    schedules?: ClassScheduleItem[];
    batchStartDate: string;
    batchEndDate: string;
    maxCapacity: number;
    hourlyRate: number;
    defaultAmount: number;
    branchId?: string;
    branchName?: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    timeSlots?: TimeSlotItem[];
}

