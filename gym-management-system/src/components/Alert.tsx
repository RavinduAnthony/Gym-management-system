import { useEffect } from 'react';
import '../styles/Alert.css';

interface AlertProps {
    message: string;
    type: 'error' | 'success';
    onClose: () => void;
    duration?: number;
}

export default function Alert({ message, type, onClose, duration = 3000 }: AlertProps) {
    
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        if (type === 'success') {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        } else {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        }
    };

    return (
        <div className="alert-overlay" onClick={onClose}>
            <div className={`alert-container alert-${type}`} onClick={(e) => e.stopPropagation()}>
                <div className="alert-icon">
                    {getIcon()}
                </div>
                <div className="alert-content">
                    <h3 className="alert-title">{type === 'success' ? 'Success' : 'Error'}</h3>
                    <p className="alert-message">{message}</p>
                </div>
                <button className="alert-close" onClick={onClose} aria-label="Close">
                    ×
                </button>
            </div>
        </div>
    );
}
