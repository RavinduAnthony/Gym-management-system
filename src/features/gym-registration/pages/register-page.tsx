// src/features/gym-registration/pages/register-page.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import {
    Eye,
    EyeOff,
    Building2,
    User,
    Lock,
    Globe,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';
import {
    gymRegistrationSchema,
    type GymRegistrationFormData,
} from '../schemas/registration-schema';
import { COUNTRIES, TIMEZONES } from '../data/location-data';
import api from '../../../lib/api';
import { toast } from 'sonner';
import { IronCoreLogo } from '@/components/branding/IronCoreLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<GymRegistrationFormData>({
        resolver: zodResolver(gymRegistrationSchema),
        defaultValues: {
            gymName: '',
            ownerName: '',
            ownerEmail: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            country: '',
            timezone: '',
        },
    });

    const onSubmit = async (data: GymRegistrationFormData) => {
        setIsSubmitting(true);
        try {
            await api.post('/tenants', data);
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (error: any) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Failed to register gym. Please check your inputs.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center">
                <Card className="max-w-md p-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--success-light)] flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-[var(--success)]" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-[var(--secondary)] mb-4 uppercase">
                        Welcome to the <span className="text-[var(--primary)]">IronCore</span> Family!
                    </h1>
                    <p className="text-[var(--text-secondary)] mb-8">
                        Your facility registration is complete. We're getting your portal ready...
                    </p>
                    <div className="w-full bg-[var(--surface-alt)] h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--primary)] animate-[width_2s_ease-in-out]" style={{ width: '100%' }} />
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] py-12 px-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)]" />
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[var(--primary)]/5 rounded-full blur-[100px]" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block hover:scale-105 transition-transform">
                        <IronCoreLogo iconOnly className="mx-auto mb-4 scale-125" />
                    </Link>
                    <h1 className="text-4xl font-display font-bold text-[var(--secondary)] dark:text-white uppercase tracking-tight">
                        Register Your <span className="text-[var(--primary)]">Facility</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2 text-lg">
                        Join the elite network of gym owners powered by IronCore technology
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Section: Gym Information */}
                    <Card className="p-8 transition-none" hover={false}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-[var(--secondary)] uppercase tracking-wide">Gym Information</h2>
                                <p className="text-sm text-[var(--text-secondary)]">The foundation of your facility profile</p>
                            </div>
                        </div>

                        <Input
                            label="Gym Name *"
                            placeholder="e.g. Iron Paradise Fitness"
                            {...register('gymName')}
                            error={errors.gymName?.message}
                        />
                    </Card>

                    {/* Section: Owner Details */}
                    <Card className="p-8 transition-none" hover={false}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-[var(--secondary)] uppercase tracking-wide">Owner Details</h2>
                                <p className="text-sm text-[var(--text-secondary)]">Primary management and contact information</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Full Name *"
                                placeholder="John Fernando"
                                {...register('ownerName')}
                                error={errors.ownerName?.message}
                            />
                            <Input
                                label="Phone Number *"
                                placeholder="+94 77 123 4567"
                                {...register('phoneNumber')}
                                error={errors.phoneNumber?.message}
                            />
                            <div className="md:col-span-2">
                                <Input
                                    label="Business Email *"
                                    type="email"
                                    placeholder="owner@yourgym.com"
                                    {...register('ownerEmail')}
                                    error={errors.ownerEmail?.message}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Section: Security */}
                    <Card className="p-8 transition-none" hover={false}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-[var(--secondary)] uppercase tracking-wide">Account Security</h2>
                                <p className="text-sm text-[var(--text-secondary)]">Secure your facility's management portal</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <Input
                                    label="Create Password *"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 8 characters"
                                    {...register('password')}
                                    error={errors.password?.message}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-[38px] text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    label="Confirm Password *"
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Repeat password"
                                    {...register('confirmPassword')}
                                    error={errors.confirmPassword?.message}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-[38px] text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider">
                            Must include uppercase, lowercase, and at least one number.
                        </p>
                    </Card>

                    {/* Section: Localization */}
                    <Card className="p-8 transition-none" hover={false}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-[var(--secondary)] uppercase tracking-wide">Localization</h2>
                                <p className="text-sm text-[var(--text-secondary)]">Setting up your local environment</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-[var(--text-primary)]">Country *</label>
                                <select
                                    {...register('country')}
                                    className={`w-full px-4 py-2.5 bg-[var(--surface)] border rounded-[var(--radius-md)] text-sm focus:ring-4 focus:ring-[var(--primary-light)] focus:border-[var(--primary)] outline-none appearance-none cursor-pointer ${errors.country ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}
                                >
                                    <option value="">Select country</option>
                                    {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                {errors.country && <p className="text-xs text-[var(--primary)] font-medium">{errors.country.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-[var(--text-primary)]">Timezone *</label>
                                <select
                                    {...register('timezone')}
                                    className={`w-full px-4 py-2.5 bg-[var(--surface)] border rounded-[var(--radius-md)] text-sm focus:ring-4 focus:ring-[var(--primary-light)] focus:border-[var(--primary)] outline-none appearance-none cursor-pointer ${errors.timezone ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}
                                >
                                    <option value="">Select timezone</option>
                                    {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                                </select>
                                {errors.timezone && <p className="text-xs text-[var(--primary)] font-medium">{errors.timezone.message}</p>}
                            </div>
                        </div>
                    </Card>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className="w-full py-5 text-lg font-bold group shadow-2xl shadow-red-900/10"
                        >
                            Complete Registration <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                            Already part of the network?{' '}
                            <Link to="/login" className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-bold transition-colors">
                                Sign In Here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
