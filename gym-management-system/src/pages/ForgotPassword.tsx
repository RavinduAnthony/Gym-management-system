import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import '../styles/ForgotPassword.css';
import Alert from "../components/Alert";
import spartaLogo from '../assets/sparta-logo.jpg';

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<'error' | 'success'>('success');
    const [isLoading, setIsLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [gymImages, setGymImages] = useState([
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80',
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=80',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80',
        'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&q=80'
    ]);

    // Shuffle array function
    const shuffleArray = (array: string[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Auto-rotate images every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % gymImages.length;
                // Shuffle after completing one rotation
                if (nextIndex === 0) {
                    setGymImages(shuffleArray(gymImages));
                }
                return nextIndex;
            });
        }, 4000);
        return () => clearInterval(interval);
    }, [gymImages.length]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setAlertMessage('Email is required');
            setAlertType('error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setAlertMessage('Please enter a valid email address');
            setAlertType('error');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setAlertMessage(data.message || 'Failed to send OTP');
                setAlertType('error');
                setIsLoading(false);
                return;
            }

            setAlertMessage('OTP sent to your email!');
            setAlertType('success');
            setStep(2);
            setIsLoading(false);

        } catch (error) {
            setAlertMessage('Network error. Please try again.');
            setAlertType('error');
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp.trim()) {
            setAlertMessage('OTP is required');
            setAlertType('error');
            return;
        }

        if (otp.length !== 6) {
            setAlertMessage('OTP must be 6 digits');
            setAlertType('error');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                setAlertMessage(data.message || 'Invalid OTP');
                setAlertType('error');
                setIsLoading(false);
                return;
            }

            setAlertMessage('OTP verified successfully!');
            setAlertType('success');
            setStep(3);
            setIsLoading(false);

        } catch (error) {
            setAlertMessage('Network error. Please try again.');
            setAlertType('error');
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            setAlertMessage('Please fill in all fields');
            setAlertType('error');
            return;
        }

        if (newPassword.length < 6) {
            setAlertMessage('Password must be at least 6 characters');
            setAlertType('error');
            return;
        }

        if (newPassword !== confirmPassword) {
            setAlertMessage('Passwords do not match');
            setAlertType('error');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                setAlertMessage(data.message || 'Failed to reset password');
                setAlertType('error');
                setIsLoading(false);
                return;
            }

            setAlertMessage('Password reset successfully!');
            setAlertType('success');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            setAlertMessage('Network error. Please try again.');
            setAlertType('error');
            setIsLoading(false);
        }
    };

    return (
        <>
            {alertMessage && (
                <Alert
                    message={alertMessage}
                    type={alertType}
                    onClose={() => setAlertMessage(null)}
                />
            )}
            <div className="forgot-password-container">
                {/* Image Side */}
                <div className="forgot-password-image-side">
                    {gymImages.map((image, index) => (
                        <div
                            key={index}
                            className={`forgot-password-background-image ${index === currentImageIndex ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${image})` }}
                        />
                    ))}
                    <div className="image-overlay">
                        <h2>Welcome to Sparta Gym</h2>
                        <p>Transform your body, elevate your mind</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="forgot-password-form-side">
                    <div className="forgot-password-card">
                        <div className="forgot-password-logo">
                            <img src={spartaLogo} alt="Sparta Gym Logo" />
                        </div>
                        <div className="forgot-password-header">
                            <h1>Reset Password</h1>
                            <p>
                                {step === 1 && 'Enter your email to receive OTP'}
                                {step === 2 && 'Enter the OTP sent to your email'}
                                {step === 3 && 'Create your new password'}
                            </p>
                        </div>

                        {/* Step 1: Email Input */}
                        {step === 1 && (
                            <form onSubmit={handleSendOTP} className="forgot-password-form">
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-input"
                                        disabled={isLoading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'SENDING...' : 'SEND OTP'}
                                </button>

                                <div className="form-footer">
                                    <p>
                                        Remember your password?{' '}
                                        <button
                                            type="button"
                                            className="back-link"
                                            onClick={() => navigate('/login')}
                                        >
                                            Back to Login
                                        </button>
                                    </p>
                                </div>
                            </form>
                        )}

                        {/* Step 2: OTP Input */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyOTP} className="forgot-password-form">
                                <div className="form-group">
                                    <label htmlFor="otp">OTP Code</label>
                                    <input
                                        id="otp"
                                        type="text"
                                        name="otp"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="form-input otp-input"
                                        disabled={isLoading}
                                        maxLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'VERIFYING...' : 'VERIFY OTP'}
                                </button>

                                <div className="form-footer">
                                    <p>
                                        Didn't receive OTP?{' '}
                                        <button
                                            type="button"
                                            className="back-link"
                                            onClick={() => setStep(1)}
                                        >
                                            Resend
                                        </button>
                                    </p>
                                </div>
                            </form>
                        )}

                        {/* Step 3: Reset Password */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="forgot-password-form">
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="form-input"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            aria-label="Toggle password visibility"
                                        >
                                            {showNewPassword ? "👁️" : "👁️‍🗨️"}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="form-input"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label="Toggle password visibility"
                                        >
                                            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'RESETTING...' : 'RESET PASSWORD'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
