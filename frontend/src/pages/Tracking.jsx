import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageSquare, Clock, ShieldCheck, CheckCircle2, ChevronRight, Play, User as UserIcon, Navigation } from 'lucide-react';
import api from '../api/api';
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';
import ChatPanel from '../components/ChatPanel';
import { Star } from 'lucide-react';

const providerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3082/3082383.png', // Car icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1673/1673188.png', // Human Pin
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

// Helper component to auto-fit markers on map
const MarkerFitter = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
};

const Tracking = () => {
    const { id: bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [providerPos, setProviderPos] = useState([12.9716, 77.5946]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [review, setReview] = useState({ rating: 0, comment: '', submitted: false });
    const simulationRef = useRef(null);
    const socket = useSocket();

    const fetchBooking = async () => {
        try {
            const { data } = await api.get(`/bookings/${bookingId}`);
            setBooking(data);
            if (data.status === 'confirmed' || data.status === 'ongoing') {
                setProviderPos([12.9816, 77.6046]); // Offset start
            }
        } catch (error) {
            toast.error('Failed to load booking');
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    useEffect(() => {
        if (socket && booking) {
            socket.emit('join_booking', bookingId);

            socket.on('provider_location', (data) => {
                setProviderPos([data.lat, data.lng]);
            });

            socket.on('booking_status_updated', (data) => {
                setBooking(prev => ({ ...prev, status: data.status, otp: data.otp || prev.otp }));
                toast.success(`Job status: ${data.status.toUpperCase()}`);
            });
        }
        return () => {
            if (socket) {
                socket.off('provider_location');
                socket.off('booking_status_updated');
            }
        };
    }, [socket, bookingId, booking]);

    // Provider Action Simulation (Demo Only)
    const simulateProviderAction = async (newStatus, otp) => {
        try {
            const payload = { status: newStatus };
            if (otp) payload.otp = otp;
            await api.put(`/bookings/${bookingId}/status`, payload);
            fetchBooking();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Simulation failed');
        }
    };

    const startTravelSimulation = () => {
        if (isSimulating) return;
        setIsSimulating(true);
        let step = 0;
        const totalSteps = 40;
        const startPos = [12.9816, 77.6046];
        const endPos = [booking.location.coordinates[1], booking.location.coordinates[0]];
        
        simulationRef.current = setInterval(() => {
            step++;
            const lat = startPos[0] + (endPos[0] - startPos[0]) * (step / totalSteps);
            const lng = startPos[1] + (endPos[1] - startPos[1]) * (step / totalSteps);
            
            const newPos = [lat, lng];
            setProviderPos(newPos);
            socket.emit('location_update', { bookingId, lat, lng });

            if (step >= totalSteps) {
                clearInterval(simulationRef.current);
                setIsSimulating(false);
                toast.success('Provider has arrived!');
            }
        }, 500);
    };

    const handleReviewSubmit = async () => {
        if (review.rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        try {
            await api.post(`/bookings/${bookingId}/review`, {
                rating: review.rating,
                comment: review.comment
            });
            setReview(prev => ({ ...prev, submitted: true }));
            toast.success('Thank you for your feedback!');
        } catch (error) {
            toast.error('Failed to submit review');
        }
    };

    if (!booking) return <div className="h-96 flex items-center justify-center font-bold">Connecting...</div>;

    const statuses = ['pending', 'confirmed', 'ongoing', 'completed'];
    const currentStatusIndex = statuses.indexOf(booking.status);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-10 p-6">
            <div className="flex-1 flex flex-col gap-10">
                {/* Tracking Header */}
                <div className="bg-[#F5F5F7] border border-[#D2D2D7] p-6 rounded-[2.5rem] text-black flex flex-wrap items-center justify-between gap-6 shadow-apple">
                    <div className="flex items-center gap-4">
                        <div className="bg-black text-white p-3 rounded-2xl shadow-apple"><Navigation size={24} /></div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-apple-gray leading-none mb-1.5">Live Tracking</p>
                            <p className="text-lg font-bold tracking-tight">Your expert is on the way</p>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="flex-1 rounded-[3rem] overflow-hidden border border-[#F5F5F7] shadow-apple-lg relative min-h-[400px]">
                    <MapContainer center={[12.9716, 77.5946]} zoom={14} style={{ height: '100%', width: '100%', zIndex: 1 }} zoomControl={false}>
                        <TileLayer url="https://{s}.tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=7c352c8ff4764dca82d74d201c107a6d" attribution='&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>' />
                        {providerPos && <Marker position={providerPos} icon={providerIcon} />}
                        {booking.location && <Marker position={[booking.location.coordinates[1], booking.location.coordinates[0]]} icon={userIcon} />}
                        <MarkerFitter points={[providerPos, [booking.location.coordinates[1], booking.location.coordinates[0]]]} />
                        {providerPos && booking.location && (
                           <Polyline positions={[providerPos, [booking.location.coordinates[1], booking.location.coordinates[0]]]} color="#000000" weight={2} dashArray="8, 12" opacity={0.4} />
                        )}
                    </MapContainer>

                    {/* Floating Info Card */}
                    <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-[2.25rem] shadow-apple-xl flex items-center gap-5">
                        <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-[#D2D2D7]/30">
                            {booking.providerId.avatar ? <img src={booking.providerId.avatar} className="w-full h-full object-cover" /> : <UserIcon className="text-apple-gray" size={32} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-headings font-bold text-xl tracking-tight text-black">{booking.providerId.name}</h4>
                            <p className="text-xs text-apple-gray font-semibold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                <Clock size={14} className="text-black" /> 
                                {booking.status === 'pending' ? 'Waiting for confirmation' : booking.status === 'completed' ? 'Service Finished' : 'Arriving in 8-12 mins'}
                            </p>
                        </div>
                         <div className="flex gap-3">
                            <a href={`tel:${booking.providerId.phone}`} className="w-13 h-13 bg-white border border-[#D2D2D7] text-black rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#F5F5F7] transition-all"><Phone size={22} /></a>
                            <button 
                                onClick={() => setIsChatOpen(true)}
                                className="w-13 h-13 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-zinc-800 transition-all"
                            >
                                <MessageSquare size={22} />
                            </button>
                         </div>
                    </div>
                </div>
            </div>

            {/* Status Timeline & OTP Section */}
            <div className="w-full lg:w-[420px] flex flex-col gap-10">
                <div className="bg-white p-10 rounded-[3rem] border border-[#F5F5F7] shadow-apple-xl flex-1">
                    <div className="flex items-center justify-between mb-10">
                       <h3 className="text-2xl font-headings font-bold tracking-tight text-black">Service Progress</h3>
                       <div className="px-4 py-1.5 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-apple">{booking.status}</div>
                    </div>

                    <div className="space-y-10 relative">
                        <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-black/[0.05]" />
                        {statuses.map((s, i) => (
                            <div key={s} className="flex gap-6 items-start relative z-10">
                                <motion.div 
                                    animate={{ scale: i <= currentStatusIndex ? [1, 1.15, 1] : 1 }}
                                    className={`w-8 h-8 rounded-full border-4 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${i < currentStatusIndex ? 'bg-black border-black/10' : i === currentStatusIndex ? 'bg-white border-black scale-110 shadow-apple' : 'bg-[#F5F5F7] border-transparent'}`}
                                >
                                    {i < currentStatusIndex && <CheckCircle2 size={16} className="text-white" />}
                                    {i === currentStatusIndex && <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />}
                                </motion.div>
                                <div className="space-y-1">
                                    <p className={`text-lg font-bold tracking-tight capitalize ${i <= currentStatusIndex ? 'text-black' : 'text-apple-gray'}`}>
                                        {s === 'ongoing' ? 'Ongoing Service' : s === 'confirmed' ? 'Professional Ready' : s === 'pending' ? 'Order Placed' : 'Job Completed'}
                                    </p>
                                    <p className="text-xs text-apple-gray font-semibold uppercase tracking-widest">{i === currentStatusIndex ? 'Now' : i < currentStatusIndex ? 'Completed' : 'Next'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {booking.status === 'confirmed' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-black p-10 rounded-[3rem] text-white space-y-6 shadow-apple-xl border border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="text-white/40" size={28} />
                                <h4 className="font-bold text-xl tracking-tight">Security Code</h4>
                            </div>
                            <p className="text-white/50 text-sm font-medium tracking-tight">Show this to {booking.providerId.name.split(' ')[0]} when they arrive.</p>
                            <div className="grid grid-cols-4 gap-4">
                                {booking.otp?.split('').map((digit, i) => (
                                    <div key={i} className="aspect-square bg-white/[0.08] rounded-[2rem] flex items-center justify-center text-5xl font-headings font-bold border border-white/10 shadow-lg group hover:bg-white/[0.12] transition-colors">
                                        {digit}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Review Prompt */}
                <AnimatePresence>
                    {booking.status === 'completed' && !review.submitted && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-10 rounded-[3rem] border border-[#F5F5F7] shadow-apple-xl space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <h4 className="text-2xl font-headings font-bold pb-2 tracking-tight">Rate your Experience</h4>
                                <p className="text-apple-gray text-sm font-medium">How was your service with {booking.providerId.name}?</p>
                            </div>
                            
                            <div className="flex justify-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star} 
                                        onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                                        className="transition-transform active:scale-90"
                                    >
                                        <Star 
                                            size={32} 
                                            className={star <= review.rating ? 'fill-black text-black' : 'text-[#D2D2D7]'} 
                                            strokeWidth={star <= review.rating ? 0 : 2}
                                        />
                                    </button>
                                ))}
                            </div>

                            <textarea 
                                placeholder="Write a compliment or suggestion..."
                                value={review.comment}
                                onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                                className="w-full h-24 bg-[#F5F5F7] rounded-2xl p-4 text-sm font-medium outline-none border-2 border-transparent focus:border-black transition-all resize-none"
                            />

                            <button 
                                onClick={handleReviewSubmit}
                                className="w-full h-14 bg-black text-white rounded-[1.25rem] font-bold shadow-apple hover:bg-zinc-800 transition-all"
                            >
                                Submit Review
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Chat */}
            <ChatPanel 
                bookingId={bookingId} 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                recipientName={booking.providerId.name}
            />
        </div>
    );
};

export default Tracking;
