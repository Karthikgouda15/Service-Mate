import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, IndianRupee, Activity, CheckCircle2, XCircle } from 'lucide-react';

const AdminDashboard = () => {
    // Mock Data for MVP
    const [providers, setProviders] = useState([
        { id: '1', name: 'Ramesh Plumber', service: 'Plumbing', status: 'pending', date: '2023-11-20' },
        { id: '2', name: 'Clean Co.', service: 'Cleaning', status: 'pending', date: '2023-11-21' },
    ]);

    const stats = [
        { label: 'Total Revenue', value: '₹4,52,000', icon: <IndianRupee size={24} className="text-emerald-500" />, trend: '+15%' },
        { label: 'Active Jobs', value: '34', icon: <Briefcase size={24} className="text-primary" />, trend: '+5%' },
        { label: 'Total Users', value: '1,204', icon: <Users size={24} className="text-purple-500" />, trend: '+12%' },
        { label: 'Platform Uptime', value: '99.9%', icon: <Activity size={24} className="text-blue-500" />, trend: 'Stable' },
    ];

    const approveProvider = (id) => {
        setProviders(providers.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-12 pb-16 pt-8 max-w-6xl mx-auto px-4">
            <header className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] shadow-apple-xl border border-[#F5F5F7] gap-6">
                <div className="text-center md:text-left space-y-2">
                    <h2 className="text-4xl font-headings font-bold tracking-tight text-black">Admin Console</h2>
                    <p className="text-apple-gray font-medium text-lg italic">Platform oversight & professional management</p>
                </div>
                <div className="bg-black px-6 py-3 rounded-2xl text-[11px] font-black text-white flex items-center gap-3 shadow-apple uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> System Operational
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-[#F5F5F7] shadow-apple hover:shadow-apple-lg transition-all duration-500 space-y-6 group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-black rounded-2xl text-white shadow-apple group-hover:scale-110 transition-transform">
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
                        <span className="bg-[#F5F5F7] text-black px-3 py-0.5 rounded-full text-sm font-bold border border-black/5">{providers.length}</span>
                    </h3>
                </div>
                
                {providers.length === 0 ? (
                    <div className="py-20 text-center text-apple-gray font-medium text-lg italic bg-[#F5F5F7]/30 rounded-[2.5rem] border-2 border-dashed border-[#D2D2D7]">
                        All professional applications have been processed.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {providers.map(provider => (
                            <div key={provider.id} className="flex flex-col md:flex-row justify-between items-center p-6 border border-[#F5F5F7] rounded-[2rem] bg-[#F5F5F7]/30 hover:bg-white hover:shadow-apple transition-all duration-300 gap-6">
                                <div className="flex items-center gap-5 w-full md:w-auto text-center md:text-left">
                                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-apple">
                                        {provider.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-xl text-black tracking-tight">{provider.name}</p>
                                        <p className="text-xs text-apple-gray font-bold uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start mt-1">
                                            {provider.service} <span className="w-1 h-1 bg-apple-gray rounded-full opacity-50" /> Applied {provider.date}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button 
                                        onClick={() => approveProvider(provider.id)}
                                        className="flex-1 md:flex-none h-12 px-6 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-apple-lg transition-all active:scale-95 text-sm"
                                    >
                                        <CheckCircle2 size={18} /> Approve
                                    </button>
                                    <button 
                                        onClick={() => approveProvider(provider.id)}
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
        </div>
    );
};

export default AdminDashboard;
