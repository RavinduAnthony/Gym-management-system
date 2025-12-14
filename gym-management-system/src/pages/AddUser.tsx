import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AddUser.css';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

export default function AddUser() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [nicNumber, setNicNumber] = useState('');
    const [address, setAddress] = useState('');
    const [height, setHeight] = useState(0);
    const [weight, setWeight] = useState(0);
    const [packageType, setPackageType] = useState('');
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<'error' | 'success'>('success');

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 600);
    }, []);

    if (loading) return <Loader />;

    const validateForm = (): boolean => {
        // First Name validation
        if (!firstName.trim()) {
            setAlertMessage('First name is required');
            setAlertType('error');
            return false;
        }
        if (firstName.trim().length < 2) {
            setAlertMessage('First name must be at least 2 characters');
            setAlertType('error');
            return false;
        }

        // Last Name validation
        if (!lastName.trim()) {
            setAlertMessage('Last name is required');
            setAlertType('error');
            return false;
        }
        if (lastName.trim().length < 2) {
            setAlertMessage('Last name must be at least 2 characters');
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

        // Mobile Number validation
        if (!mobileNumber.trim()) {
            setAlertMessage('Mobile number is required');
            setAlertType('error');
            return false;
        }
        const mobileRegex = /^(\+94)?[0-9]{9,10}$/;
        if (!mobileRegex.test(mobileNumber.replace(/\s/g, ''))) {
            setAlertMessage('Please enter a valid mobile number');
            setAlertType('error');
            return false;
        }

        // NIC Number validation
        if (!nicNumber.trim()) {
            setAlertMessage('NIC number is required');
            setAlertType('error');
            return false;
        }
        const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
        if (!nicRegex.test(nicNumber)) {
            setAlertMessage('Please enter a valid NIC number (9 digits + V/X or 12 digits)');
            setAlertType('error');
            return false;
        }

        // Address validation
        if (!address.trim()) {
            setAlertMessage('Address is required');
            setAlertType('error');
            return false;
        }
        if (address.trim().length < 5) {
            setAlertMessage('Address must be at least 5 characters');
            setAlertType('error');
            return false;
        }

        // Height validation
        if (height <= 0) {
            setAlertMessage('Height must be greater than 0');
            setAlertType('error');
            return false;
        }
        if (height < 50 || height > 300) {
            setAlertMessage('Please enter a valid height between 50-300 cm');
            setAlertType('error');
            return false;
        }

        // Weight validation
        if (weight <= 0) {
            setAlertMessage('Weight must be greater than 0');
            setAlertType('error');
            return false;
        }
        if (weight < 20 || weight > 300) {
            setAlertMessage('Please enter a valid weight between 20-300 kg');
            setAlertType('error');
            return false;
        }

        // Package Type validation
        if (!packageType) {
            setAlertMessage('Please select a package type');
            setAlertType('error');
            return false;
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            setAlertMessage('Member added successfully!');
            setAlertType('success');
            // Handle form submission logic here (e.g., API call)
            // After successful submission, you can reset the form or navigate
            setTimeout(() => {
                // Navigate back to dashboard or reset form
            }, 2000);
        }
    }

    return (
        <>
        {
            alertMessage && (
                <Alert
                    message={alertMessage}
                    type={alertType}
                    onClose={() => setAlertMessage('')}
                />
            )
        }
            <div className="adduser-container">
                <button className="home-icon-button" onClick={() => navigate('/')} title="Back to Dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                </button>
                <div className="adduser-header">
                    <h2>Add New Member</h2>
                    <p>Register a new gym member to FitZone</p>
                </div>

                <div className="adduser-form-container">
                    <form className="adduser-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-input"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-input"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter last name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    className="form-input"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="+94 XX XXX XXXX"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>NIC Number</label>
                                <input
                                    type="text"
                                    name="nicNumber"
                                    className="form-input"
                                    value={nicNumber}
                                    onChange={(e) => setNicNumber(e.target.value)}
                                    placeholder="XXXXXXXXXV or XXXXXXXXXXXX"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="form-input"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter address"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Height (cm)</label>
                                <input
                                    type="number"
                                    name="height"
                                    className="form-input"
                                    value={height || ''}
                                    onChange={(e) => setHeight(Number(e.target.value))}
                                    placeholder="Enter height in cm"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Weight (kg)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    className="form-input"
                                    value={weight || ''}
                                    onChange={(e) => setWeight(Number(e.target.value))}
                                    placeholder="Enter weight in kg"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Package Type</label>
                                <select
                                    name="packageType"
                                    className="form-input"
                                    value={packageType}
                                    onChange={(e) => setPackageType(e.target.value)}
                                    required
                                >
                                    <option value="">Select package type</option>
                                    <option value="basic">Basic - 1 Month</option>
                                    <option value="standard">Standard - 3 Months</option>
                                    <option value="premium">Premium - 6 Months</option>
                                    <option value="platinum">Platinum - 1 Year</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Add Member
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
