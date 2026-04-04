import { z } from 'zod';

export const ptPackageSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'Package name is required'),
    description: z.string().optional(),
    sessions: z.number().min(1, 'Number of sessions must be at least 1'),
    durationMinutes: z.number().min(1, 'Session duration is required'),
    validityDays: z.number().min(1, 'Validity days required'),
    defaultAmount: z.number().min(0, 'Amount must be 0 or more'),
    status: z.enum(['Active', 'Inactive']).default('Active'),
});

export type PtPackageFormData = z.infer<typeof ptPackageSchema>;

export interface PtPackage extends PtPackageFormData {
    id: string;
    createdAt: string;
}
