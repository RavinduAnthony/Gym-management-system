// src/features/auth/pages/forgot-password-page.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { IronCoreLogo } from '@/components/branding/IronCoreLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { authApi } from '../api/auth-api';

// ─── Step 1: collect email + new password ────────────────────────────────────

interface Step1Props {
    onSuccess: (email: string, newPassword: string) => void;
}

function Step1Form({ onSuccess }: Step1Props) {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            await authApi.forgotPassword(email, newPassword, confirmPassword);
            toast.success('OTP sent! Check your email.');
            onSuccess(email, newPassword);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
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
                    label="New Password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
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
                    placeholder="••••••••"
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

            <Button type="submit" isLoading={isLoading} className="w-full py-4 text-base group">
                Send OTP to Email <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
        </form>
    );
}

// ─── Step 2: verify 6-digit OTP ──────────────────────────────────────────────

interface Step2Props {
    email: string;
    newPassword: string;
    onResend: () => void;
}

const OTP_LENGTH = 6;
const OTP_LIFETIME_SECONDS = 60;

function Step2Form({ email, newPassword, onResend }: Step2Props) {
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [secondsLeft, setSecondsLeft] = useState(OTP_LIFETIME_SECONDS);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();

    // Countdown timer
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearInterval(id);
    }, [secondsLeft]);

    const focusNext = useCallback((index: number) => {
        if (index + 1 < OTP_LENGTH) inputRefs.current[index + 1]?.focus();
    }, []);

    const focusPrev = useCallback((index: number) => {
        if (index > 0) inputRefs.current[index - 1]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        // Accept only a single digit
        const digit = value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = digit;
        setDigits(next);
        if (digit) focusNext(index);
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index]) {
            focusPrev(index);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        const next = Array(OTP_LENGTH).fill('');
        pasted.split('').forEach((ch, i) => (next[i] = ch));
        setDigits(next);
        const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
        inputRefs.current[focusIdx]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otp = digits.join('');
        if (otp.length < OTP_LENGTH) {
            toast.error('Please enter all 6 digits.');
            return;
        }

        setIsLoading(true);
        try {
            await authApi.resetPasswordWithOtp(email, otp, newPassword);
            toast.success('Password reset successfully! Please log in.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        setDigits(Array(OTP_LENGTH).fill(''));
        setSecondsLeft(OTP_LIFETIME_SECONDS);
        onResend();
    };

    const mins = Math.floor(secondsLeft / 60);
    const secs = String(secondsLeft % 60).padStart(2, '0');
    const expired = secondsLeft <= 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-[var(--text-secondary)] text-center">
                Enter the 6-digit code sent to{' '}
                <span className="font-semibold text-[var(--text-primary)]">{email}</span>
            </p>

            {/* OTP digit boxes */}
            <div className="flex gap-2 justify-center">
                {digits.map((d, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={i === 0 ? handlePaste : undefined}
                        className="w-11 h-14 text-center text-xl font-bold font-mono rounded-lg border-2 border-[var(--border)] bg-[var(--input-bg,var(--background))] text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                    />
                ))}
            </div>

            {/* Timer / resend */}
            <div className="text-center text-sm">
                {expired ? (
                    <button
                        type="button"
                        onClick={handleResend}
                        className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:text-[var(--primary-dark)] font-semibold transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Resend OTP
                    </button>
                ) : (
                    <span className="text-[var(--text-secondary)]">
                        Code expires in{' '}
                        <span className={`font-mono font-semibold ${secondsLeft <= 10 ? 'text-red-500' : 'text-[var(--primary)]'}`}>
                            {mins}:{secs}
                        </span>
                    </span>
                )}
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full py-4 text-base group" disabled={expired}>
                <CheckCircle className="mr-2 w-5 h-5" />
                Verify & Reset Password
            </Button>
        </form>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Step = 'request' | 'verify';

export function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>('request');
    const [pendingEmail, setPendingEmail] = useState('');
    const [pendingPassword, setPendingPassword] = useState('');
    const [isResending, setIsResending] = useState(false);

    const handleStep1Success = (email: string, newPassword: string) => {
        setPendingEmail(email);
        setPendingPassword(newPassword);
        setStep('verify');
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await authApi.forgotPassword(pendingEmail, pendingPassword, pendingPassword);
            toast.success('A new OTP has been sent to your email.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background decorative elements */}
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
                        Reset Your <span className="text-[var(--primary)]">Password</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        {step === 'request'
                            ? 'Enter your email and choose a new password'
                            : 'Enter the OTP sent to your email'}
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6 justify-center">
                    {(['request', 'verify'] as Step[]).map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                    step === s
                                        ? 'bg-[var(--primary)] text-white'
                                        : i < (['request', 'verify'] as Step[]).indexOf(step)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-[var(--border)] text-[var(--text-secondary)]'
                                }`}
                            >
                                {i + 1}
                            </div>
                            {i < 1 && <div className={`h-px w-10 ${step === 'verify' ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <Card className="p-8 shadow-2xl transition-none" hover={false}>
                    {step === 'request' ? (
                        <Step1Form onSuccess={handleStep1Success} />
                    ) : (
                        <Step2Form
                            email={pendingEmail}
                            newPassword={pendingPassword}
                            onResend={handleResend}
                        />
                    )}

                    <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
                        <p className="text-sm text-[var(--text-secondary)]">
                            Remember your password?{' '}
                            <Link to="/login" className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-bold transition-colors">
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>

            {isResending && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-[var(--background)] rounded-lg p-4 shadow-xl text-sm text-[var(--text-primary)]">
                        Sending new OTP…
                    </div>
                </div>
            )}
        </div>
    );
}
