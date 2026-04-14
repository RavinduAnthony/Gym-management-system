import { z } from 'zod';

export const ptPackageSchema = z.object({
    id: z.string().optional(),
    trainerId: z.string().min(1, 'Trainer is required'),
    trainerName: z.string().optional(), // denormalised for display
    studentCount: z.number().min(0, 'Student count must be 0 or more'),
    paymentRatePerStudent: z.number().min(0, 'Rate must be 0 or more'),
    status: z.enum(['Active', 'Inactive']),
});

export type PtPackageFormData = z.infer<typeof ptPackageSchema>;

export interface PtPackage extends PtPackageFormData {
    id: string;
    createdAt: string;
}
