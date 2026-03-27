// src/components/layout/header.tsx
import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, LogOut, Settings, Shield, Activity } from 'lucide-react';
import { useAuthStore } from '@/core/auth';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsProfileOpen(false);
        logout();
    };

    return (
        <header className="sticky top-0 z-30 h-20 border-b border-[var(--border)] bg-[var(--background)]/70 backdrop-blur-xl flex items-center justify-between px-8 transition-all duration-300">
            {/* Search Bar - Premium SaaS Aesthetic */}
            <div className="flex-1 max-w-lg">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] group-focus-within:text-[var(--primary)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for members, trainers, or records..."
                        className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 text-[12px] font-bold tracking-tight outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-tertiary)]/70 text-[var(--text-primary)]"
                    />
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 pr-6 border-r border-[var(--border)]">
                    <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)] transition-all group text-[var(--text-secondary)]">
                        <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--primary)] rounded-full border-2 border-[var(--background)] shadow-[0_0_10px_var(--primary)]" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] hover:border-[var(--secondary)]/40 hover:text-[var(--secondary)] transition-all text-[var(--text-secondary)]">
                        <Activity className="w-5 h-5" />
                    </button>
                </div>

                {/* User Profile - SaaS Command Center */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-4 pl-2 h-10 group outline-none"
                    >
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                                {user?.firstName || 'CORE_USER'}
                            </span>
                            <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider leading-none mt-1 opacity-80">
                                {user?.role || 'OWNER'}
                            </span>
                        </div>
                        <div className="relative">
                            <div className={`w-11 h-11 rounded-xl bg-[var(--surface-alt)] border flex items-center justify-center overflow-hidden transition-all cursor-pointer shadow-lg ${isProfileOpen ? 'border-[var(--primary)] shadow-[0_0_20px_var(--primary-light)]' : 'border-[var(--border)] group-hover:border-[var(--primary)]/50'}`}>
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className={`w-5 h-5 transition-colors ${isProfileOpen ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] group-hover:text-white'}`} />
                                )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--success)] rounded-full border-2 border-[var(--background)] shadow-lg" />
                        </div>
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 15 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 top-full w-80 bg-[var(--surface)] border border-[var(--border)] shadow-2xl rounded-2xl overflow-hidden z-50 p-3"
                            >
                                <div className="p-6 border-b border-[var(--border)] mb-3 bg-[var(--surface-alt)]/50 rounded-xl">
                                    <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-2">Authenticated Session</p>
                                    <p className="text-[13px] font-bold text-white truncate">{user?.email}</p>
                                </div>

                                <div className="space-y-1 font-bold text-[12px]">
                                    <button className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] hover:text-white transition-all">
                                        <div className="flex items-center gap-4">
                                            <Shield className="w-5 h-5 text-[var(--secondary)]" />
                                            <span>GYM CONFIGURATION</span>
                                        </div>
                                    </button>
                                    <button className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] hover:text-white transition-all">
                                        <div className="flex items-center gap-4">
                                            <Settings className="w-5 h-5 text-[var(--text-tertiary)]" />
                                            <span>INTERFACE PREFERENCES</span>
                                        </div>
                                    </button>
                                    <div className="my-3 h-[1px] bg-[var(--border)] mx-3" />
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-5 py-5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all group"
                                    >
                                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        <span>TERMINATE SESSION</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
