export const ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',

    // Gym / Tenant
    GYMS: '/gyms',
    GYM_PROFILE: '/gyms/profile',
    GYM_SETUP: '/gyms/setup',

    // Members
    MEMBERS: '/members',
    MEMBER_BY_ID: (id: string) => `/members/${id}`,
    MEMBER_RENEW: (id: string) => `/members/${id}/renew`,

    // Memberships & Packages
    PACKAGES: '/packages',
    PACKAGE_BY_ID: (id: string) => `/packages/${id}`,

    // Trainers
    TRAINERS: '/trainers',
    TRAINER_BY_ID: (id: string) => `/trainers/${id}`,
    TRAINER_SCHEDULE: (id: string) => `/trainers/${id}/schedule`,

    // Payments
    PAYMENTS: '/payments',
    PAYMENT_INVOICE: (id: string) => `/payments/${id}/invoice`,
    REFUNDS: '/payments/refunds',

    // Attendance
    ATTENDANCE: '/attendance',
    CHECK_IN: '/attendance/check-in',

    // Dashboard & Reports
    DASHBOARD_STATS: '/dashboard/stats',
    REPORTS: '/reports',

    // Gym Classes
    GYM_CLASSES: '/gymclass',
    GYM_CLASS_BY_ID: (id: string) => `/gymclass/${id}`,

    // Class Time Slots
    CLASS_TIME_SLOTS_BY_BRANCH: (branchId: string) => `/classtimeslot/branch/${branchId}`,

    // Settings
    WORKING_HOURS: '/workinghours',
} as const;
