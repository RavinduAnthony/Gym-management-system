// src/features/auth/pages/login-page.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/core/auth';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { IronCoreLogo } from '@/components/branding/IronCoreLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore((s) => s.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, userId, tenantId, role, firstName, lastName, isTemporaryPassword } = response.data.data;

            login(
                {
                    id: userId,
                    email,
                    firstName: firstName || email.split('@')[0],
                    lastName: lastName || '',
                    role: role,
                    tenantId: tenantId,
                    setupCompleted: true,
                    isTemporaryPassword: isTemporaryPassword ?? false,
                },
                token
            );

            if (isTemporaryPassword) {
                navigate('/reset-password');
                toast.info('Please set a new password to continue.');
            } else {
                navigate('/dashboard');
                toast.success('Successfully logged in!');
            }
        } catch (error: any) {
            console.error('Login failed:', error);
            toast.error(error.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)]" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block hover:scale-105 transition-transform">
                        <IronCoreLogo iconOnly className="mx-auto mb-4 scale-125" />
                    </Link>
                    <h1 className="text-3xl font-display font-bold text-[var(--secondary)] dark:text-white uppercase tracking-tight">
                        Power Your <span className="text-[var(--primary)]">Legacy</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2">Enter your credentials to access the IronCore portal</p>
                </div>

                {/* Form Card */}
                <Card className="p-8 shadow-2xl transition-none" hover={false}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@ironcore.com"
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-[38px] text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary-light)] accent-[var(--primary)]" />
                                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full py-4 text-base group"
                        >
                            Sign In to Portal <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
                        <p className="text-sm text-[var(--text-secondary)]">
                            New to IronCore?{' '}
                            <Link to="/register" className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-bold transition-colors">
                                Register Your Facility
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
