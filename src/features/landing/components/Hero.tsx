// src/features/landing/components/Hero.tsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Typewriter } from '@/components/ui/Typewriter';
import { StatCounter } from '@/components/ui/StatCounter';

export const Hero = () => {
    return (
        <section className="relative min-h-[95vh] flex items-center pt-24 overflow-hidden bg-[var(--background)]">
            {/* High-Impact Background */}
            <div className="absolute inset-0 z-0 text-[var(--background)]">
                <img 
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
                    alt="IronCore Premium Gym" 
                    className="w-full h-full object-cover opacity-30 grayscale transition-all duration-700 hover:grayscale-0 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/90 to-transparent z-10" />
            </div>

            <div className="container relative z-20 mx-auto px-8 md:px-12">
                <div className="max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="flex items-center gap-2 mb-6">
                             <div className="h-[2px] w-12 bg-[var(--primary)]" />
                             <span className="text-[var(--primary)] text-sm font-black uppercase tracking-[0.4em]">Elite Facility Management</span>
                        </div>
                        
                        <h1 className="text-7xl md:text-9xl font-display font-black text-white leading-[0.85] mb-10 uppercase tracking-tighter">
                            PREMIUM <br />
                            <span className="text-[var(--primary)]">
                                <Typewriter 
                                    phrases={["IRON.", "SWEAT.", "PRECISION.", "PURPOSE."]} 
                                    typingSpeed={70}
                                    deletingSpeed={30}
                                />
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-14 max-w-2xl font-medium leading-relaxed">
                            Welcome to the IronCore ecosystem. A production-grade management engine for 
                            high-performance facilities. Deep analytics, premium interface, and unbreakable reliability.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:px-12 h-16 shadow-2xl shadow-red-950/50 bg-[var(--primary)] group">
                                    START YOUR LEGACY <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button variant="ghost" size="lg" className="w-full sm:px-10 h-16 text-white border-white/10 hover:border-white/30 backdrop-blur-md group">
                                <Play className="mr-3 w-5 h-5 fill-[var(--primary)] text-[var(--primary)] group-hover:scale-125 transition-transform" /> THE CORE EXPERIENCE
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Tactical Stat Bar */}
            <div className="absolute bottom-12 right-0 left-0 md:left-auto md:right-12 z-20 md:w-auto flex flex-col gap-8 px-8 md:px-0">
                 <div className="grid grid-cols-2 md:grid-cols-1 gap-6 md:gap-8">
                     <StatItem value={24} suffix="/7" label="Tactical Support" icon={<Shield className="w-4 h-4" />} />
                     <StatItem value={500} suffix="+" label="High-Performance Athletes" icon={<Zap className="w-4 h-4" />} />
                 </div>
            </div>
        </section>
    );
};

const StatItem = ({ value, suffix, label, icon }: any) => (
    <motion.div 
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-6 group"
    >
        <div className="flex flex-col items-end">
            <div className="text-4xl font-display font-black text-white group-hover:text-[var(--primary)] transition-colors">
                <StatCounter value={value} suffix={suffix} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mt-1">
                {label}
            </div>
        </div>
        <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--primary)] group-hover:border-[var(--primary)]/50 transition-all">
            {icon}
        </div>
    </motion.div>
);
