/** Typed permission key constants — mirror of backend UiPermissionKeys.cs */
export const PERMISSIONS = {
    // Dashboard
    DASHBOARD_VIEW: 'dashboard.view',

    // Members
    MEMBERS_VIEW:   'members.view',
    MEMBERS_CREATE: 'members.create',
    MEMBERS_EDIT:   'members.edit',
    MEMBERS_DELETE: 'members.delete',

    // Memberships (enrollments)
    MEMBERSHIPS_VIEW:   'memberships.view',
    MEMBERSHIPS_CREATE: 'memberships.create',
    MEMBERSHIPS_EDIT:   'memberships.edit',

    // Packages (pricing tiers)
    PACKAGES_VIEW:   'packages.view',
    PACKAGES_CREATE: 'packages.create',
    PACKAGES_EDIT:   'packages.edit',
    PACKAGES_DELETE: 'packages.delete',

    // Trainers
    TRAINERS_VIEW:   'trainers.view',
    TRAINERS_CREATE: 'trainers.create',
    TRAINERS_EDIT:   'trainers.edit',
    TRAINERS_DELETE: 'trainers.delete',

    // Services
    SERVICES_VIEW:   'services.view',
    SERVICES_MANAGE: 'services.manage',

    // Payments
    PAYMENTS_VIEW:   'payments.view',
    PAYMENTS_CREATE: 'payments.create',

    // Attendance
    ATTENDANCE_VIEW:     'attendance.view',
    ATTENDANCE_CHECK_IN: 'attendance.check_in',

    // Reports
    REPORTS_VIEW: 'reports.view',

    // Settings
    SETTINGS_VIEW:         'settings.view',
    SETTINGS_USERS_MANAGE: 'settings.users_manage',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];
