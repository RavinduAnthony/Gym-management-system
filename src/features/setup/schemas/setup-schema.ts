import { z } from 'zod';

// Stage 1: Gym Profile
export const gymProfileSchema = z.object({
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    district: z.string().min(2, 'District is required'),
    openingHours: z.string().min(2, 'Opening hours (e.g., 6 AM - 10 PM) are required'),
    logo: z.any().optional(), // In a real app, refine for File type
});
export type GymProfileFormData = z.infer<typeof gymProfileSchema>;

// Stage 2: Membership Plans
// We allow editing defaults, so we expect an array
export const membershipPlansSchema = z.object({
    plans: z.array(
        z.object({
            name: z.string().min(1, 'Name is required'),
            durationInMonths: z.number().min(1, 'Duration must be at least 1 month'),
            price: z.number().min(0, 'Price must be positive'),
        })
    ).min(1, 'At least one membership plan is required'),
});
export type MembershipPlansFormData = z.infer<typeof membershipPlansSchema>;

// Stage 3: Staff
export const staffSchema = z.object({
    staff: z.array(
        z.object({
            name: z.string().min(2, 'Name is required'),
            email: z.string().email('Invalid email address'),
            role: z.enum(['Receptionist', 'Trainer']),
        })
    ), // Can be empty if they want to skip for now
});
export type StaffFormData = z.infer<typeof staffSchema>;

// Stage 4: Payment Settings
export const paymentSettingsSchema = z.object({
    currency: z.string().min(1, 'Currency is required'),
    taxRate: z.number().min(0, 'Tax rate must be positive').max(100, 'Tax rate cannot exceed 100%'),
    paymentMethods: z.array(z.string()).min(1, 'Select at least one payment method'),
});
export type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>;
