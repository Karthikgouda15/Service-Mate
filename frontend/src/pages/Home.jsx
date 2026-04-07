import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, ShieldCheck, Zap, Clock, ArrowRight, IndianRupee, Users, ChevronRight, Droplets, Sparkles, Wind, Hammer, Paintbrush, Bug, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const categoryMeta = {
    Plumbing: { icon: <Droplets size={28} />, color: 'bg-[#F5F5F7] group-hover:bg-black group-hover:text-white border border-[#D2D2D7]/30' },
    Electrical: { icon: <Zap size={28} />, color: 'bg-[#F5F5F7] group-hover:bg-black group-hover:text-white border border-[#D2D2D7]/30' },
    Cleaning: { icon: <Sparkles size={28} />, color: 'bg-[#F5F5F7] group-hover:bg-black group-hover:text-white border border-[#D2D2D7]/30' },
    'AC Repair': { icon: <Wind size={28} />, color: 'bg-[#F5F5F7] group-hover:bg-black group-hover:text-white border border-[#D2D2D7]/30' },
    Carpentry: { icon: <Hammer size={28} />, color: 'bg-[#F5F5F7] group-hover:bg-black group-hover:text-white border border-[#D2D2D7]/30' },
    Painting: { icon: <Paintbrush size={28} />, color: 'bg-[#F5F5F7] group-hover:bg-black group-hover:text-white border border-[#D2D2D7]/30' },
    'Pest Control': { icon: <Bug size={28} />, color: 'bg-[#F5F5F7] group-hover:bg-black group-hover:text-white border border-[#D2D2D7]/30' },
    Gardening: { icon: <Leaf size={28} />, color: 'bg-[#F5F5F7] group-hover:bg-black group-hover:text-white border border-[#D2D2D7]/30' },
};

