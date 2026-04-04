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
}

export const NAV_CONFIG: NavItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: ['SuperAdmin', 'Owner'],
    },
    {
        label: 'Members',
        path: '/members',
        icon: Users,
        roles: ['SuperAdmin', 'Owner', 'Receptionist'],
    },
    {
        label: 'Packages',
        path: '/memberships',
        icon: Package,
        roles: ['SuperAdmin', 'Owner', 'Receptionist'],
    },
    {
        label: 'Trainers',
        path: '/trainers',
        icon: Dumbbell,
        roles: ['SuperAdmin', 'Owner'],
    },
    {
        label: 'Services',
        path: '/services',
        icon: Layers,
        roles: ['SuperAdmin', 'Owner'],
    },
    {
        label: 'Payments',
        path: '/payments',
        icon: CreditCard,
        roles: ['SuperAdmin', 'Owner', 'Receptionist'],
    },
    {
        label: 'Attendance',
        path: '/attendance',
        icon: ClipboardCheck,
        roles: ['SuperAdmin', 'Owner', 'Receptionist', 'Trainer'],
    },
    {
        label: 'Reports',
        path: '/reports',
        icon: BarChart3,
        roles: ['SuperAdmin', 'Owner'],
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
        roles: ['SuperAdmin', 'Owner'],
    },
];
