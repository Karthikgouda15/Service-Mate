import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import useSocket from '../hooks/useSocket';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/customer/me');
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);


    // Listen for real-time updates to keep the customer's list in sync
    const socket = useSocket();
    useEffect(() => {
        if (socket) {
            socket.on('booking_status_updated', () => {
                fetchBookings();
            });
            return () => {
                socket.off('booking_status_updated');
            }
        }
    }, [socket]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'confirmed': return 'bg-blue-100 text-blue-700';
            case 'ongoing': return 'bg-purple-100 text-purple-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getAvatarUrl = (name, avatar) => {
        if (avatar && avatar.startsWith('http')) return avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Expert')}&background=000000&color=ffffff&size=150&font-size=0.4`;
    };

    if (loading) {
        return <div className="h-96 flex items-center justify-center font-bold">Loading your bookings...</div>;
    }
    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-16 px-4 pt-8">
            <header className="space-y-3 px-2">
                <h2 className="text-4xl font-headings font-bold tracking-tight text-black">My Bookings</h2>
                <p className="text-apple-gray font-medium text-lg italic">Track and manage your scheduled services</p>
            </header>

            {bookings.length === 0 ? (
                <div className="bg-white p-16 rounded-[3.5rem] border border-[#F5F5F7] shadow-apple-xl flex flex-col items-center justify-center space-y-6 text-center">
                    <div className="w-24 h-24 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#D2D2D7] mb-4 border border-[#D2D2D7]/30 shadow-inner">
                        <Calendar size={48} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-black tracking-tight">No bookings yet</h3>
                        <p className="text-apple-gray max-w-sm font-medium">Your schedule is currently empty. Book a top-rated professional to get started!</p>
                    </div>
                    <Link to="/search" className="apple-button h-14 px-10 mt-4">
                        Find a Professional
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    <AnimatePresence>
                        {bookings.map((booking) => (
                            <motion.div
                                key={booking._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[3rem] border border-[#F5F5F7] shadow-apple hover:shadow-apple-xl transition-all duration-500 overflow-hidden flex flex-col md:flex-row group"
                            >
                                <div className="p-10 md:w-1/3 bg-[#F5F5F7]/50 flex flex-col justify-center border-r border-[#F5F5F7] items-center text-center">
                                    <h4 className="font-headings font-bold text-2xl text-black mb-4 tracking-tight">{booking.serviceType}</h4>
                                    <span className="text-[10px] font-black px-4 py-1.5 bg-black text-white rounded-full uppercase tracking-[0.2em] shadow-apple">
                                        {booking.status}
                                    </span>
                                </div>
                                
                                <div className="p-10 flex-1 flex flex-col justify-between space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-[#F5F5F7] rounded-2xl overflow-hidden border border-[#D2D2D7]/20 shadow-inner">
                                                <img src={getAvatarUrl(booking.providerId?.name, booking.providerId?.avatar)} alt="Provider" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-black tracking-tight">{booking.providerId?.name || 'Assigning Expert...'}</p>
                                                <p className="text-xs text-apple-gray font-bold uppercase tracking-widest">Service Provider</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6 border-t border-[#F5F5F7] text-sm font-bold text-black/60">
                                            <div className="flex items-center gap-3"><Calendar size={18} className="text-black" /> {new Date(booking.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                            <div className="flex items-center gap-3"><Clock size={18} className="text-black" /> {new Date(booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            <div className="flex items-center gap-3 col-span-full"><MapPin size={18} className="text-black" /> <span className="truncate">{booking.address}</span></div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-[#F5F5F7]">
                                        <div className="text-center md:text-left">
                                            <p className="text-[10px] text-apple-gray font-bold uppercase tracking-widest mb-1">Total Paid</p>
                                            <p className="text-3xl font-headings font-bold text-black tracking-tighter">₹{booking.price}</p>
                                        </div>
                                        
                                        {['pending', 'confirmed', 'ongoing'].includes(booking.status) ? (
                                            <button 
                                                onClick={() => navigate(`/track/${booking._id}`)}
                                                className="apple-button h-14 px-10 w-full md:w-auto"
                                            >
                                                Track Arrival <ArrowRight size={20} />
                                            </button>
                                        ) : booking.status === 'completed' ? (
                                            <div className="flex items-center gap-3 text-black font-bold text-base bg-[#F5F5F7] px-6 py-3 rounded-2xl border border-black/5 shadow-inner">
                                                <CheckCircle2 size={22} className="text-black" /> Successfully Completed
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
