export type UserRole = 'SuperAdmin' | 'Owner' | 'Receptionist' | 'Trainer' | 'Member';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    tenantId: string;
    branchId?: string;
    avatar?: string;
    setupCompleted?: boolean;
}
