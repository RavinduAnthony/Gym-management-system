import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:44304/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: inject auth token + tenant ID
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('gym-app-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Tenant ID will be injected from auth store
    const tenantId = localStorage.getItem('gym-app-tenant-id');
    if (tenantId) {
        config.headers['X-Tenant-Id'] = tenantId;
    }

    return config;
});

// Response interceptor: handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('gym-app-token');
            localStorage.removeItem('gym-app-tenant-id');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
