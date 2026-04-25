// src/features/auth/pages/reset-password-page.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/core/auth';
import { usersApi } from '@/features/settings/api/users-api';
import { toast } from 'sonner';
import { IronCoreLogo } from '@/components/branding/IronCoreLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const user = useAuthStore((s) => s.user);
    const updateUser = useAuthStore((s) => s.updateUser);
    const navigate = useNavigate();

    // If no user or not using a temporary password, redirect away
    if (!user) {
        navigate('/login');
        return null;
    }
    if (!user.isTemporaryPassword) {
        navigate('/dashboard');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await usersApi.resetPassword(user.id, newPassword);
            updateUser({ isTemporaryPassword: false });
            toast.success('Password updated successfully!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)]" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <IronCoreLogo iconOnly className="mx-auto mb-4 scale-125" />
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-semibold mb-4">
                        <KeyRound className="w-4 h-4" />
                        Temporary Password Detected
                    </div>
                    <h1 className="text-3xl font-display font-bold text-[var(--secondary)] dark:text-white uppercase tracking-tight">
                        Set Your <span className="text-[var(--primary)]">Password</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        You are using a temporary password. Please set a new password to continue.
                    </p>
                </div>

                <Card className="p-8 shadow-2xl transition-none" hover={false}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Input
                                label="New Password"
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-[38px] text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
                                onClick={() => setShowNew(!showNew)}
                            >
                                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="relative">
                            <Input
                                label="Confirm New Password"
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your new password"
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-[38px] text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
                                onClick={() => setShowConfirm(!showConfirm)}
                            >
                                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full py-4 text-base group"
                        >
                            <ShieldCheck className="mr-2 w-5 h-5" />
                            Confirm New Password
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
