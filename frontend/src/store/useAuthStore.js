import { create } from 'zustand';
import api from '../api/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,

    login: async (email, password) => {
        set({ loading: true });
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data, token: data.token, isAuthenticated: true, loading: false });
            return { success: true, user: data };
        } catch (error) {
            set({ loading: false });
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            return { success: false, message: errorMessage };
        }
    },

    register: async (userData) => {
        set({ loading: true });
        try {
            const { data } = await api.post('/auth/register', userData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data, token: data.token, isAuthenticated: true, loading: false });
            return { success: true, user: data };
        } catch (error) {
            set({ loading: false });
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            return { success: false, message: errorMessage };
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    }
}));

export default useAuthStore;
