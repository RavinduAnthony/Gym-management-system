import { z } from 'zod';

export const gymRegistrationSchema = z
    .object({
        gymName: z
            .string()
            .min(2, 'Gym name must be at least 2 characters')
            .max(100, 'Gym name must be less than 100 characters'),

        ownerName: z
            .string()
            .min(2, 'Owner name must be at least 2 characters')
            .max(100, 'Owner name must be less than 100 characters'),

        ownerEmail: z
            .string()
            .email('Please enter a valid email address'),

        phoneNumber: z
            .string()
            .min(7, 'Phone number must be at least 7 digits')
            .max(15, 'Phone number must be less than 15 digits')
            .regex(/^[+]?[\d\s()-]+$/, 'Please enter a valid phone number'),

        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),

        confirmPassword: z.string(),

        country: z.string().min(1, 'Please select a country'),

        timezone: z.string().min(1, 'Please select a timezone'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type GymRegistrationFormData = z.infer<typeof gymRegistrationSchema>;
