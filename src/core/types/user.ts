export type UserRole = 'SuperAdmin' | 'Owner' | 'Manager' | 'Receptionist' | 'Trainer' | 'Member';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    customRole?: string;   // Optional tenant-defined role name
    tenantId: string;
    branchId?: string;
    avatar?: string;
    setupCompleted?: boolean;
    isTemporaryPassword?: boolean;
}
