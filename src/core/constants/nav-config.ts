import {
    LayoutDashboard,
    Users,
    CreditCard,
    Package,
    Dumbbell,
    ClipboardCheck,
    BarChart3,
    Settings,
    Building2,
    Layers,
    type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/core/types';

export interface NavItem {
    label: string;
    path: string;
    icon: LucideIcon;
    roles: UserRole[];
    /** Permission key required to see this nav item (checked via usePermissions hook). */
    viewPermission?: string;
}

export const NAV_CONFIG: NavItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: ['SuperAdmin', 'Owner', 'Manager'],
        viewPermission: 'dashboard.view',
    },
    {
        label: 'Members',
        path: '/members',
        icon: Users,
        roles: ['SuperAdmin', 'Owner', 'Manager', 'Receptionist'],
        viewPermission: 'members.view',
    },
    {
        label: 'Packages',
        path: '/memberships',
        icon: Package,
        roles: ['SuperAdmin', 'Owner', 'Manager', 'Receptionist'],
        viewPermission: 'packages.view',
    },
    {
        label: 'Trainers',
        path: '/trainers',
        icon: Dumbbell,
        roles: ['SuperAdmin', 'Owner', 'Manager'],
        viewPermission: 'trainers.view',
    },
    {
        label: 'Services',
        path: '/services',
        icon: Layers,
        roles: ['SuperAdmin', 'Owner', 'Manager', 'Trainer'],
        viewPermission: 'services.view',
    },
    {
        label: 'Payments',
        path: '/payments',
        icon: CreditCard,
        roles: ['SuperAdmin', 'Owner', 'Manager', 'Receptionist'],
        viewPermission: 'payments.view',
    },
    {
        label: 'Attendance',
        path: '/attendance',
        icon: ClipboardCheck,
        roles: ['SuperAdmin', 'Owner', 'Manager', 'Receptionist', 'Trainer'],
        viewPermission: 'attendance.view',
    },
    {
        label: 'Reports',
        path: '/reports',
        icon: BarChart3,
        roles: ['SuperAdmin', 'Owner', 'Manager'],
        viewPermission: 'reports.view',
    },
    {
        label: 'Gym Management',
        path: '/admin/gyms',
        icon: Building2,
        roles: ['SuperAdmin'],
    },
    {
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        roles: ['SuperAdmin', 'Owner', 'Manager'],
        viewPermission: 'settings.view',
    },
];
