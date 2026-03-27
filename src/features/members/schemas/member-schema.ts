import { z } from 'zod';

export const memberSchema = z.object({
    id: z.string().optional(),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    gender: z.enum(['Male', 'Female', 'Other', 'Prefer Not to Say']),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    joinDate: z.string().min(1, 'Join date is required'),
    branchId: z.string().min(1, 'Branch is required'),
    status: z.enum(['Active', 'Inactive']),

    // Optional Details
    email: z.string().email('Valid email is required').optional().or(z.literal('')),
    emergencyContact: z.string().optional(),
    address: z.string().optional(),
    height: z.number().positive('Height must be positive').optional(),
    weight: z.number().positive('Weight must be positive').optional(),
    medicalConditions: z.string().optional(),
    photo: z.string().optional(),

    // Membership Info
    membershipPlanId: z.string().min(1, 'Membership plan is required'),
    membershipStartDate: z.string().min(1, 'Start date is required'),
    membershipEndDate: z.string().min(1, 'End date is required'),
    paymentStatus: z.enum(['Paid', 'Pending']),
    trainerId: z.string().optional(),
});

export type MemberFormData = z.infer<typeof memberSchema>;

export interface Member extends MemberFormData {
    id: string;
    createdAt: string;
}

export interface PaymentRecord {
    id: string;
    memberId: string;
    date: string;
    planName: string;
    amount: number;
}
