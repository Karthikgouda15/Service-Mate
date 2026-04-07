import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Step 1
    const [email, setEmail] = useState('');
    
    // Step 2
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const inputRefs = useRef([]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await api.post('/auth/forgotpassword', { email });
            toast.success('OTP sent to your email!');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong. Could not send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndReset = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        
        if (otpString.length !== 6) return toast.error('Please enter the full 6-digit OTP');
        if (password !== confirmPassword) return toast.error('Passwords do not match');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');

        setLoading(true);
        try {
            await api.put('/auth/resetpassword', { 
                email,
                otp: otpString,
                password 
            });
            toast.success('Password reset successfully!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    // OTP Input handlers
    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <div className="max-w-md mx-auto pt-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[2.5rem] border border-[#F5F5F7] shadow-apple-xl overflow-hidden"
            >
                <Link to="/login" className="flex items-center gap-2 text-apple-gray hover:text-black font-semibold text-sm transition-colors w-fit mb-10 relative z-10">
                    <ArrowLeft size={16} /> Back to Sign In
                </Link>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="text-center space-y-3">
                                <h2 className="text-4xl font-headings font-bold tracking-tight text-black">Reset Password</h2>
                                <p className="text-apple-gray font-medium text-base">Enter your email to receive a secure OTP</p>
                            </div>

                            <form onSubmit={handleSendOTP} className="space-y-6">
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

                                <button
                                    disabled={loading || !email}
                                    className="apple-button w-full h-14 text-lg"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 bg-black text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-apple-lg">
                                    <CheckCircle2 size={28} />
                                </div>
                                <h2 className="text-3xl font-headings font-bold tracking-tight text-black">Enter Security Code</h2>
                                <p className="text-apple-gray font-medium text-sm leading-relaxed px-4">
                                    We sent a 6-digit code to <span className="text-black font-bold break-all">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyAndReset} className="space-y-8">
                                {/* OTP Inputs */}
                                <div className="flex justify-between gap-2">
                                    {otp.map((data, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            maxLength="1"
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            value={data}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-xl font-black bg-[#F5F5F7] border-2 border-transparent focus:border-black focus:bg-white rounded-xl outline-none transition-all shadow-sm"
                                        />
                                    ))}
                                </div>

                                {/* New Password Fields */}
                                <div className="space-y-4 pt-4 border-t border-[#F5F5F7]">
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-black text-apple-gray ml-1">New Password</label>
                                        <div className="relative group">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray transition-colors group-focus-within:text-black" size={18} />
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full h-12 bg-[#F5F5F7] border-2 border-transparent focus:border-black focus:bg-white rounded-xl pl-12 pr-4 outline-none transition-all font-medium placeholder:text-apple-gray/50"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-widest font-black text-apple-gray ml-1">Confirm Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray transition-colors group-focus-within:text-black" size={18} />
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full h-12 bg-[#F5F5F7] border-2 border-transparent focus:border-black focus:bg-white rounded-xl pl-12 pr-4 outline-none transition-all font-medium placeholder:text-apple-gray/50"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={loading || otp.join('').length !== 6 || !password || !confirmPassword}
                                    className="apple-button w-full h-14 text-lg mt-4"
                                >
                                    {loading ? 'Verifying...' : 'Set New Password'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
