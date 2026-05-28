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

    // Membership Info (managed separately in Memberships table)
    membershipPlanId: z.string().min(1, 'Membership plan is required'),
    membershipStartDate: z.string().min(1, 'Start date is required'),
    membershipEndDate: z.string().min(1, 'End date is required'),
    paymentStatus: z.enum(['Paid', 'Pending']),
    trainerId: z.string().optional(),
});

export type MemberFormData = z.infer<typeof memberSchema>;

// What the backend returns for a Member record (no membership fields)
export interface MemberRecord {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
    joinDate: string;
    branchId?: string;
    branchName?: string;
    status: string;
    email?: string;
    emergencyContact?: string;
    address?: string;
    height?: number;
    weight?: number;
    medicalConditions?: string;
    photo?: string;
    trainerId?: string;
    createdAt: string;
}

// What the backend returns for a Membership record
export interface MembershipRecord {
    id: string;
    memberId: string;
    packageId: string;
    packageName: string;
    startDate: string;
    endDate: string;
    price: number;
    discount: number;
    paymentStatus: string;
    createdAt: string;
}

// Combined type used by the frontend (member + active membership)
export interface Member extends MemberRecord {
    // Active membership data (populated from Memberships table)
    membershipId?: string;
    membershipPlanId?: string;
    membershipStartDate?: string;
    membershipEndDate?: string;
    paymentStatus?: string;
}

export interface PaymentRecord {
    id: string;
    memberId: string;
    date: string;
    planName: string;
    amount: number;
}

