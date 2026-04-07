import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Clock, IndianRupee, ArrowLeft, ArrowRight, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../api/api';
import useLocationStore from '../store/useLocationStore';

const categoryMeta = {
    Plumbing:     { icon: '🚰', color: 'from-blue-500 to-blue-700',    bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',   desc: 'Expert plumbers for leaks, installations, and repairs.' },
    Electrical:   { icon: '⚡', color: 'from-yellow-500 to-orange-600', bg: 'bg-yellow-50',  text: 'text-yellow-600',  border: 'border-yellow-200', desc: 'Licensed electricians for wiring, faults, and setup.' },
    Cleaning:     { icon: '🧹', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50',   text: 'text-green-600',   border: 'border-green-200',  desc: 'Professional deep cleaning for homes and offices.' },
    'AC Repair':  { icon: '❄️', color: 'from-cyan-500 to-blue-600',     bg: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-200',   desc: 'AC servicing, gas refill, and installation experts.' },
    Carpentry:    { icon: '🪚', color: 'from-orange-500 to-amber-600',  bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200', desc: 'Skilled carpenters for furniture and woodwork.' },
    Painting:     { icon: '🎨', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200', desc: 'Interior & exterior painting with premium finishes.' },
    'Pest Control': { icon: '🐜', color: 'from-red-500 to-rose-600',    bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',    desc: 'Effective pest control for a bug-free home.' },
    Gardening:    { icon: '🌿', color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200',desc: 'Garden maintenance, landscaping, and plant care.' },
};

const ServiceDetail = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const { coords, getUserLocation, isLocationSet } = useLocationStore();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    const meta = categoryMeta[category] || { icon: '🔧', color: 'from-slate-500 to-slate-700', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', desc: 'Professional service providers near you.' };

    useEffect(() => {
        if (!isLocationSet) getUserLocation();
    }, []);

    useEffect(() => {
        if (isLocationSet) fetchProviders();
    }, [isLocationSet, category]);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/providers/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=15&service=${encodeURIComponent(category)}`);
            setProviders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-16 pt-24 px-4">
            {/* Hero Banner - Monochrome Glass Style */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-[3.5rem] bg-black text-white p-12 md:p-16 shadow-apple-xl border border-white/5"
            >
                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute top-8 left-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                >
                    <ArrowLeft size={22} />
                </button>
                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="text-8xl md:text-9xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-xl">
                        {meta.icon}
                    </div>
                    <div className="text-center md:text-left space-y-5 flex-1">
                        <div className="space-y-2">
                            <p className="text-apple-gray text-xs font-bold uppercase tracking-[0.3em] font-body opacity-80">Category Service</p>
                            <h1 className="text-5xl md:text-7xl font-headings font-bold tracking-tighter">{category}</h1>
                        </div>
                        <p className="text-white/60 font-medium max-w-xl text-lg md:text-xl leading-relaxed">{meta.desc}</p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                            <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold flex items-center gap-2 border border-white/10 tracking-tight"><ShieldCheck size={16} /> Verified Pros</span>
                            <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold flex items-center gap-2 border border-white/10 tracking-tight"><Clock size={16} /> Available Today</span>
                            <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold flex items-center gap-2 border border-white/10 tracking-tight"><Sparkles size={16} /> Elite Status</span>
                        </div>
                    </div>
                </div>
                {/* Subtle Background elements */}
                <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
            </motion.section>

            {/* Provider Count & Filters */}
            <div className="flex items-center justify-between px-4">
                <h2 className="text-3xl font-headings font-bold tracking-tight text-black">
                    {loading ? 'Finding Professionals...' : `${providers.length} Expert${providers.length !== 1 ? 's' : ''} near you`}
                </h2>
            </div>

            {/* Provider Cards */}
            {loading ? (
                <div className="grid md:grid-cols-2 gap-8 px-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-[3rem] border border-[#F5F5F7] p-8 space-y-6 shadow-apple animate-pulse">
                            <div className="flex gap-6">
                                <div className="w-20 h-20 bg-[#F5F5F7] rounded-[2rem]" />
                                <div className="flex-1 space-y-3 mt-2">
                                    <div className="h-5 bg-[#F5F5F7] rounded-full w-2/3" />
                                    <div className="h-4 bg-[#F5F5F7] rounded-full w-1/3" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-20 bg-[#F5F5F7] rounded-[1.5rem]" />
                                <div className="h-20 bg-[#F5F5F7] rounded-[1.5rem]" />
                                <div className="h-20 bg-[#F5F5F7] rounded-[1.5rem]" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : providers.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 space-y-6 bg-[#F5F5F7]/30 rounded-[3.5rem] border-2 border-dashed border-[#D2D2D7]"
                >
                    <div className="text-7xl opacity-50">{meta.icon}</div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-black tracking-tight">No {category} experts online</h3>
                        <p className="text-apple-gray font-medium text-base">Try searching again in a few minutes or check another service.</p>
                    </div>
                    <button onClick={() => navigate('/')} className="mt-4 apple-button px-10 h-14">
                        Explore all services
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    className="grid md:grid-cols-2 gap-10 px-2"
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                >
                    {providers.map((p) => (
                        <motion.div
                            key={p._id}
                            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
                            onClick={() => setSelectedId(selectedId === p._id ? null : p._id)}
                            className={`group bg-white rounded-[3.5rem] border-2 p-8 cursor-pointer transition-all duration-500 hover:shadow-apple-xl border-transparent ${selectedId === p._id ? 'border-black shadow-apple-lg' : 'shadow-apple hover:border-black/5'}`}
                        >
                            {/* Provider Info */}
                            <div className="flex gap-6">
                                <div className="w-24 h-24 bg-[#F5F5F7] rounded-[2.25rem] overflow-hidden flex-shrink-0 border border-[#D2D2D7]/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <img src={p.userId?.avatar || 'https://via.placeholder.com/150'} alt={p.userId?.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-2xl text-black tracking-tight truncate">{p.userId?.name}</h3>
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold bg-black text-white px-3 py-1 rounded-full flex-shrink-0 shadow-apple">
                                            <Star size={13} fill="currentColor" /> {p.rating?.toFixed(1) || '0.0'}
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-black bg-[#F5F5F7] w-fit px-3 py-0.5 rounded-full mt-2 tracking-tight">{p.services?.[0]?.subcategory || category} Specialist</p>
                                    {p.bio && <p className="text-[13px] text-apple-gray mt-2 font-medium line-clamp-1 italic">"{p.bio}"</p>}
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-4 mt-8">
                                <div className="bg-[#F5F5F7]/80 backdrop-blur-md p-4 rounded-[1.75rem] text-center border border-[#D2D2D7]/20">
                                    <IndianRupee size={20} className="mx-auto text-black mb-1.5" />
                                    <p className="text-lg font-bold text-black tracking-tight">₹{p.services?.[0]?.basePrice || '---'}</p>
                                    <p className="text-[10px] text-apple-gray font-bold uppercase tracking-widest mt-0.5">per {p.services?.[0]?.priceUnit || 'job'}</p>
                                </div>
                                <div className="bg-[#F5F5F7]/80 backdrop-blur-md p-4 rounded-[1.75rem] text-center border border-[#D2D2D7]/20">
                                    <Clock size={20} className="mx-auto text-black mb-1.5" />
                                    <p className="text-lg font-bold text-black tracking-tight">{p.workingHours?.start || '09:00'}</p>
                                    <p className="text-[10px] text-apple-gray font-bold uppercase tracking-widest mt-0.5">to {p.workingHours?.end || '18:00'}</p>
                                </div>
                                <div className="bg-[#F5F5F7]/80 backdrop-blur-md p-4 rounded-[1.75rem] text-center border border-[#D2D2D7]/20">
                                    <MapPin size={20} className="mx-auto text-black mb-1.5" />
                                    <p className="text-lg font-bold text-black tracking-tight">1.2 km</p>
                                    <p className="text-[10px] text-apple-gray font-bold uppercase tracking-widest mt-0.5">Nearby</p>
                                </div>
                            </div>

                            {/* Status & Stats */}
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#F5F5F7]">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-3 h-3 rounded-full ${p.isOnline ? 'bg-black shadow-[0_0_10px_rgba(0,0,0,0.1)] animate-pulse' : 'bg-[#D2D2D7]'}`} />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-black">{p.isOnline ? 'Available Now' : 'Currently Offline'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-apple-gray uppercase tracking-widest">{p.totalJobs || 0} Successful Jobs</span>
                                </div>
                            </div>

                            {/* Actions Overlay */}
                            <AnimatePresence>
                                {selectedId === p._id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex gap-4 mt-6">
                                            <a href={`tel:${p.userId?.phone}`} className="flex-1 h-14 bg-white border-2 border-black rounded-[1.5rem] font-bold flex items-center justify-center gap-2 text-sm hover:bg-[#F5F5F7] transition-all active:scale-95 shadow-sm text-black">
                                                <Phone size={18} /> Contact
                                            </a>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/booking/${p._id}`); }}
                                                className="flex-1 h-14 apple-button text-sm rounded-[1.5rem]"
                                            >
                                                Book Now <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default ServiceDetail;
