import { z } from 'zod';

export const packageBenefitSchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const membershipPackageSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'Package name is required'),
    durationInMonths: z.number().min(1, 'Duration must be at least 1 month'),
    price: z.number().min(0, 'Price cannot be negative'),
    branch: z.string().min(1, 'Branch is required'),
    status: z.enum(['Active', 'Inactive']),

    // Optional Settings
    maxVisits: z.number().optional(),
    trainerIncluded: z.boolean().default(false),
    freezeDays: z.number().optional(),
    discountAllowed: z.boolean().default(false),

    // Billing
    billingFrequency: z.enum(['Monthly', 'FullPayment']).default('Monthly'),

    // Benefits
    benefits: z.array(z.string()).default([]),
});

export type PackageBenefit = z.infer<typeof packageBenefitSchema>;
export type MembershipPackageFormData = z.infer<typeof membershipPackageSchema>;

export interface MembershipPackage extends MembershipPackageFormData {
    id: string;
    createdAt: string;
}
