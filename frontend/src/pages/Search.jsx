import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, SlidersHorizontal, MapPin, Star, Zap, Calendar, Clock, X, ChevronRight, CheckCircle2, Minus, Plus, IndianRupee, ShieldCheck, Droplets, Sparkles, Wind, Hammer, Paintbrush, Bug, Leaf } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import useLocationStore from '../store/useLocationStore';
import useAuthStore from '../store/useAuthStore';
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';

const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

const categoryMeta = {
    Plumbing: { icon: <Droplets size={24} /> },
    Electrical: { icon: <Zap size={24} /> },
    Cleaning: { icon: <Sparkles size={24} /> },
    'AC Repair': { icon: <Wind size={24} /> },
    Carpentry: { icon: <Hammer size={24} /> },
    Painting: { icon: <Paintbrush size={24} /> },
    'Pest Control': { icon: <Bug size={24} /> },
    Gardening: { icon: <Leaf size={24} /> },
};

const ChangeView = ({ center }) => {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
};

// ── Inline Booking Panel ────────────────────────────────────────────────────────
const BookingPanel = ({ provider, onClose, coords }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [selectedService, setSelectedService] = useState(() => {
        const query = new URLSearchParams(window.location.search).get('category')?.toLowerCase();
        if (query) {
            const found = provider.services.find(s => 
                s.subcategory.toLowerCase().includes(query) || 
                s.category.toLowerCase().includes(query)
            );
            if (found) return found;
        }
        return provider.services[0] || null;
    });
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const basePrice = selectedService?.dynamicPrice || selectedService?.basePrice || 200;
    const priceUnit = selectedService?.priceUnit || 'hr';

    const [bookingData, setBookingData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '',
        hours: 1,
        address: '',
        description: '',
    });

    const generateTimeSlots = () => {
        const slots = [];
        const now = new Date();
        const selectedDate = new Date(bookingData.date);
        const isToday = selectedDate.toDateString() === now.toDateString();

        for (let h = 8; h <= 20; h++) {
            for (let m = 0; m < 60; m += 30) {
                if (isToday && (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes()))) continue;
                const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                slots.push(timeStr);
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();
    const totalCost = basePrice * bookingData.hours;

    const minDate = new Date().toISOString().split('T')[0];
    const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const handleConfirmBooking = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to book a service');
            navigate('/login');
            return;
        }

        if (!selectedService) {
            toast.error('Please select a service');
            return;
        }

        if (!bookingData.date || !bookingData.time || !bookingData.address) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const scheduledAt = new Date(`${bookingData.date}T${bookingData.time}:00`).toISOString();

            const { data } = await api.post('/bookings', {
                providerId: provider.userId._id,
                serviceType: selectedService.subcategory,
                description: bookingData.description || `${selectedService.subcategory} service`,
                scheduledAt,
                address: bookingData.address,
                location: {
                    type: 'Point',
                    coordinates: [coords?.lng || 77.5946, coords?.lat || 12.9716]
                },
                price: totalCost,
            });

            setStep(3);
            toast.success('Booking confirmed!');
            setTimeout(() => {
                navigate(`/track/${data._id}`);
            }, 2500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="p-8 border-b border-[#F5F5F7] flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#F5F5F7] rounded-2xl overflow-hidden border border-[#D2D2D7]/30 flex items-center justify-center">
                                {provider.userId.avatar ? (
                                    <img src={provider.userId.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    categoryMeta[selectedService?.category]?.icon || <Zap size={24} />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-black tracking-tight">{provider.userId.name}</h3>
                                <p className="text-[11px] text-[#86868B] font-bold uppercase tracking-widest">{selectedService?.subcategory || 'Verified Expert'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5E7] flex items-center justify-center transition-colors">
                            <X size={18} className="text-black" />
                        </button>
                    </div>
                    
                    {/* NEW: Multi-Service Selection Chips */}
                    {provider.services?.length > 1 && (
                        <div className="mt-8 space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-[#86868B]">Select Task</label>
                            <div className="flex flex-wrap gap-2">
                                {provider.services.map(s => (
                                    <button
                                        key={s._id}
                                        onClick={() => setSelectedService(s)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${selectedService?._id === s._id ? 'bg-black text-white border-black' : 'bg-white text-black border-[#F5F5F7] hover:border-[#D2D2D7]'}`}
                                    >
                                        {s.subcategory} · ₹{s.dynamicPrice || s.basePrice}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-y-auto flex-1 p-8 space-y-6 custom-scrollbar">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#86868B]">Select Date</label>
                                <input type="date" min={minDate} max={maxDate} value={bookingData.date} onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })} className="w-full h-14 bg-[#F5F5F7] rounded-2xl px-5 font-bold outline-none border-2 border-transparent focus:border-black transition-all" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#86868B]">Select Time</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {timeSlots.map(slot => (
                                        <button key={slot} onClick={() => setBookingData({ ...bookingData, time: slot })} className={`py-3 rounded-xl text-xs font-bold transition-all ${bookingData.time === slot ? 'bg-black text-white' : 'bg-[#F5F5F7] text-black hover:bg-[#E5E5E7]'}`}>{slot}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#86868B]">Duration (Hours)</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setBookingData({ ...bookingData, hours: Math.max(1, bookingData.hours - 1) })} className="w-12 h-12 bg-[#F5F5F7] rounded-xl flex items-center justify-center font-bold"> - </button>
                                    <div className="flex-1 h-14 bg-[#F5F5F7] rounded-2xl flex items-center justify-center font-black text-xl">{bookingData.hours}</div>
                                    <button onClick={() => setBookingData({ ...bookingData, hours: Math.min(8, bookingData.hours + 1) })} className="w-12 h-12 bg-[#F5F5F7] rounded-xl flex items-center justify-center font-bold"> + </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#86868B]">Service Address</label>
                                <textarea placeholder="Enter your full address..." value={bookingData.address} onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })} className="w-full h-24 bg-[#F5F5F7] rounded-2xl p-5 outline-none border-2 border-transparent focus:border-black transition-all resize-none" />
                            </div>
                            <div className="bg-[#F5F5F7] p-5 rounded-2xl space-y-2">
                                <p className="text-[11px] font-black uppercase tracking-widest text-[#86868B]">Total Amount</p>
                                <p className="text-3xl font-black text-black">₹{totalCost}</p>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center space-y-4">
                            <CheckCircle2 size={64} className="mx-auto text-green-500" />
                            <h3 className="text-2xl font-black">Booking Success!</h3>
                            <p className="text-[#86868B]">Redirecting you to tracking...</p>
                        </motion.div>
                    )}
                </div>

                {step < 3 && (
                    <div className="p-8 border-t border-[#F5F5F7] flex gap-3">
                        {step > 1 && <button onClick={() => setStep(1)} className="h-14 px-8 bg-[#F5F5F7] rounded-2xl font-bold">Back</button>}
                        <button 
                            onClick={() => step === 1 ? setStep(2) : handleConfirmBooking()} 
                            disabled={loading || (step === 1 && !bookingData.time) || (step === 2 && !bookingData.address)}
                            className="flex-1 h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : step === 1 ? 'Continue' : 'Confirm Booking'}
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

// ── Main Search Component ───────────────────────────────────────────────────────
const Search = () => {
    const { coords, getUserLocation } = useLocationStore();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('category') || '');
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [bookingProvider, setBookingProvider] = useState(null);
    const [simulatedLiveProviders, setSimulatedLiveProviders] = useState([]);
    const [isLiveSimMode, setIsLiveSimMode] = useState(true);
    const socket = useSocket();

    useEffect(() => {
        if (!coords) getUserLocation();
    }, []);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSearchQuery(cat);
    }, [searchParams]);

    useEffect(() => {
        if (coords) fetchNearbyProviders();
    }, [coords, searchParams.get('category')]);

    useEffect(() => {
        if (socket && isLiveSimMode) {
            socket.emit('join_discovery');
            socket.on('discovery_location_update', (data) => {
                setSimulatedLiveProviders(data);
            });
        }
        return () => {
            if (socket) {
                socket.off('discovery_location_update');
                socket.emit('leave_discovery');
            }
        };
    }, [socket, isLiveSimMode]);

    const fetchNearbyProviders = async () => {
        setLoading(true);
        try {
            const category = searchParams.get('category') || searchQuery;
            let url = `/providers/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=10`;
            if (category) url += `&service=${encodeURIComponent(category)}`;
            const { data } = await api.get(url);
            setProviders(data);
        } catch (error) {
            console.error('Failed to fetch providers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = (e, provider) => {
        if (e) e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to book a service');
            navigate('/login');
            return;
        }
        
        // Normalize simulated providers if needed
        let normalizedProvider = provider;
        if (provider.isSimulated) {
            normalizedProvider = {
                _id: provider.id,
                userId: {
                    _id: provider.userId._id || provider.id,
                    name: provider.userId.name,
                    avatar: provider.userId.avatar
                },
                services: [{
                    category: provider.category,
                    subcategory: 'Expert Service',
                    basePrice: 499, // default for sims
                    priceUnit: 'hr'
                }],
                rating: 4.5 + Math.random() * 0.5,
                currentLocation: {
                    type: 'Point',
                    coordinates: [provider.lng, provider.lat]
                }
            };
        }
        
        setBookingProvider(normalizedProvider);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header - Sticky */}
            <div className="sticky top-20 z-[40] px-10 py-8 glass border-b border-[#F5F5F7] flex flex-col md:flex-row items-center gap-6 shadow-sm">
                <div className="relative flex-1 group w-full max-w-4xl">
                    <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[#86868B]" size={22} />
                    <input
                        type="text"
                        placeholder="Search for any service..."
                        className="w-full h-16 bg-[#F5F5F7]/80 rounded-[2rem] pl-16 pr-6 text-lg font-medium focus:bg-white border-2 border-transparent focus:border-black outline-none transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?category=${encodeURIComponent(searchQuery)}`)}
                    />
                </div>
                <button className="h-16 px-10 bg-black text-white hover:bg-zinc-900 rounded-[2rem] font-bold transition-all flex items-center justify-center gap-3 shadow-apple active:scale-95">
                    <SlidersHorizontal size={20} />
                    <span className="text-sm uppercase tracking-widest font-black">Filters</span>
                </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row relative">
                {/* List View - Added pt-8 to clear sticky headers better */}
                <div className="w-full md:w-[500px] p-10 md:p-14 md:pt-16 space-y-12 min-h-screen bg-white border-r border-[#F5F5F7]">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] flex items-center gap-2">
                                <MapPin size={12} /> Results for you
                            </p>
                            <h3 className="text-4xl font-black tracking-tighter text-black leading-tight">
                                {searchParams.get('category') || 'Nearby Experts'}
                            </h3>
                        </div>
                        <div className="flex items-center gap-3 bg-[#F5F5F7] w-fit px-4 py-2 rounded-full border border-black/5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#1D1D1F]">{providers.length} Verified Professionals Online</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-8 mt-10">
                            {[1, 2, 3].map(i => <div key={i} className="h-44 bg-[#F5F5F7] animate-pulse rounded-[2.5rem]" />)}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {providers.map((p) => (
                                <motion.div
                                    key={p._id}
                                    layoutId={p._id}
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    onClick={() => setSelectedProvider(p)}
                                    className={`group relative p-8 rounded-[3rem] border-2 transition-all duration-500 cursor-pointer ${selectedProvider?._id === p._id ? 'border-black bg-white shadow-2xl' : 'border-transparent bg-[#F5F5F7]/50 hover:bg-white hover:border-[#D2D2D7] hover:shadow-apple-xl'}`}
                                >
                                    {p.rating >= 4.8 && (
                                        <div className="absolute -top-3 left-10 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-lg flex items-center gap-1.5 z-10">
                                            <Star size={12} fill="white" className="text-white" /> Top Rated
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-8">
                                        <div className="w-28 h-28 bg-white rounded-[2rem] overflow-hidden border border-[#D2D2D7]/20 shadow-apple flex-shrink-0 flex items-center justify-center relative group-hover:shadow-apple-lg transition-all duration-500">
                                            {p.userId.avatar ? (
                                                <img src={p.userId.avatar} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="text-black group-hover:scale-110 transition-transform duration-500">
                                                    {categoryMeta[p.services[0]?.category]?.icon || <Zap size={32} />}
                                                </div>
                                            )}
                                            <div className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-sm border border-[#F5F5F7]">
                                                <ShieldCheck size={16} className="text-black" />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-2xl text-black tracking-tight group-hover:text-black transition-colors">{p.userId.name}</h4>
                                                    <div className="flex items-center gap-1.5 bg-[#F5F5F7] group-hover:bg-black group-hover:text-white px-3 py-1.5 rounded-full text-[11px] font-black tracking-widest transition-all">
                                                        <Star size={12} className={selectedProvider?._id === p._id ? 'fill-white' : 'fill-black'} /> {p.rating.toFixed(1)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[11px] text-[#86868B] font-bold uppercase tracking-widest">{p.services[0]?.category} Specialist</p>
                                                    <div className="w-1 h-1 rounded-full bg-[#D2D2D7]" />
                                                    <p className="text-[11px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                        Verified Expert
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 flex items-end justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-[#86868B] font-black uppercase tracking-[0.15em] leading-none">Price per hour</p>
                                                    <p className="text-3xl font-black text-black tracking-tighter flex items-baseline gap-1">
                                                        ₹{p.services[0]?.basePrice}
                                                        <span className="text-xs text-[#86868B] font-bold uppercase tracking-widest">/{p.services[0]?.priceUnit}</span>
                                                    </p>
                                                </div>
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={(e) => handleBookNow(e, p)}
                                                    className="h-12 px-8 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-apple-lg hover:bg-zinc-900 transition-all flex items-center justify-center gap-2 shadow-apple"
                                                >
                                                    Book Now <ChevronRight size={16} />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 hidden md:block relative">
                    <div className="sticky top-[208px] h-[calc(100vh-208px)] w-full p-8 pr-12">
                        <div className="w-full h-full rounded-[4rem] overflow-hidden border border-[#F5F5F7] shadow-inner relative">
                            {coords && (
                                <MapContainer center={[coords.lat, coords.lng]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                    <TileLayer 
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
                                        attribution='&copy; OpenStreetMap &copy; CARTO' 
                                        className="map-tiles-premium"
                                    />
                                    <ChangeView center={[coords.lat, coords.lng]} />
                                    <Marker position={[coords.lat, coords.lng]}>
                                        <Popup>You are here</Popup>
                                    </Marker>
                                    {!isLiveSimMode && providers.map((p) => (
                                        <Marker key={p._id} position={[p.currentLocation.coordinates[1], p.currentLocation.coordinates[0]]} icon={customIcon}>
                                            <Popup>
                                                <div className="p-4 text-center min-w-[120px]">
                                                    <p className="font-bold text-sm mb-2">{p.userId.name}</p>
                                                    <button 
                                                        onClick={() => handleBookNow(null, p)} 
                                                        className="w-full py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-800 transition-all"
                                                    >
                                                        Book Now
                                                    </button>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {isLiveSimMode && simulatedLiveProviders.map((sim, i) => {
                                        const name = sim.userId?.name || sim.name || 'Professional';
                                        const category = sim.category || 'Specialist';
                                        const lat = sim.lat;
                                        const lng = sim.lng;

                                        // Try to find a specific icon for this category
                                        const matchingMeta = Object.keys(categoryMeta).find(key => 
                                            category.toLowerCase().includes(key.toLowerCase()) ||
                                            (searchQuery && key.toLowerCase().includes(searchQuery.toLowerCase()))
                                        );
                                        
                                        const iconUrl = matchingMeta ? 
                                            'https://cdn-icons-png.flaticon.com/512/3082/3082383.png' : // default
                                            'https://cdn-icons-png.flaticon.com/512/684/684908.png';

                                        if (!lat || !lng) return null;

                                        return (
                                            <Marker 
                                                key={sim.id || sim.providerId || i} 
                                                position={[lat, lng]} 
                                                icon={new L.Icon({ 
                                                    iconUrl: matchingMeta ? 
                                                        'https://cdn-icons-png.flaticon.com/512/1067/1067555.png' : // Task icon
                                                        'https://cdn-icons-png.flaticon.com/512/3082/3082383.png', 
                                                    iconSize: [38, 38] 
                                                })}
                                            >
                                                <Popup>
                                                    <div className="p-4 flex flex-col items-center gap-3 min-w-[150px]">
                                                        <div className="flex flex-col items-center">
                                                            <p className="font-bold text-sm text-black">{name}</p>
                                                            <p className="text-[10px] text-apple-gray font-bold uppercase tracking-widest">{category}</p>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleBookNow(null, sim);
                                                            }}
                                                            className="w-full py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all"
                                                        >
                                                            Instant Book
                                                        </button>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        );
                                    })}
                                </MapContainer>
                            )}
                            <div className="absolute top-8 left-8 z-[1000] glass px-6 h-12 rounded-2xl flex items-center gap-3 border border-white/50 text-black shadow-lg">
                                <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Live Mode</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {bookingProvider && (
                    <BookingPanel provider={bookingProvider} onClose={() => setBookingProvider(null)} coords={coords} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Search;
