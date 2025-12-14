import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import '../styles/Login.css';
import Alert from "../components/Alert";
import spartaLogo from '../assets/sparta-logo.jpg';

export default function Login() {
    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState(''); // username or email
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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

    const validateForm = () => {
        if (!identifier.trim()) {
            setAlertMessage('Username or Email is required');
            setAlertType('error');
            return false;
        }

        if (!password) {
            setAlertMessage('Password is required');
            setAlertType('error');
            return false;
        }

        if (password.length < 6) {
            setAlertMessage('Password must be at least 6 characters');
            setAlertType('error');
            return false;
        }

        return true;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setAlertMessage(data.message || 'Login failed');
                setAlertType('error');
                setIsLoading(false);
                return;
            }

            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setAlertMessage('Login successful!');
            setAlertType('success');

            // Redirect based on role
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    navigate('/');
                } else if (data.user.role === 'coach') {
                    navigate('/coach-dashboard');
                } else {
                    navigate('/');
                }
            }, 1000);

        } catch (error) {
            setAlertMessage('Network error. Please try again.');
            setAlertType('error');
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
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
            <div className="login-container">
                {/* Image Side */}
                <div className="login-image-side">
                    {gymImages.map((image, index) => (
                        <div
                            key={index}
                            className={`login-background-image ${index === currentImageIndex ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${image})` }}
                        />
                    ))}
                    <div className="image-overlay">
                        <h2>Welcome to Sparta Gym</h2>
                        <p>Transform your body, elevate your mind</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="login-form-side">
                    <div className="login-card">
                        <div className="login-logo">
                            <img src={spartaLogo} alt="Sparta Gym Logo" />
                        </div>
                        <div className="login-header">
                            <h1>Welcome Back</h1>
                            <p>Sign in to your account</p>
                        </div>

                        <form onSubmit={handleLogin} className="login-form">
                            <div className="form-group">
                                <label htmlFor="identifier">Username or Email</label>
                                <input
                                    id="identifier"
                                    type="text"
                                    name="identifier"
                                    placeholder="Enter username or email"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="form-input"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                            </div>

                            <div className="login-options">
                                <button
                                    type="button"
                                    className="forgot-password-link"
                                    onClick={handleForgotPassword}
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="btn-login"
                                disabled={isLoading}
                            >
                                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                            </button>

                            <div className="login-footer">
                                <p>
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        className="register-link"
                                        onClick={() => navigate('/registration')}
                                    >
                                        Register here
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}