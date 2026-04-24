import axios from 'axios';

const api = axios.create({
    baseURL: 'https://service-mate-8q0p.onrender.com/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Global response interceptor for error handling
api.interceptors.response.use((response) => response, async (error) => {
    if (error.response?.status === 401) {
        // Token is invalid or expired. Clear session and redirect to clear state.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default api;
