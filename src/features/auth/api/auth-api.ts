import api from '@/lib/api';

export const authApi = {
    /**
     * Step 1: validate new password + send OTP to the user's registered email.
     */
    forgotPassword: (email: string, newPassword: string, confirmPassword: string) =>
        api.post('/auth/forgot-password', { email, newPassword, confirmPassword }),

    /**
     * Step 2: verify OTP and apply the new password.
     */
    resetPasswordWithOtp: (email: string, otp: string, newPassword: string) =>
        api.post('/auth/reset-password-otp', { email, otp, newPassword }),
};
