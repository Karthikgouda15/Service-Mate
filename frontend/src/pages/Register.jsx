import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Briefcase, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer'
    });
    const { register, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await register(formData);
        if (result.success) {
            toast.success('Account created successfully!');
            setTimeout(() => {
                if (result.user.role === 'provider') {
                    navigate('/provider/dashboard');
                } else if (result.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }, 10);
        } else {
            toast.error(result.message);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-md mx-auto pt-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[2.5rem] border border-[#F5F5F7] shadow-apple-xl space-y-8"
            >
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-headings font-bold tracking-tight text-black">Join ServiceMate</h2>
                    <p className="text-apple-gray font-medium text-base">Create your account to get started</p>
                </div>

                <div className="flex bg-[#F5F5F7] p-1.5 rounded-[1.25rem]">
                    <button
                        onClick={() => setFormData({ ...formData, role: 'customer' })}
                        className={`flex-1 h-11 rounded-[1rem] font-semibold text-sm transition-all duration-300 ${formData.role === 'customer' ? 'bg-white shadow-apple text-black' : 'text-apple-gray hover:text-black/60'}`}
                    >
                        Customer
                    </button>
                    <button
                        onClick={() => setFormData({ ...formData, role: 'provider' })}
                        className={`flex-1 h-11 rounded-[1rem] font-semibold text-sm transition-all duration-300 ${formData.role === 'provider' ? 'bg-white shadow-apple text-black' : 'text-apple-gray hover:text-black/60'}`}
                    >
                        Provider
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black tracking-tight ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray transition-colors group-focus-within:text-black" size={20} />
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full h-13 bg-[#F5F5F7] border-2 border-transparent focus:border-black focus:bg-white rounded-2xl pl-12 pr-4 outline-none transition-all font-medium text-base placeholder:text-apple-gray/50"
                                placeholder="Your full name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black tracking-tight ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray transition-colors group-focus-within:text-black" size={20} />
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full h-13 bg-[#F5F5F7] border-2 border-transparent focus:border-black focus:bg-white rounded-2xl pl-12 pr-4 outline-none transition-all font-medium text-base placeholder:text-apple-gray/50"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black tracking-tight ml-1">Phone</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray transition-colors group-focus-within:text-black" size={20} />
                            <input
                                name="phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full h-13 bg-[#F5F5F7] border-2 border-transparent focus:border-black focus:bg-white rounded-2xl pl-12 pr-4 outline-none transition-all font-medium text-base placeholder:text-apple-gray/50"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-black tracking-tight ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray transition-colors group-focus-within:text-black" size={20} />
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full h-13 bg-[#F5F5F7] border-2 border-transparent focus:border-black focus:bg-white rounded-2xl pl-12 pr-4 outline-none transition-all font-medium text-base placeholder:text-apple-gray/50"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="apple-button w-full h-14 text-lg mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Get Started'}
                    </button>
                </form>

                <p className="text-center text-base font-medium text-apple-gray">
                    Already have an account? <Link to="/login" className="text-black font-semibold hover:underline underline-offset-4 ml-1">Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
