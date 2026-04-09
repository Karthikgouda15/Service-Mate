import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram, Facebook, Globe, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Company: [
            { label: 'About Us', path: '/about' },
            { label: 'Expert Network', path: '/search' },
            { label: 'Careers', path: '/careers' },
            { label: 'Privacy Policy', path: '/privacy' },
        ],
        Support: [
            { label: 'Help Center', path: '/help' },
            { label: 'Terms of Service', path: '/terms' },
            { label: 'Booking Guide', path: '/guide' },
            { label: 'Contact Us', path: '/contact' },
        ],
        Services: [
            { label: 'Plumbing', path: '/search?category=Plumbing' },
            { label: 'Electrical', path: '/search?category=Electrical' },
            { label: 'Cleaning', path: '/search?category=Cleaning' },
            { label: 'AC Repair', path: '/search?category=AC%20Repair' },
        ]
    };

    return (
        <footer className="bg-white pt-32 pb-16 border-t border-[#F5F5F7] relative z-0">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-20 md:gap-12">
                    {/* Brand Meta */}
                    <div className="md:col-span-2 space-y-10">
                        <div className="space-y-6">
                            <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group w-fit">
                                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                                    <div className="w-5 h-5 bg-white rounded-sm rotate-45" />
                                </div>
                                <span className="text-2xl font-headings font-bold text-black tracking-tighter">ServiceMate</span>
                            </Link>
                            <p className="text-[#86868B] text-lg font-medium leading-relaxed max-w-sm italic">
                                Redefining local services with a premium, real-time booking experience. Built for reliability and professional excellence.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-black font-bold text-sm">
                                <MapPin size={18} />
                                <span>Global Headquarters, Indiranagar, KA</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#86868B] font-medium text-sm">
                                <Mail size={18} />
                                <span>connect@servicemate.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-12">
                        {Object.entries(footerLinks).map(([title, links]) => (
                            <div key={title} className="space-y-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-black">{title}</h3>
                                <ul className="space-y-5">
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            <Link 
                                                to={link.path} 
                                                className="text-[#86868B] hover:text-black transition-all duration-300 font-bold text-sm hover:translate-x-1 inline-block"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Social & Language */}
                    <div className="md:col-span-1 space-y-10">
                        <div className="space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-black">Follow Us</h3>
                            <div className="flex md:flex-col lg:flex-row gap-5">
                                <a href="#" className="w-10 h-10 rounded-xl bg-[#F5F5F7] hover:bg-black hover:text-white flex items-center justify-center transition-all duration-500 shadow-sm border border-transparent hover:border-black/5">
                                    <Twitter size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-xl bg-[#F5F5F7] hover:bg-black hover:text-white flex items-center justify-center transition-all duration-500 shadow-sm border border-transparent hover:border-black/5">
                                    <Linkedin size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-xl bg-[#F5F5F7] hover:bg-black hover:text-white flex items-center justify-center transition-all duration-500 shadow-sm border border-transparent hover:border-black/5">
                                    <Instagram size={18} />
                                </a>
                            </div>
                        </div>

                        <div className="p-5 bg-[#F5F5F7] rounded-3xl space-y-3 border border-[#F5F5F7]">
                            <div className="flex items-center gap-2 text-black font-black text-[10px] uppercase tracking-widest">
                                <Globe size={14} /> English (US)
                            </div>
                            <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                                <ShieldCheck size={14} /> System Secure
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-32 pt-12 border-t border-[#F5F5F7] flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-[#86868B] text-[10px] font-black uppercase tracking-[0.2em]">
                        <span>© {currentYear} ServiceMate. Patent Pending.</span>
                        <div className="hidden md:block w-1 h-1 bg-[#D2D2D7] rounded-full" />
                        <span>Designed in California. Made for Professionals.</span>
                    </div>
                    <div className="flex gap-10 text-[#86868B] text-[10px] font-black uppercase tracking-widest">
                        <Link to="/privacy" className="hover:text-black transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-black transition-colors">Terms</Link>
                        <Link to="/sitemap" className="hover:text-black transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
