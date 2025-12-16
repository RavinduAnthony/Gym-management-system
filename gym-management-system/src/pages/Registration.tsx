import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import '../styles/Registration.css';
import Alert from "../components/Alert";
import spartaLogo from '../assets/sparta-logo.jpg';

export default function Registration() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [reenterPassword, setReenterPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showReenterPassword, setShowReenterPassword] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<'error' | 'success'>('success');
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
        // Username validation
        if (!username.trim()) {
            setAlertMessage('Username is required');
            setAlertType('error');
            return false;
        }
        if (username.length < 3) {
            setAlertMessage('Username must be at least 3 characters long');
            setAlertType('error');
            return false;
        }
        if (username.length > 20) {
            setAlertMessage('Username must not exceed 20 characters');
            setAlertType('error');
            return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setAlertMessage('Username can only contain letters, numbers, and underscores');
            setAlertType('error');
            return false;
        }

        // Email validation
        if (!email.trim()) {
            setAlertMessage('Email is required');
            setAlertType('error');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setAlertMessage('Please enter a valid email address');
            setAlertType('error');
            return false;
        }

        // Password validation
        if (!password) {
            setAlertMessage('Password is required');
            setAlertType('error');
            return false;
        }
        if (password.length < 8) {
            setAlertMessage('Password must be at least 8 characters long');
            setAlertType('error');
            return false;
        }
        if (!/(?=.*[a-z])/.test(password)) {
            setAlertMessage('Password must contain at least one lowercase letter');
            setAlertType('error');
            return false;
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            setAlertMessage('Password must contain at least one uppercase letter');
            setAlertType('error');
            return false;
        }
        if (!/(?=.*\d)/.test(password)) {
            setAlertMessage('Password must contain at least one number');
            setAlertType('error');
            return false;
        }
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            setAlertMessage('Password must contain at least one special character (@$!%*?&)');
            setAlertType('error');
            return false;
        }

        // Re-enter password validation
        if (!reenterPassword) {
            setAlertMessage('Please re-enter your password');
            setAlertType('error');
            return false;
        }
        if (password !== reenterPassword) {
            setAlertMessage('Passwords do not match');
            setAlertType('error');
            return false;
        }

        return true;
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    firstName: username, // Temporary - you may want to add separate fields
                    lastName: username,
                    mobileNumber: '0000000000', // Temporary
                    nicNumber: '000000000V', // Temporary
                    address: 'N/A',
                    packageType: 'basic',
                    role: 'member'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setAlertMessage(data.message || 'Registration failed');
                setAlertType('error');
                return;
            }

            setAlertMessage("Account created successfully!");
            setAlertType("success");
            
            // Navigate to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setAlertMessage('Network error. Please try again.');
            setAlertType('error');
        }
    }

    return (
        <>
            {alertMessage && (
                <Alert
                    message={alertMessage}
                    type={alertType}
                    onClose={() => setAlertMessage(null)}
                />
            )}
            <div className="registration-container">
                {/* Image Side */}
                <div className="registration-image-side">
                    {gymImages.map((image, index) => (
                        <div
                            key={index}
                            className={`registration-background-image ${index === currentImageIndex ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${image})` }}
                        />
                    ))}
                    <div className="image-overlay">
                        <h2>Welcome to Sparta Gym</h2>
                        <p>Transform your body, elevate your mind</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="registration-form-side">
                    <div className="registration-card">
                        <div className="registration-logo">
                            <img src={spartaLogo} alt="Sparta Gym Logo" />
                        </div>
                        <div className="registration-header">
                            <h1>Create Account</h1>
                            <p>Join us today and start your fitness journey</p>
                        </div>

                        <form onSubmit={handleSubmit} className="registration-form">
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input"
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

                            <div className="form-group">
                                <label htmlFor="reenter_password">Confirm Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        id="reenter_password"
                                        type={showReenterPassword ? "text" : "password"}
                                        name="reenter_password"
                                        placeholder="Re-enter your password"
                                        value={reenterPassword}
                                        onChange={(e) => setReenterPassword(e.target.value)}
                                        className="form-input"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowReenterPassword(!showReenterPassword)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showReenterPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="submit-button">
                                Create Account
                            </button>

                            <div className="form-footer">
                                <p>Already have an account? <a href="/login">Sign in</a></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}