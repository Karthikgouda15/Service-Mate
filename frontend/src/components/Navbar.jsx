import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, User, LogOut, LayoutGrid } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const location = useLocation();

    const navItems = [
        { icon: <Home size={22} />, label: 'Home', path: '/' },
        { icon: <LayoutGrid size={22} />, label: 'Explore', path: '/search' },
        { icon: <Calendar size={22} />, label: 'Bookings', path: '/bookings' },
        { icon: <User size={22} />, label: 'Profile', path: isAuthenticated ? '/profile' : '/login' },
    ];

    return (
        <>
            {/* Desktop Navbar - The Premium Header */}
            <header className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-white/60 backdrop-blur-2xl border-b border-[#F5F5F7] z-[1000] px-12 items-center justify-between transition-all duration-300">
                <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                        <div className="w-5 h-5 bg-white rounded-sm rotate-45" />
                    </div>
                    <span className="text-2xl font-headings font-bold text-black tracking-tighter">ServiceMate</span>
                </Link>

                <nav className="flex items-center gap-10">
                    {(!user || user?.role === 'customer') && (
                        <>
                            <div className="flex items-center gap-10 font-bold text-[13px] uppercase tracking-widest text-[#86868B] transition-all">
                                <Link to="/" className={`hover:text-black transition-colors relative py-2 ${location.pathname === '/' ? 'text-black' : ''}`}>
                                    Home
                                    {location.pathname === '/' && <motion.div layoutId="nav-dot-desktop" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />}
                                </Link>
                                <Link to="/search" className={`hover:text-black transition-colors relative py-2 ${location.pathname === '/search' ? 'text-black' : ''}`}>
                                    Explore
                                    {location.pathname === '/search' && <motion.div layoutId="nav-dot-desktop" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />}
                                </Link>
                                <Link to="/bookings" className={`hover:text-black transition-colors relative py-2 ${location.pathname === '/bookings' ? 'text-black' : ''}`}>
                                    My Bookings
                                    {location.pathname === '/bookings' && <motion.div layoutId="nav-dot-desktop" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />}
                                </Link>
                            </div>

                            <div className="h-6 w-px bg-[#F5F5F7] mx-2" />
                        </>
                    )}

                    {isAuthenticated ? (
                        <div className="flex items-center gap-6">
                            <Link to="/profile" className="flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-2xl shadow-apple hover:shadow-apple-lg transition-all active:scale-95 group">
                                <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center font-black text-[10px] text-white">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest leading-none">{user?.name?.split(' ')[0]}</span>
                            </Link>
                            <button onClick={logout} title="Sign Out" className="w-10 h-10 rounded-full flex items-center justify-center text-[#86868B] hover:text-black hover:bg-[#F5F5F7] transition-all active:scale-90">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="h-11 px-8 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:shadow-apple-lg shadow-apple hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center">
                            Sign In
                        </Link>
                    )}
                </nav>
            </header>

            {/* Mobile Bottom Navigation - Floating Glass Style */}
            {(!user || user?.role === 'customer') && (
                <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] h-20 glass shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] z-[1000] flex items-center justify-around px-6 border border-white/20">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center gap-1.5 transition-all relative flex-1 h-full ${location.pathname === item.path ? 'text-black' : 'text-[#86868B]'}`}
                        >
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                className={`${location.pathname === item.path ? 'scale-110' : ''}`}
                            >
                                {item.icon}
                            </motion.div>
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</span>
                            {location.pathname === item.path && (
                                <motion.div
                                    layoutId="nav-indicator-mobile"
                                    className="w-1 h-1 bg-black rounded-full absolute bottom-2"
                                />
                            )}
                        </Link>
                    ))}
                </nav>
            )}
        </>
    );
};

export default Navbar;
