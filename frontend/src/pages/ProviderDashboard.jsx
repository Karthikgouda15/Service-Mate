import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Briefcase, CalendarCheck, UserCircle, LogOut, Power,
    Plus, Pencil, Trash2, Check, X, ChevronRight, Clock, MapPin,
    IndianRupee, Star, TrendingUp, Menu, XIcon, Save, Navigation, Truck, Activity
} from 'lucide-react';
import api from '../api/api';
import useAuthStore from '../store/useAuthStore';
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';
import ChatPanel from '../components/ChatPanel';
import { MessageSquare } from 'lucide-react';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'My Services', icon: Briefcase },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'profile', label: 'Profile', icon: UserCircle },
];

const SERVICE_CATEGORIES = [
    'Plumbing', 'Electrical', 'Carpentry', 'Cleaning',
    'Painting', 'AC Service', 'Appliance Repair', 'General'
];

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const socket = useSocket();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isOnline, setIsOnline] = useState(false);
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [simulatingBookingId, setSimulatingBookingId] = useState(null);
    const [chatBooking, setChatBooking] = useState(null); // { id, name }
    const simulationRef = useRef(null);

    // Service form state
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceForm, setServiceForm] = useState({
        category: 'General', subcategory: '', basePrice: '', priceUnit: 'hr'
    });

    // Profile edit state
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: '', phone: '', bio: '', startTime: '09:00', endTime: '18:00'
    });

    // OTP for job start
    const [otpInput, setOtpInput] = useState('');

    useEffect(() => {
        fetchData();
        
        // Redundancy: Polling fallback every 30 seconds for 100% visibility guarantee
        const pollInterval = setInterval(() => {
            fetchData();
        }, 30000);

        return () => clearInterval(pollInterval);
    }, []);

    useEffect(() => {
        if (socket && user) {
            // Join personal provider room
            socket.emit('join_provider_room', user._id);

            // Listen for new bookings
            socket.on('new_booking', (booking) => {
                toast.success('New booking request received!', {
                    icon: '🔔',
                    duration: 5000,
                });
                fetchData();
            });

            // Listen for global booking updates for auto-sync and Demo auto-fill
            socket.on('booking_status_updated', (data) => {
                if (data.status === 'confirmed' && data.otp) {
                     toast(`DEMO MODE: Auto-filling Job OTP (${data.otp})`, { 
                        icon: '🚀', 
                        duration: 5000,
                        style: { background: '#000', color: '#fff' }
                    });
                    setOtpInput(data.otp);
                }
                fetchData(); // Auto update tables
            });
        }
        return () => {
            if (socket) {
                socket.off('new_booking');
                socket.off('booking_status_updated');
            }
        };
    }, [socket, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, bookingsRes] = await Promise.all([
                api.get('/providers/me'),
                api.get('/bookings/provider/me')
            ]);
            setProfile(profileRes.data);
            setIsOnline(profileRes.data.isOnline);
            setBookings(bookingsRes.data);

            // Init profile form
            setProfileForm({
                name: profileRes.data.userId?.name || '',
                phone: profileRes.data.userId?.phone || '',
                bio: profileRes.data.bio || '',
                startTime: profileRes.data.workingHours?.start || '09:00',
                endTime: profileRes.data.workingHours?.end || '18:00',
            });
        } catch (error) {
            console.error('Failed to fetch provider data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async () => {
        try {
            const { data } = await api.put('/providers/status');
            setIsOnline(data.isOnline);
            toast.success(data.isOnline ? "You're now online!" : "You're now offline.");
        } catch (error) {
            toast.error('Failed to toggle status');
        }
    };

    // --- Service CRUD ---
    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/providers/me/services', serviceForm);
            setProfile(data);
            setShowServiceForm(false);
            setServiceForm({ category: 'General', subcategory: '', basePrice: '', priceUnit: 'hr' });
            toast.success('Service added!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add service');
        }
    };

    const handleUpdateService = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/providers/me/services/${editingService}`, serviceForm);
            setProfile(data);
            setEditingService(null);
            setShowServiceForm(false);
            setServiceForm({ category: 'General', subcategory: '', basePrice: '', priceUnit: 'hr' });
            toast.success('Service updated!');
        } catch (error) {
            toast.error('Failed to update service');
        }
    };

    const handleDeleteService = async (serviceId) => {
        try {
            const { data } = await api.delete(`/providers/me/services/${serviceId}`);
            setProfile(data);
            toast.success('Service removed');
        } catch (error) {
            toast.error('Failed to delete service');
        }
    };

    const startEditService = (service) => {
        setEditingService(service._id);
        setServiceForm({
            category: service.category,
            subcategory: service.subcategory,
            basePrice: service.basePrice,
            priceUnit: service.priceUnit
        });
        setShowServiceForm(true);
    };

    // --- Booking Actions ---
    const handleAccept = async (id) => {
        try {
            await api.put(`/bookings/${id}/status`, { status: 'confirmed' });
            if (socket) socket.emit('status_change', { bookingId: id, status: 'confirmed' });
            toast.success('Booking accepted!');
            fetchData();
        } catch (error) {
            toast.error('Failed to accept booking');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/bookings/${id}/status`, { status: 'cancelled' });
            if (socket) socket.emit('status_change', { bookingId: id, status: 'cancelled' });
            toast.success('Booking rejected');
            fetchData();
        } catch (error) {
            toast.error('Failed to reject booking');
        }
    };

    const handleStartJob = async (id) => {
        try {
            await api.put(`/bookings/${id}/status`, { status: 'ongoing', otp: otpInput });
            if (socket) socket.emit('status_change', { bookingId: id, status: 'ongoing' });
            toast.success('Job started!');
            setOtpInput('');
            fetchData();
        } catch (error) {
            toast.error('Invalid OTP');
        }
    };

    const handleCompleteJob = async (id) => {
        try {
            await api.put(`/bookings/${id}/status`, { status: 'completed' });
            if (socket) socket.emit('status_change', { bookingId: id, status: 'completed' });
            toast.success('Job completed!');
            fetchData();
        } catch (error) {
            toast.error('Failed to complete job');
        }
    };

    const startTravelSimulation = (booking) => {
        if (simulatingBookingId) return;
        
        const bookingId = booking._id;
        setSimulatingBookingId(bookingId);
        
        let step = 0;
        const totalSteps = 40;
        const startPos = [12.9816, 77.6046]; // Random nearby start
        const endPos = [booking.location.coordinates[1], booking.location.coordinates[0]];
        
        toast.success('Started traveling to customer location');

        simulationRef.current = setInterval(() => {
            step++;
            const lat = startPos[0] + (endPos[0] - startPos[0]) * (step / totalSteps);
            const lng = startPos[1] + (endPos[1] - startPos[1]) * (step / totalSteps);
            
            if (socket) {
                socket.emit('location_update', { bookingId, lat, lng });
            }

            if (step >= totalSteps) {
                clearInterval(simulationRef.current);
                setSimulatingBookingId(null);
                toast.success('You have arrived at the customer location!', { icon: '📍' });
            }
        }, 800);
    };

    // --- Profile Update ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/providers/me', {
                name: profileForm.name,
                phone: profileForm.phone,
                bio: profileForm.bio,
                workingHours: { start: profileForm.startTime, end: profileForm.endTime }
            });
            setProfile(data);
            setEditingProfile(false);
            toast.success('Profile updated!');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- Derived Data ---
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'ongoing');
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-20">
            {/* Horizontal Header */}
            <div className="bg-white border-b border-[#F5F5F7] sticky top-0 z-[40]">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/')} className="flex items-center gap-3 active:scale-95 transition-transform group">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                                <div className="w-5 h-5 bg-white rounded-sm rotate-45" />
                            </div>
                            <span className="text-2xl font-headings font-bold text-black tracking-tighter hidden md:block">ServiceMate</span>
                        </button>
                        
                        <div className="h-10 w-px bg-gray-200 hidden md:block" />

                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-apple">
                                {profile?.userId?.name?.charAt(0) || 'P'}
                            </div>
                        <div className="hidden sm:block">
                            <h2 className="font-black text-xl tracking-tight leading-none mb-1">{profile?.userId?.name || 'Provider'}</h2>
                            <p className="text-[11px] text-[#86868B] font-bold uppercase tracking-widest">{profile?.userId?.email}</p>
                        </div>
                    </div>
                </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleStatus}
                            className={`h-12 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-apple active:scale-95 ${
                                isOnline
                                    ? 'bg-black text-white'
                                    : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-gray-200'
                            }`}
                        >
                            <Power size={14} className={isOnline ? 'animate-pulse' : ''} />
                            {isOnline ? 'Online' : 'Go Online'}
                        </button>
                        
                        <button 
                            onClick={handleLogout}
                            className="w-12 h-12 flex items-center justify-center text-[#86868B] hover:text-red-500 transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Horizontal Navigation */}
                <div className="max-w-7xl mx-auto px-6">
                    <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar py-2">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative py-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        isActive ? 'text-black' : 'text-[#86868B] hover:text-black'
                                    }`}
                                >
                                    <Icon size={14} />
                                    {tab.label}
                                    {tab.id === 'bookings' && pendingBookings.length > 0 && (
                                        <span className="ml-1 bg-black text-white px-1.5 py-0.5 rounded-full text-[9px]">
                                            {pendingBookings.length}
                                        </span>
                                    )}
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6 lg:p-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && <DashboardTab key="dashboard" profile={profile} bookings={bookings} pendingBookings={pendingBookings} activeBookings={activeBookings} completedBookings={completedBookings} totalEarnings={totalEarnings} isOnline={isOnline} />}
                    {activeTab === 'services' && (
                        <ServicesTab
                            key="services"
                            services={profile?.services || []}
                            showForm={showServiceForm}
                            setShowForm={setShowServiceForm}
                            editingService={editingService}
                            setEditingService={setEditingService}
                            serviceForm={serviceForm}
                            setServiceForm={setServiceForm}
                            onAdd={handleAddService}
                            onUpdate={handleUpdateService}
                            onDelete={handleDeleteService}
                            onStartEdit={startEditService}
                        />
                    )}
                    {activeTab === 'bookings' && (
                        <BookingsTab
                            key="bookings"
                            bookings={bookings}
                            pendingBookings={pendingBookings}
                            activeBookings={activeBookings}
                            completedBookings={completedBookings}
                            loading={loading}
                            fetchData={fetchData}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            onStart={handleStartJob}
                            onComplete={handleCompleteJob}
                            onSimulate={startTravelSimulation}
                            simulatingId={simulatingBookingId}
                            otpInput={otpInput}
                            setOtpInput={setOtpInput}
                            onOpenChat={(id, name) => setChatBooking({ id, name })}
                        />
                    )}
                    {activeTab === 'profile' && (
                        <ProfileTab
                            key="profile"
                            profile={profile}
                            editing={editingProfile}
                            setEditing={setEditingProfile}
                            form={profileForm}
                            setForm={setProfileForm}
                            onSave={handleUpdateProfile}
                        />
                    )}
                </AnimatePresence>
            </main>

            {/* Global Chat Overlay */}
            {chatBooking && (
                <ChatPanel 
                    bookingId={chatBooking.id}
                    isOpen={!!chatBooking}
                    onClose={() => setChatBooking(null)}
                    recipientName={chatBooking.name}
                />
            )}
        </div>
    );
};

/* ===================== TAB COMPONENTS ===================== */

const fadeIn = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.2 }
};

// ── Dashboard Overview ──
const DashboardTab = ({ profile, pendingBookings, activeBookings, completedBookings, totalEarnings, isOnline }) => (
    <motion.div {...fadeIn} className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back, {profile?.userId?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
                { label: 'Services', value: profile?.services?.length || 0, icon: Briefcase },
                { label: 'Total Bookings', value: completedBookings.length + activeBookings.length + pendingBookings.length, icon: CalendarCheck },
                { label: 'Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: IndianRupee },
                { label: 'Rating', value: profile?.rating?.toFixed(1) || '0.0', icon: Star },
            ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 group hover:bg-black hover:text-white transition-all duration-300 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white/50">{stat.label}</span>
                        <stat.icon size={16} className="text-gray-300 group-hover:text-white/30" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                        {stat.label === 'Earnings' && <span className="text-[10px] font-black text-green-500 flex items-center gap-0.5"><TrendingUp size={10} /> +12%</span>}
                        {stat.label === 'Rating' && <span className="text-[10px] font-black text-amber-500 flex items-center gap-0.5"><Star size={10} fill="currentColor" /> Top</span>}
                    </div>
                </div>
            ))}
        </div>

        {/* Status + Active Jobs + Recent Activity Feed */}
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <CalendarCheck size={16} /> Current Overview
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="p-4 bg-[#F5F5F7] rounded-2xl space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Availability</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className="font-black text-sm">{isOnline ? 'Active on Map' : 'Offline'}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-[#F5F5F7] rounded-2xl space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shift Hours</p>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-black" />
                                    <span className="font-black text-sm">{profile?.workingHours?.start} — {profile?.workingHours?.end}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                <span className="text-sm font-medium text-gray-500">Pending Requests</span>
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${pendingBookings.length > 0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {pendingBookings.length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                <span className="text-sm font-medium text-gray-500">Active Jobs</span>
                                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-black">
                                    {activeBookings.length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-sm font-medium text-gray-500">Completed Lifecycle</span>
                                <span className="font-black text-sm">{completedBookings.length} Total</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LIVE ACTIVITY FEED */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Activity Feed</h3>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Live</span>
                    </div>
                </div>
                
                <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
                    {/* Activity Item 1: Status Change */}
                    <div className="relative pl-10">
                        <div className="absolute left-0 top-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center z-10 border-4 border-white">
                            <Power size={12} />
                        </div>
                        <p className="text-xs font-black text-black leading-none">Status Updated</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold">You are now {isOnline ? 'Online and visible' : 'Offline'}</p>
                        <p className="text-[8px] text-gray-300 mt-1 uppercase font-black">Just now</p>
                    </div>

                    {/* Activity Item 2: Latest Completed Job */}
                    {completedBookings.slice(0, 3).map((b, idx) => (
                        <div key={b._id} className="relative pl-10">
                            <div className="absolute left-0 top-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center z-10 border-4 border-white">
                                <Check size={12} />
                            </div>
                            <p className="text-xs font-black text-black leading-none">Job Completed</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-bold tracking-tight">Finished "{b.serviceType}" for {b.customerId?.name || 'Customer'}</p>
                            <p className="text-[8px] text-gray-300 mt-1 uppercase font-black">{idx + 1} day{idx !== 0 ? 's' : ''} ago</p>
                        </div>
                    ))}

                    {/* Activity Item 3: Reviews (Simulated pulse from seeded data) */}
                    <div className="relative pl-10">
                        <div className="absolute left-0 top-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center z-10 border-4 border-white">
                            <Star size={12} fill="white" />
                        </div>
                        <p className="text-xs font-black text-black leading-none">New Rating Received</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold">Anjali Sharma left a 5.0★ review</p>
                    </div>
                </div>

                <button 
                    onClick={() => setActiveTab('bookings')}
                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black hover:bg-gray-50 rounded-2xl transition-all border border-dashed border-gray-200"
                >
                    View All Activity
                </button>
            </div>
        </div>
    </motion.div>
);

// ── My Services ──
const ServicesTab = ({ services, showForm, setShowForm, editingService, setEditingService, serviceForm, setServiceForm, onAdd, onUpdate, onDelete, onStartEdit }) => (
    <motion.div {...fadeIn} className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
                <p className="text-gray-400 text-sm mt-1">{services.length} service{services.length !== 1 ? 's' : ''} listed</p>
            </div>
            <button
                onClick={() => { setEditingService(null); setServiceForm({ category: 'General', subcategory: '', basePrice: '', priceUnit: 'hr' }); setShowForm(true); }}
                className="h-11 px-5 bg-black text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors active:scale-95"
            >
                <Plus size={16} /> Add Service
            </button>
        </div>

        {/* Service Form */}
        <AnimatePresence>
            {showForm && (
                <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={editingService ? onUpdate : onAdd}
                    className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 overflow-hidden"
                >
                    <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">
                        {editingService ? 'Edit Service' : 'New Service'}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                            <select
                                value={serviceForm.category}
                                onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}
                                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-black transition-colors font-medium"
                            >
                                {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service Title</label>
                            <input
                                required
                                value={serviceForm.subcategory}
                                onChange={e => setServiceForm({ ...serviceForm, subcategory: e.target.value })}
                                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-black transition-colors font-medium"
                                placeholder="e.g. Pipe Repair"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price (₹)</label>
                            <input
                                type="number"
                                required
                                value={serviceForm.basePrice}
                                onChange={e => setServiceForm({ ...serviceForm, basePrice: e.target.value })}
                                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-black transition-colors font-medium"
                                placeholder="500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price Unit</label>
                            <select
                                value={serviceForm.priceUnit}
                                onChange={e => setServiceForm({ ...serviceForm, priceUnit: e.target.value })}
                                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-black transition-colors font-medium"
                            >
                                <option value="hr">Per Hour</option>
                                <option value="job">Per Job</option>
                                <option value="visit">Per Visit</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="h-11 px-6 bg-black text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors">
                            <Check size={14} /> {editingService ? 'Update' : 'Save'}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setEditingService(null); }} className="h-11 px-6 bg-gray-100 text-black rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
                            <X size={14} /> Cancel
                        </button>
                    </div>
                </motion.form>
            )}
        </AnimatePresence>

        {/* Service List */}
        <div className="space-y-3">
            {services.map((service) => (
                <div key={service._id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-black/10 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                            <Briefcase size={20} className="text-gray-400" />
                        </div>
                        <div>
                            <p className="font-bold text-base">{service.subcategory}</p>
                            <p className="text-xs text-gray-400 font-medium">{service.category}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">₹{service.basePrice}<span className="text-xs text-gray-400 font-medium">/{service.priceUnit}</span></span>
                        <button onClick={() => onStartEdit(service)} className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <Pencil size={14} />
                        </button>
                        <button onClick={() => onDelete(service._id)} className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            ))}
            {services.length === 0 && (
                <div className="h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-3">
                    <Briefcase size={32} />
                    <p className="font-bold text-sm">No services yet. Add your first service!</p>
                </div>
            )}
        </div>
    </motion.div>
);

// ── Bookings ──
const BookingsTab = ({ bookings, pendingBookings, activeBookings, completedBookings, loading, fetchData, onAccept, onReject, onStart, onComplete, onSimulate, simulatingId, otpInput, setOtpInput, onOpenChat }) => {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? bookings :
                     filter === 'pending' ? pendingBookings :
                     filter === 'active' ? activeBookings : completedBookings;

    return (
        <motion.div {...fadeIn} className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
                    <p className="text-gray-400 text-sm mt-1">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
                </div>
                <button 
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:border-black transition-all shadow-sm active:scale-95"
                >
                    <Activity size={12} className={loading ? 'animate-spin' : ''} />
                    Sync Now
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { id: 'all', label: `All (${bookings.length})` },
                    { id: 'pending', label: `Pending (${pendingBookings.length})` },
                    { id: 'active', label: `Active (${activeBookings.length})` },
                    { id: 'completed', label: `Done (${completedBookings.length})` },
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`h-9 px-4 rounded-full text-xs font-bold transition-all ${
                            filter === f.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Booking Cards */}
            <div className="space-y-4">
                {filtered.map((booking) => (
                    <div key={booking._id} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 hover:border-black/10 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <p className="font-bold text-base">{booking.serviceType}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {booking.customerId?.name || 'Customer'} • #{booking._id.slice(-6).toUpperCase()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold">₹{booking.price || 0}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                                    booking.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                                    booking.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                                    booking.status === 'ongoing' ? 'bg-purple-50 text-purple-600' :
                                    booking.status === 'completed' ? 'bg-green-50 text-green-600' :
                                    'bg-red-50 text-red-600'
                                }`}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>

                        {booking.address && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <MapPin size={14} /> {booking.address}
                            </div>
                        )}

                        {/* Actions */}
                        {booking.status === 'pending' && (
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => onAccept(booking._id)} className="h-10 px-5 bg-black text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-gray-800 transition-colors">
                                    <Check size={14} /> Accept
                                </button>
                                <button onClick={() => onReject(booking._id)} className="h-10 px-5 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-red-50 hover:text-red-500 transition-colors">
                                    <X size={14} /> Reject
                                </button>
                            </div>
                        )}

                        {booking.status === 'confirmed' && (
                            <div className="flex flex-col gap-4 pt-2">
                                <div className="flex gap-3">
                                    <button 
                                        disabled={simulatingId === booking._id}
                                        onClick={() => onSimulate(booking)}
                                        className={`h-10 px-5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                                            simulatingId === booking._id 
                                            ? 'bg-blue-50 text-blue-600 border border-blue-100 italic'
                                            : 'bg-white border border-gray-200 text-black hover:border-black'
                                        }`}
                                    >
                                        <Navigation size={14} className={simulatingId === booking._id ? 'animate-pulse' : ''} /> 
                                        {simulatingId === booking._id ? 'Traveling...' : 'Start Traveling'}
                                    </button>
                                     <button 
                                        onClick={() => onOpenChat(booking._id, booking.customerId?.name || 'Customer')}
                                        className="h-10 w-10 bg-gray-50 border border-gray-200 text-black rounded-xl flex items-center justify-center hover:border-black transition-all"
                                        title="Chat with Customer"
                                    >
                                        <MessageSquare size={16} />
                                    </button>
                                </div>
                                
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="Enter OTP"
                                        value={otpInput}
                                        onChange={e => setOtpInput(e.target.value)}
                                        className="h-10 w-28 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold tracking-widest outline-none focus:border-black transition-colors"
                                    />
                                    <button onClick={() => onStart(booking._id)} className="h-10 px-5 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors">
                                        Verify & Start
                                    </button>
                                </div>
                            </div>
                        )}

                        {booking.status === 'ongoing' && (
                            <button onClick={() => onComplete(booking._id)} className="h-10 px-5 bg-black text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-gray-800 transition-colors mt-2">
                                <Check size={14} /> Mark Complete
                            </button>
                        )}
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-3">
                        <CalendarCheck size={32} />
                        <p className="font-bold text-sm">No bookings found</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ── Profile ──
const ProfileTab = ({ profile, editing, setEditing, form, setForm, onSave }) => (
    <motion.div {...fadeIn} className="space-y-8 max-w-2xl">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-gray-400 text-sm mt-1">Manage your provider information</p>
            </div>
            {!editing && (
                <button onClick={() => setEditing(true)} className="h-11 px-5 bg-black text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors">
                    <Pencil size={14} /> Edit
                </button>
            )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 space-y-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center text-2xl font-bold">
                    {profile?.userId?.name?.charAt(0) || 'P'}
                </div>
                <div>
                    <p className="text-xl font-bold">{profile?.userId?.name}</p>
                    <p className="text-sm text-gray-400">{profile?.userId?.email}</p>
                </div>
            </div>

            <div className="h-px bg-gray-100" />

            {editing ? (
                <form onSubmit={onSave} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-black transition-colors font-medium" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-black transition-colors font-medium" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</label>
                        <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-black transition-colors font-medium resize-none" placeholder="Tell customers about yourself..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Time</label>
                            <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-black transition-colors font-medium" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">End Time</label>
                            <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-black transition-colors font-medium" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="h-11 px-6 bg-black text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors">
                            <Save size={14} /> Save Changes
                        </button>
                        <button type="button" onClick={() => setEditing(false)} className="h-11 px-6 bg-gray-100 text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Phone</p>
                            <p className="font-bold">{profile?.userId?.phone || '—'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Rating</p>
                            <p className="font-bold flex items-center gap-1"><Star size={14} fill="currentColor" /> {profile?.rating?.toFixed(1) || '0.0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Working Hours</p>
                            <p className="font-bold">{profile?.workingHours?.start} — {profile?.workingHours?.end}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Jobs</p>
                            <p className="font-bold">{profile?.totalJobs || 0}</p>
                        </div>
                    </div>
                    {profile?.bio && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Bio</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </motion.div>
);

export default ProviderDashboard;
