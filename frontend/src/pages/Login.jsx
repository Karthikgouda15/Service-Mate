import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            toast.success('Welcome back!');
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

    return (
        <div className="max-w-md mx-auto py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[2.5rem] border border-[#F5F5F7] shadow-apple-xl space-y-10"
            >
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-headings font-bold tracking-tight text-black">Welcome back</h2>
                    <p className="text-apple-gray font-medium text-base">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-black tracking-tight ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray transition-colors group-focus-within:text-black" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-14 bg-[#F5F5F7] border-2 border-transparent focus:border-black focus:bg-white rounded-2xl pl-12 pr-4 outline-none transition-all font-medium text-lg placeholder:text-apple-gray/50"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-black tracking-tight ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray transition-colors group-focus-within:text-black" size={20} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-14 bg-[#F5F5F7] border-2 border-transparent focus:border-black focus:bg-white rounded-2xl pl-12 pr-4 outline-none transition-all font-medium text-lg placeholder:text-apple-gray/50"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm px-1 font-medium">
                        <label className="flex items-center gap-2 cursor-pointer text-apple-gray hover:text-black transition-colors">
                            <input type="checkbox" className="rounded-md border-[#D2D2D7] text-black focus:ring-black h-4 w-4" /> Remember me
                        </label>
                        <Link to="/forgot-password" className="text-black hover:underline underline-offset-4">Forgot password?</Link>
                    </div>

                    <button
                        disabled={loading}
                        className="apple-button w-full h-14 text-lg"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#F5F5F7]" /></div>
                    <div className="relative flex justify-center text-xs font-semibold text-apple-gray uppercase tracking-widest bg-white px-4">Or continue with</div>
                </div>

                <p className="text-center text-base font-medium text-apple-gray">
                    New here? <Link to="/register" className="text-black font-semibold hover:underline underline-offset-4 ml-1">Create an account</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