const steps = [
    { num: '01', title: 'Choose a Service', desc: 'Browse categories or search for what you need.', icon: <Search size={24} /> },
    { num: '02', title: 'Pick a Professional', desc: 'Compare ratings, prices & availability near you.', icon: <Users size={24} /> },
    { num: '03', title: 'Book & Track Live', desc: 'Confirm OTP, track arrival in real-time on map.', icon: <MapPin size={24} /> },
];
const Home = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await api.get('/services');
                setServices(data);
            } catch (err) {
                console.error('Error fetching services:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleSearch = (query) => {
        const q = query || searchTerm;
        if (q.trim()) {
            navigate(`/search?category=${encodeURIComponent(q.trim())}`);
        } else {
            navigate('/search');
        }
    };

    const handleInputChange = (val) => {
        setSearchTerm(val);
        if (val.trim().length > 1) {
            const matches = Object.keys(categoryMeta).filter(cat => 
                cat.toLowerCase().includes(val.toLowerCase())
            );
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    return (
        <div className="space-y-24 pb-20">
            {/* Hero Section - The Premium Service Hub */}
            <section className="relative w-full overflow-hidden bg-white pt-24 pb-16">
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-4xl space-y-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-6"
                        >
                            <h1 className="text-6xl md:text-8xl font-headings font-bold leading-[1.05] tracking-tight text-black">
                                Get help. <br />
                                <span className="text-[#86868B]">In real-time.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-[#86868B] font-medium max-w-xl leading-relaxed">
                                The simplest way to book top-rated professionals. <br />
                                Transparent, verified, and always near you.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-3xl relative"
                        >
                            <div className="flex flex-col md:flex-row gap-0 group shadow-apple-lg rounded-[2rem] overflow-hidden border border-[#F5F5F7]">
                                <div className="flex-1 relative bg-[#F5F5F7] group-focus-within:bg-white transition-colors duration-500">
                                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-[#86868B] group-focus-within:text-black transition-colors" size={22} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="What can we help you with?"
                                        className="w-full h-16 pl-16 pr-6 text-lg font-medium text-black placeholder:text-[#86868B]/40 outline-none bg-transparent"
                                    />
                                </div>
                                <button
                                    onClick={() => handleSearch()}
                                    className="h-16 px-10 bg-black text-white font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-100 flex items-center justify-center gap-2"
                                >
                                    Search <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Refined Suggestions Dropdown */}
                            <AnimatePresence>
                                {suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        className="absolute top-full left-0 right-0 max-w-3xl bg-white/90 backdrop-blur-2xl mt-4 rounded-3xl shadow-apple-2xl border border-[#F5F5F7] z-50 overflow-hidden"
                                    >
                                        {suggestions.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => handleSearch(cat)}
                                                className="w-full h-14 px-8 flex items-center gap-4 hover:bg-black hover:text-white transition-all text-left group border-b border-[#F5F5F7] last:border-none"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-[#F5F5F7] group-hover:bg-white/20 flex items-center justify-center text-black group-hover:text-white transition-colors">
                                                    {categoryMeta[cat]?.icon}
                                                </div>
                                                <span className="text-base font-bold text-black group-hover:text-white">{cat}</span>
                                                <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-60 transition-all" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-6 pt-4"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-black">Live updates active</span>
                            </div>
                            <div className="w-px h-4 bg-[#D2D2D7]" />
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={14} className="text-[#86868B]" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-[#86868B]">Verified Professionals</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative background visual - Subtly premium */}
                <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden pointer-events-none opacity-20 md:opacity-100">
                    <div className="w-full h-full bg-gradient-to-l from-[#F5F5F7] to-transparent" />
                </div>
            </section>


            {/* End of Hero Section */}

            {/* Popular Services - The App Icon Grid */}
            <section className="container mx-auto px-6 md:px-12 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                    <h2 className="text-4xl font-headings font-bold tracking-tighter text-black">Popular Services</h2>
                    <p className="text-lg text-[#86868B] font-medium">Explore by category</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-8 md:gap-12">
                    {Object.entries(categoryMeta).map(([category, meta], idx) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => navigate(`/search?category=${encodeURIComponent(category)}`)}
                            className="flex flex-col items-center text-center gap-5 group cursor-pointer"
                        >
                            <div className="w-24 h-24 md:w-28 md:w-28 bg-[#F5F5F7] rounded-[2rem] flex items-center justify-center text-black border border-transparent group-hover:border-black group-hover:bg-white group-hover:shadow-apple-xl transition-all duration-500 relative overflow-hidden">
                                <div className="group-hover:scale-110 transition-transform duration-500">
                                    {meta.icon}
                                </div>
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition-opacity" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-black tracking-tight">{category}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#86868B] opacity-0 group-hover:opacity-100 transition-all">Book Now</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
            {/* How It Works - The Ultra-Minimal Flow */}
            <section className="container mx-auto px-6 md:px-12 pt-20">
                <div className="bg-[#F5F5F7] rounded-[4rem] p-12 md:p-20 space-y-16">
                    <div className="max-w-2xl">
                        <h2 className="text-5xl md:text-6xl font-headings font-bold tracking-tighter text-black">Simple to use.</h2>
                        <p className="text-xl md:text-2xl text-[#86868B] font-medium mt-4">Three steps to your next service solved.</p>
                    </div>
    
                    <div className="grid md:grid-cols-3 gap-12">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.num}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="space-y-6"
                            >
                                <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
                                    {step.icon}
                                </div>
                                <div className="space-y-3">
                                    <div className="text-xs font-black uppercase tracking-widest text-black">Step {step.num}</div>
                                    <h3 className="text-2xl font-bold text-black tracking-tight">{step.title}</h3>
                                    <p className="text-[#86868B] text-lg font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
 
            {/* Trust Badges - High Contrast Monochrome */}
            <section className="bg-black w-[100vw] relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-24">
                <div className="container mx-auto px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center text-white">
                        <div className="space-y-2">
                            <p className="text-5xl font-headings font-bold tracking-tighter">500+</p>
                            <p className="text-apple-gray text-xs font-bold uppercase tracking-widest">Verified Pros</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-5xl font-headings font-bold tracking-tighter">10K+</p>
                            <p className="text-apple-gray text-xs font-bold uppercase tracking-widest">Bookings Done</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-5xl font-headings font-bold tracking-tighter">4.9</p>
                            <p className="text-apple-gray text-xs font-bold uppercase tracking-widest">Star Rating</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-5xl font-headings font-bold tracking-tighter">24/7</p>
                            <p className="text-apple-gray text-xs font-bold uppercase tracking-widest">Live Support</p>
                        </div>
                    </div>
                </div>
            </section>
 
            {/* Features Section - Clean Icons */}
            <section className="container mx-auto px-6 md:px-12 grid md:grid-cols-3 gap-12 py-12 bg-[#F5F5F7] rounded-[4rem] my-20 border border-[#F5F5F7]">
                <div className="p-8 flex flex-col gap-6">
                    <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-black tracking-tight">Instant Booking</h3>
                        <p className="text-[#86868B] text-lg mt-1 font-medium leading-relaxed">Book a certified expert in under 60 seconds.</p>
                    </div>
                </div>
                <div className="p-8 flex flex-col gap-6">
                    <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-black tracking-tight">Live Tracking</h3>
                        <p className="text-[#86868B] text-lg mt-1 font-medium leading-relaxed">Watch your pro arrive in real-time on our live map.</p>
                    </div>
                </div>
                <div className="p-8 flex flex-col gap-6">
                    <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-black tracking-tight">Quality Assured</h3>
                        <p className="text-[#86868B] text-lg mt-1 font-medium leading-relaxed">Every professional is background-checked and highly-rated.</p>
                    </div>
                </div>
            </section>

            {/* Footer - The Premium Anchor */}
            <footer className="bg-white pt-24 pb-12 border-t border-[#F5F5F7]">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-12">
                        <div className="col-span-2 space-y-8">
                            <h2 className="text-3xl font-bold tracking-tighter text-black flex items-center gap-3">
                                <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
                                    <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
                                </div>
                                ServiceMate
                            </h2>
                            <p className="text-[#86868B] text-lg font-medium max-w-sm leading-relaxed">
                                Redefining local services with a premium, real-time booking experience. Built for reliability and professional excellence.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black">Company</h3>
                            <ul className="space-y-3 text-[#86868B] text-base font-bold">
                                <li><a href="#" className="hover:text-black transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-black transition-colors">Expert Network</a></li>
                                <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black">Support</h3>
                            <ul className="space-y-3 text-[#86868B] text-base font-bold">
                                <li><a href="#" className="hover:text-black transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-24 pt-10 border-t border-[#F5F5F7] flex flex-col md:flex-row justify-between items-center gap-8">
                        <p className="text-[#86868B] text-[10px] font-black uppercase tracking-widest leading-none">© 2026 ServiceMate. All rights reserved.</p>
                        <div className="flex gap-10 text-[#86868B] text-[10px] font-black uppercase tracking-widest leading-none">
                            <a href="#" className="hover:text-black transition-colors">Twitter</a>
                            <a href="#" className="hover:text-black transition-colors">LinkedIn</a>
                            <a href="#" className="hover:text-black transition-colors">Instagram</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
