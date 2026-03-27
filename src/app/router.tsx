import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { AuthGuard, SetupGuard } from '@/core/auth';

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() =>
    import('@/features/auth/pages/login-page').then((m) => ({ default: m.LoginPage }))
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
const LandingPage = lazy(() =>
    import('@/features/landing/pages/LandingPage').then((m) => ({ default: m.LandingPage }))
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
                                        <MembersListPage />
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/memberships',
                                element: (
                                    <SuspenseWrapper>
                                        <MembershipsPage />
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/trainers',
                                element: (
                                    <SuspenseWrapper>
                                        <TrainersPage />
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/payments',
                                element: (
                                    <SuspenseWrapper>
                                        <PaymentsPage />
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/attendance',
                                element: (
                                    <SuspenseWrapper>
                                        <AttendancePage />
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/reports',
                                element: (
                                    <SuspenseWrapper>
                                        <ReportsPage />
                                    </SuspenseWrapper>
                                ),
                            },
                            {
                                path: '/settings',
                                element: (
                                    <SuspenseWrapper>
                                        <SettingsPage />
                                    </SuspenseWrapper>
                                ),
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
