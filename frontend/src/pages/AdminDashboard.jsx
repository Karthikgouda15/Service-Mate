import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, IndianRupee, Activity, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import api from '../api/api';
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [pendingProviders, setPendingProviders] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        totalUsers: 0,
        totalProviders: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const socket = useSocket();

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/dashboard');
            console.log('Admin Dashboard Data Fetched:', data);
            
            setPendingProviders(data.pendingProviders || []);
            setRecentBookings(data.recentBookings || []);
            setStats({
                totalRevenue: data.totalRevenue || 0,
                totalBookings: data.totalBookings || 0,
                totalUsers: data.totalUsers || 0,
                totalProviders: data.totalProviders || 0
            });
            setError(null);
        } catch (error) {
            console.error('Failed to fetch admin dashboard:', error);
            setError('Failed to connect to administrative services. Please check your permissions.');
            toast.error('System synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.emit('join_admin_room');
            socket.on('admin:dashboard:update', (data) => {
                console.log('Admin Live Update Received:', data);
                setPendingProviders(data.pendingProviders || []);
                setRecentBookings(data.recentBookings || []);
                setStats({
                    totalRevenue: data.totalRevenue || 0,
                    totalBookings: data.totalBookings || 0,
                    totalUsers: data.totalUsers || 0,
                    totalProviders: data.totalProviders || 0
                });
                toast('Dashboard synced with live operations', { icon: '📊' });
            });
        }
        return () => {
            if (socket) {
                socket.off('admin:dashboard:update');
            }
        };
    }, [socket]);

    const handleAction = async (id, action) => {
        try {
            await api.put(`/admin/providers/${id}/${action}`);
            toast.success(`Professional ${action}ed successfully`);
            fetchDashboard();
        } catch (error) {
            toast.error(`Decision could not be finalized: ${error.message}`);
        }
    };

    const dashboardStats = [
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <IndianRupee size={22} />, trend: 'Stable' },
        { label: 'Total Bookings', value: stats.totalBookings, icon: <Briefcase size={22} />, trend: '+5%' },
        { label: 'Total Users', value: stats.totalUsers, icon: <Users size={22} />, trend: '+12%' },
        { label: 'Total Providers', value: stats.totalProviders, icon: <Activity size={22} />, trend: 'Live' },
    ];

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-apple-gray font-medium animate-pulse">Synchronizing platform data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center">
                    <AlertCircle size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-black tracking-tight">Access Restricted</h2>
                    <p className="max-w-md text-apple-gray font-medium">{error}</p>
                </div>
                <button 
                    onClick={fetchDashboard}
                    className="apple-button px-8 py-3 rounded-2xl"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-16 pt-8 max-w-6xl mx-auto px-4">
            <header className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] shadow-apple-xl border border-[#F5F5F7] gap-6">
                <div className="text-center md:text-left space-y-2">
                    <h2 className="text-4xl font-headings font-bold tracking-tight text-black">Admin Console</h2>
                    <p className="text-apple-gray font-medium text-lg italic">Platform oversight & professional management</p>
                </div>
                <div className="bg-black px-6 py-3 rounded-2xl text-[11px] font-black text-white flex items-center gap-3 shadow-apple uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> System Operational
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {dashboardStats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-[#F5F5F7] shadow-apple hover:shadow-apple-lg transition-all duration-500 space-y-6 group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-black rounded-2xl text-white flex items-center justify-center shadow-apple group-hover:scale-110 transition-transform">
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-black text-black bg-[#F5F5F7] px-3 py-1 rounded-full uppercase tracking-widest border border-black/5">
                                {stat.trend}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-apple-gray font-bold text-[10px] uppercase tracking-[0.25em]">{stat.label}</p>
                            <p className="text-3xl font-headings font-bold text-black tracking-tighter">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Approval Queue */}
            <section className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-[#F5F5F7] shadow-apple-xl space-y-10">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-headings font-bold text-black tracking-tight flex items-center gap-3">
                        Pending Verification 
                        <span className="bg-[#F5F5F7] text-black px-3 py-0.5 rounded-full text-sm font-bold border border-black/5">{pendingProviders.length}</span>
                    </h3>
                </div>
                
                {pendingProviders.length === 0 ? (
                    <div className="py-20 text-center text-apple-gray font-medium text-lg italic bg-[#F5F5F7]/30 rounded-[2.5rem] border-2 border-dashed border-[#D2D2D7]">
                        All professional applications have been processed.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {pendingProviders.map(provider => (
                            <div key={provider._id} className="flex flex-col md:flex-row justify-between items-center p-6 border border-[#F5F5F7] rounded-[2rem] bg-[#F5F5F7]/30 hover:bg-white hover:shadow-apple transition-all duration-300 gap-6">
                                <div className="flex items-center gap-5 w-full md:w-auto text-center md:text-left">
                                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-apple">
                                        {provider.userId?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-xl text-black tracking-tight">{provider.userId?.name || 'Unknown Provider'}</p>
                                        <p className="text-xs text-apple-gray font-bold uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start mt-1">
                                            {provider.services[0]?.category || 'General Service'} <span className="w-1 h-1 bg-apple-gray rounded-full opacity-50" /> Applied {new Date(provider.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button 
                                        onClick={() => handleAction(provider._id, 'approve')}
                                        className="flex-1 md:flex-none h-12 px-6 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-apple-lg transition-all active:scale-95 text-sm"
                                    >
                                        <CheckCircle2 size={18} /> Approve
                                    </button>
                                    <button 
                                        onClick={() => handleAction(provider._id, 'reject')}
                                        className="flex-1 md:flex-none h-12 px-6 border-2 border-black text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#F5F5F7] transition-all active:scale-95 text-sm"
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Platform Monitor */}
            <section className="bg-black text-white p-10 md:p-12 rounded-[3.5rem] shadow-apple-2xl space-y-10 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Activity size={120} />
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-headings font-bold tracking-tight">Global Platform Monitor</h3>
                        <p className="text-gray-400 text-sm font-medium">Real-time booking synchronization active</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Overseer Mode</span>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar relative z-10">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                                <th className="pb-4 pl-6">Client</th>
                                <th className="pb-4">Professional</th>
                                <th className="pb-4">Specific Service</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 pr-6 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.map((booking) => (
                                <motion.tr 
                                    layout
                                    key={booking._id} 
                                    className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl group"
                                >
                                    <td className="py-5 pl-6 rounded-l-2xl border-y border-l border-white/5">
                                        <p className="font-bold text-sm tracking-tight">{booking.customerId?.name || 'Anonymous'}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{booking.customerId?.email}</p>
                                    </td>
                                    <td className="py-5 border-y border-white/5">
                                        <p className="font-bold text-sm tracking-tight">{booking.providerId?.name || 'Standard Pro'}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{booking.providerId?.email}</p>
                                    </td>
                                    <td className="py-5 border-y border-white/5">
                                        <span className="text-[11px] font-black bg-white/10 px-3 py-1 rounded-lg uppercase tracking-wider">
                                            {booking.serviceType}
                                        </span>
                                    </td>
                                    <td className="py-5 border-y border-white/5 font-black uppercase text-[10px] tracking-widest">
                                        <span className={`flex items-center gap-2 ${
                                            booking.status === 'completed' ? 'text-emerald-400' :
                                            booking.status === 'pending' ? 'text-amber-400' :
                                            'text-blue-400'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                booking.status === 'completed' ? 'bg-emerald-400' :
                                                booking.status === 'pending' ? 'bg-amber-400' :
                                                'bg-blue-400'
                                            }`} />
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="py-5 pr-6 text-right rounded-r-2xl border-y border-r border-white/5 font-bold text-lg">
                                        ₹{booking.price?.toLocaleString() || '0'}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {recentBookings.length === 0 && (
                        <div className="py-20 text-center text-gray-500 font-medium italic">
                            No platform activity detected yet.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
