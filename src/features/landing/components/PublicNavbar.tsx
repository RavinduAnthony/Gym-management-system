// src/features/landing/components/PublicNavbar.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IronCoreLogo } from '@/components/branding/IronCoreLogo';
import { Button } from '@/components/ui/Button';

export const PublicNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Schedule', href: '#schedule' },
        { name: 'Trainers', href: '#trainers' },
        { name: 'Pricing', href: '#pricing' },
    ];

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'h-20 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl' : 'h-24 bg-transparent'}`}>
            <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
                <Link to="/" className="hover:scale-105 transition-transform duration-300">
                    <IronCoreLogo />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-12">
                    {navLinks.map((link) => (
                        <a 
                            key={link.name} 
                            href={link.href} 
                            className="text-[13px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[var(--primary)] transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}
                    <div className="flex items-center gap-4 ml-4">
                        <Link to="/login">
                            <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] hover:text-[var(--primary)] cursor-pointer pr-5 border-r border-[var(--border)]">
                                Login
                            </span>
                        </Link>
                        <Link to="/register">
                            <Button size="sm" className="px-8 h-12 shadow-2xl shadow-red-950/40 bg-[var(--primary)] hover:bg-[var(--primary-dark)]">
                                JOIN NOW <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button 
                    className="md:hidden text-[var(--text-primary)] p-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)]"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col p-10"
                    >
                        <div className="flex justify-between items-center mb-16">
                            <IronCoreLogo />
                            <button onClick={() => setMobileMenuOpen(false)} className="p-4 bg-[var(--surface-alt)] border border-[var(--border)] rounded-full">
                                <X className="w-8 h-8 text-[var(--primary)]" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-10">
                            {navLinks.map((link, i) => (
                                <motion.a 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={link.name} 
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-4xl font-display font-black uppercase text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
                                >
                                    {link.name}
                                </motion.a>
                            ))}
                            <div className="mt-16 flex flex-col gap-6">
                                <Link to="/login" className="w-full">
                                    <Button variant="secondary" className="w-full py-6 text-xl font-black border-2 bg-transparent border-[var(--border)]" onClick={() => setMobileMenuOpen(false)}>
                                        ATHLETE LOGIN
                                    </Button>
                                </Link>
                                <Link to="/register" className="w-full">
                                    <Button className="w-full py-6 text-xl font-black shadow-2xl shadow-red-950/40 bg-[var(--primary)]" onClick={() => setMobileMenuOpen(false)}>
                                        START TRAINING
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
