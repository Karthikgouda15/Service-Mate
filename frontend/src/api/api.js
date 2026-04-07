import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5002/api',
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

// Auto-refresh token logic could be added here
api.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        // Attempt to refresh token logic...
    }
    return Promise.reject(error);
});

export default api;
