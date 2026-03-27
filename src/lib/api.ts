import axios from 'axios';

// Ensure you have an environment variable for the backend URL,
// or fallback to the standard .NET local dev port.
const baseURL = import.meta.env.VITE_API_URL || 'https://localhost:44304/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token in the future
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('gym-app-token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
