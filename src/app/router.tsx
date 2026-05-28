import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { AuthGuard, SetupGuard, TempPasswordGuard } from '@/core/auth';
import { PermissionGuard, PERMISSIONS } from '@/core/permissions';

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() =>
    import('@/features/auth/pages/login-page').then((m) => ({ default: m.LoginPage }))
);
const ResetPasswordPage = lazy(() =>
    import('@/features/auth/pages/reset-password-page').then((m) => ({ default: m.ResetPasswordPage }))
);
const RegisterPage = lazy(() =>
    import('@/features/gym-registration/pages/register-page').then((m) => ({ default: m.RegisterPage }))
);
const SetupWizardPage = lazy(() =>
    import('@/features/setup/pages/setup-wizard-page').then((m) => ({ default: m.SetupWizardPage }))
);
const DashboardPage = lazy(() =>
    import('@/features/dashboard/pages/dashboard-page').then((m) => ({ default: m.DashboardPage }))
);
const MembersListPage = lazy(() =>
    import('@/features/members/pages/members-list-page').then((m) => ({ default: m.MembersListPage }))
);
const MembershipsPage = lazy(() =>
    import('@/features/memberships/pages/memberships-page').then((m) => ({ default: m.MembershipsPage }))
);
const TrainersPage = lazy(() =>
    import('@/features/trainers/pages/trainers-page').then((m) => ({ default: m.TrainersPage }))
);
const PaymentsPage = lazy(() =>
    import('@/features/payments/pages/payments-page').then((m) => ({ default: m.PaymentsPage }))
);
const AttendancePage = lazy(() =>
    import('@/features/attendance/pages/attendance-page').then((m) => ({ default: m.AttendancePage }))
);
const ReportsPage = lazy(() =>
    import('@/features/reports/pages/reports-page').then((m) => ({ default: m.ReportsPage }))
);
const SettingsPage = lazy(() =>
    import('@/features/settings/pages/settings-page').then((m) => ({ default: m.SettingsPage }))
);
const ServicesHubPage = lazy(() =>
    import('@/features/services/pages/services-hub-page').then((m) => ({ default: m.ServicesHubPage }))
);
const ClassesPage = lazy(() =>
    import('@/features/services/pages/classes-page').then((m) => ({ default: m.ClassesPage }))
);
const PersonalTrainersServicePage = lazy(() =>
    import('@/features/services/pages/personal-trainers-service-page').then((m) => ({ default: m.PersonalTrainersServicePage }))
);
const LandingPage = lazy(() =>
    import('@/features/landing/pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const ForgotPasswordPage = lazy(() =>
    import('@/features/auth/pages/forgot-password-page').then((m) => ({ default: m.ForgotPasswordPage }))
);

function PageLoader() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
    // Public routes
    {
        path: '/',
        element: (
            <SuspenseWrapper>
                <LandingPage />
            </SuspenseWrapper>
        ),
    },
    {
        path: '/login',
        element: (
            <SuspenseWrapper>
                <LoginPage />
            </SuspenseWrapper>
        ),
    },
    {
        path: '/register',
        element: (
            <SuspenseWrapper>
                <RegisterPage />
            </SuspenseWrapper>
        ),
    },
    {
        path: '/forgot-password',
        element: (
            <SuspenseWrapper>
                <ForgotPasswordPage />
            </SuspenseWrapper>
        ),
    },

    // Protected routes
    {
        element: <AuthGuard />,
        children: [
            {
                path: '/setup',
                element: (
                    <SuspenseWrapper>
                        <SetupWizardPage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: '/reset-password',
                element: (
                    <SuspenseWrapper>
                        <ResetPasswordPage />
                    </SuspenseWrapper>
                ),
            },
            {
                element: <TempPasswordGuard />,
                children: [
                    {
                        element: <SetupGuard />,
                        children: [
                    {
                        element: <AppLayout />,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="/dashboard" replace />,
                            },
                            {
                                path: '/dashboard',
                                element: (
                                    <SuspenseWrapper>
                                        <DashboardPage />
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/members',
                                element: (
                                    <SuspenseWrapper>
                                        <PermissionGuard permission={PERMISSIONS.MEMBERS_VIEW}>
                                            <MembersListPage />
                                        </PermissionGuard>
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/memberships',
                                element: (
                                    <SuspenseWrapper>
                                        <PermissionGuard permission={PERMISSIONS.PACKAGES_VIEW}>
                                            <MembershipsPage />
                                        </PermissionGuard>
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/trainers',
                                element: (
                                    <SuspenseWrapper>
                                        <PermissionGuard permission={PERMISSIONS.TRAINERS_VIEW}>
                                            <TrainersPage />
                                        </PermissionGuard>
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/payments',
                                element: (
                                    <SuspenseWrapper>
                                        <PermissionGuard permission={PERMISSIONS.PAYMENTS_VIEW}>
                                            <PaymentsPage />
                                        </PermissionGuard>
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/attendance',
                                element: (
                                    <SuspenseWrapper>
                                        <PermissionGuard permission={PERMISSIONS.ATTENDANCE_VIEW}>
                                            <AttendancePage />
                                        </PermissionGuard>
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/reports',
                                element: (
                                    <SuspenseWrapper>
                                        <PermissionGuard permission={PERMISSIONS.REPORTS_VIEW}>
                                            <ReportsPage />
                                        </PermissionGuard>
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/settings',
                                element: (
                                    <SuspenseWrapper>
                                        <PermissionGuard permission={PERMISSIONS.SETTINGS_VIEW}>
                                            <SettingsPage />
                                        </PermissionGuard>
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/services',
                                element: (
                                    <SuspenseWrapper>
                                        <PermissionGuard permission={PERMISSIONS.SERVICES_VIEW}>
                                            <ServicesHubPage />
                                        </PermissionGuard>
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/services/classes',
                                element: (
                                    <SuspenseWrapper>
                                        <PermissionGuard permission={PERMISSIONS.SERVICES_VIEW}>
                                            <ClassesPage />
                                        </PermissionGuard>
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/services/personal-trainers',
                                element: (
                                    <SuspenseWrapper>
                                        <PermissionGuard permission={PERMISSIONS.SERVICES_VIEW}>
                                            <PersonalTrainersServicePage />
                                        </PermissionGuard>
                                    </SuspenseWrapper>
                                ),
                            },
                        ],
                    },
                ],
            },
        ],
    },
        ],
    },

    // Fallback
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
    },
]);
