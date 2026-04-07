import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle2, ChevronRight, ChevronLeft, CreditCard, Zap } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const steps = ['Service Details', 'Schedule', 'Confirm'];

const BookingFlow = () => {
    const { id: providerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [provider, setProvider] = useState(null);
    const dynamicPrice = location.state?.dynamicPrice;
    const isSurging = location.state?.isSurging;
    const [bookingData, setBookingData] = useState({
        serviceType: '',
        description: '',
        scheduledAt: '',
        address: '',
        price: 0
    });

    useEffect(() => {
        const fetchProvider = async () => {
            try {
                const { data } = await api.get(`/providers/${providerId}`);
                setProvider(data);
                if (data) {
                    setBookingData(prev => ({
                        ...prev,
                        serviceType: data.services[0].category,
                        price: dynamicPrice || data.services[0].basePrice
                    }));
                }
            } catch (error) {
                toast.error('Failed to load provider details');
            }
        };
        fetchProvider();
    }, [providerId]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleConfirm = async () => {
        try {
            const { data } = await api.post('/bookings', {
                providerId: provider.userId._id,
                ...bookingData,
                location: { type: 'Point', coordinates: [77.5946, 12.9716] } // Mock location
            });
            toast.success('Booking Successful!');
            navigate(`/track/${data._id}`);
        } catch (error) {
            toast.error('Booking failed: ' + error.response?.data?.message);
        }
    };

    if (!provider) return <div className="h-96 flex items-center justify-center font-bold">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-12 py-10">
            {/* Progress Header */}
            <div className="flex justify-between items-center px-10 relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-20 right-20 h-0.5 bg-[#F5F5F7] -z-10" />
                {steps.map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-4 bg-white px-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-700 ${step > i ? 'bg-black text-white shadow-apple-lg' : step === i + 1 ? 'bg-white border-2 border-black text-black scale-110 shadow-apple-xl' : 'bg-[#F5F5F7] text-[#D2D2D7] border border-[#D2D2D7]/20'}`}>
                            {step > i ? <CheckCircle2 size={28} /> : i + 1}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${step === i + 1 ? 'text-black' : 'text-apple-gray opacity-60'}`}>{s}</span>
                    </div>
                ))}
            </div>

            <div className="bg-white p-12 rounded-[4rem] border border-[#F5F5F7] shadow-apple-xl overflow-hidden min-h-[500px] flex flex-col">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-10 flex-1"
                        >
                            <div className="space-y-3">
                                <h3 className="text-4xl font-headings font-bold tracking-tight text-black">Select Service</h3>
                                <p className="text-lg text-apple-gray font-medium italic">Expertise by {provider.userId.name}</p>
                            </div>
                            <div className="grid gap-5">
                                {provider.services.map((s) => {
                                    const displayPrice = dynamicPrice || s.basePrice;
                                    return (
                                        <div
                                            key={s.subcategory}
                                            onClick={() => setBookingData({ ...bookingData, serviceType: s.subcategory, price: displayPrice })}
                                            className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 flex justify-between items-center ${bookingData.serviceType === s.subcategory ? 'border-black bg-white shadow-apple-lg' : 'border-transparent bg-[#F5F5F7]/50 hover:bg-[#F5F5F7]'}`}
                                        >
                                            <span className="font-bold text-xl text-black tracking-tight flex items-center gap-2">
                                                {s.subcategory}
                                                {isSurging && <span className="flex items-center text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest font-black"><Zap size={10} className="mr-0.5" /> High Demand</span>}
                                            </span>
                                            
                                            <span className="text-black font-black text-2xl tracking-tighter">₹{displayPrice}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-apple-gray ml-2">Additional Instructions</label>
                                <textarea
                                    placeholder="Describe the issue or specific requirements..."
                                    className="w-full p-8 bg-[#F5F5F7] rounded-[2.5rem] border-2 border-transparent focus:border-black focus:bg-white transition-all font-medium text-lg placeholder:text-apple-gray/40 outline-none h-40 shadow-inner"
                                    value={bookingData.description}
                                    onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-10 flex-1"
                        >
                            <div className="space-y-3">
                                <h3 className="text-4xl font-headings font-bold tracking-tight text-black">When & Where?</h3>
                                <p className="text-lg text-apple-gray font-medium italic">Schedule your session</p>
                            </div>
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button 
                                        type="button"
                                        onClick={() => setBookingData({ ...bookingData, scheduledAt: new Date().toISOString().slice(0, 16) })}
                                        className={`p-8 rounded-[2.5rem] border-2 font-black transition-all duration-500 flex flex-col items-center gap-4 ${bookingData.scheduledAt && new Date(bookingData.scheduledAt).getTime() < new Date().getTime() + 100000 ? 'border-black bg-black text-white shadow-apple-lg' : 'border-transparent bg-[#F5F5F7] text-black hover:border-black/10'}`}
                                    >
                                        <Clock size={32} />
                                        <span className="text-xs uppercase tracking-widest leading-none">As soon as possible</span>
                                    </button>
                                    <div className="relative group">
                                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-apple-gray group-focus-within:text-black transition-colors" size={28} />
                                        <input
                                            type="datetime-local"
                                            className="w-full h-full min-h-[120px] bg-[#F5F5F7] rounded-[2.5rem] pl-16 pr-8 outline-none border-2 border-transparent focus:border-black focus:bg-white font-bold text-sm transition-all"
                                            value={bookingData.scheduledAt}
                                            onChange={(e) => setBookingData({ ...bookingData, scheduledAt: e.target.value })}
                                        />
                                    </div>
                                </div>
                                
                                <div className="relative group">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-apple-gray group-focus-within:text-black transition-colors" size={28} />
                                    <input
                                        type="text"
                                        placeholder="Service Delivery Address"
                                        className="w-full h-20 bg-[#F5F5F7] rounded-[2.5rem] pl-16 pr-24 outline-none border-2 border-transparent focus:border-black focus:bg-white font-medium text-lg placeholder:text-apple-gray/40 transition-all shadow-inner"
                                        value={bookingData.address}
                                        onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setBookingData({ ...bookingData, address: '123, Indiranagar, Bangalore' })}
                                        className="absolute right-8 top-1/2 -translate-y-1/2 text-black font-black text-[10px] uppercase tracking-widest hover:underline underline-offset-8 transition-all"
                                    >
                                        Auto-fill
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-10 flex-1"
                        >
                            <h3 className="text-4xl font-headings font-bold tracking-tight text-black">Final Review</h3>
                            <div className="bg-[#F5F5F7]/50 p-10 rounded-[3rem] space-y-6 border border-[#F5F5F7] shadow-inner">
                                <div className="flex justify-between items-center border-b border-black/5 pb-6">
                                    <span className="text-apple-gray font-bold text-xs uppercase tracking-widest">Service</span>
                                    <span className="font-bold text-xl text-black tracking-tight">{bookingData.serviceType}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-black/5 pb-6">
                                    <span className="text-apple-gray font-bold text-xs uppercase tracking-widest">Expert</span>
                                    <span className="font-bold text-xl text-black tracking-tight">{provider.userId.name}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-black/5 pb-6">
                                    <span className="text-apple-gray font-bold text-xs uppercase tracking-widest">Scheduled</span>
                                    <span className="font-bold text-lg text-black">{new Date(bookingData.scheduledAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <span className="text-apple-gray font-bold text-xs uppercase tracking-widest">Total Amount</span>
                                    <span className="text-4xl font-headings font-bold text-black tracking-tighter">₹{bookingData.price}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-6 border border-black/5 rounded-[2rem] text-apple-gray text-[13px] font-bold bg-[#F5F5F7]/30 uppercase tracking-widest leading-relaxed">
                                <CreditCard size={24} className="text-black" /> Payment will be collected after service.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Buttons - End to End Alignment */}
            <div className="flex gap-4 px-10 md:px-0">
                {step > 1 && (
                    <button
                        onClick={handleBack}
                        className="h-16 px-8 bg-white border-2 border-black text-black rounded-[1.25rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#F5F5F7] transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronLeft size={20} /> Back
                    </button>
                )}
                <button
                    onClick={step === 3 ? handleConfirm : handleNext}
                    disabled={step === 1 && !bookingData.serviceType || step === 2 && (!bookingData.scheduledAt || !bookingData.address)}
                    className="flex-1 apple-button h-16 text-lg rounded-[1.25rem] shadow-apple-lg"
                >
                    {step === 3 ? 'Confirm & Book' : 'Continue'} <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default BookingFlow;
