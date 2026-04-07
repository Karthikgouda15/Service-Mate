import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import BookingFlow from './pages/BookingFlow';
import Tracking from './pages/Tracking';
import ProviderDashboard from './pages/ProviderDashboard';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import ServiceDetail from './pages/ServiceDetail';
import ForgotPassword from './pages/ForgotPassword';
import useAuthStore from './store/useAuthStore';

const queryClient = new QueryClient();

import toast from 'react-hot-toast';
import useSocket from './hooks/useSocket';

function AppContent() {
    const { user, isAuthenticated } = useAuthStore();
    const location = useLocation();
    const socket = useSocket();
    const isProviderDashboard = location.pathname === '/provider/dashboard';

    useEffect(() => {
        if (isAuthenticated && socket && user) {
            // Join specific rooms for notifications
            if (user.role === 'provider') {
                socket.emit('join_provider_room', user._id);
            }

            // Global listeners for alerts when not on specific pages
            socket.on('new_message_alert', (data) => {
                // Only show toast if not already in that specific chat room (handled by local components)
                if (!location.pathname.includes(`/track/${data.bookingId}`) && 
                    !location.pathname.includes('/provider/dashboard')) {
                    toast.success('New message received!', {
                        icon: '💬',
                        duration: 4000,
                        onClick: () => {
                            // Navigate to relevant page if possible
                        }
                    });
                }
            });

            socket.on('booking_status_updated', (data) => {
                 if (!location.pathname.includes(`/track/`)) {
                    toast.success(`Booking status updated: ${data.status.toUpperCase()}`, {
                        icon: '🔔',
                    });
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('new_message_alert');
                socket.off('booking_status_updated');
            }
        };
    }, [isAuthenticated, socket, user, location.pathname]);

    return (
        <div className="min-h-screen font-body">
            {!isProviderDashboard && <Navbar />}
            <main className={isProviderDashboard ? '' : 'container mx-auto px-4 pb-24'}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/service/:category" element={<ServiceDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/bookings" element={isAuthenticated ? <MyBookings /> : <Navigate to="/login" />} />
                    <Route path="/booking/:id" element={isAuthenticated ? <BookingFlow /> : <Navigate to="/login" />} />
                    <Route path="/track/:id" element={isAuthenticated ? <Tracking /> : <Navigate to="/login" />} />
                    <Route path="/provider/dashboard" element={isAuthenticated && user?.role === 'provider' ? <ProviderDashboard /> : <Navigate to="/login" />} />
                    <Route path="/admin/dashboard" element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
                </Routes>
            </main>
            <Toaster position="top-center" />
        </div>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <AppContent />
            </Router>
        </QueryClientProvider>
    );
}

export default App;

