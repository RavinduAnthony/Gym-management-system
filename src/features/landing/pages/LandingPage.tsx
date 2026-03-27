// src/features/landing/pages/LandingPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { PublicNavbar } from '../components/PublicNavbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Button } from '@/components/ui/Button';
import { Check, Zap, Shield, Crown, ArrowRight, Instagram, Twitter, Facebook, Mail } from 'lucide-react';

export const LandingPage = () => {
    return (
        <div className="relative bg-black selection:bg-[var(--primary)] selection:text-white">
            <PublicNavbar />
            <main>
                <Hero />
                <Features />

                {/* Pricing Section */}
                <section id="pricing" className="py-32 px-6 relative overflow-hidden bg-[var(--background)]">
                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--primary)]/5 rounded-full blur-[120px] -z-10" />

                    <div className="max-w-7xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-20"
                        >
                            <h2 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter mb-6">
                                INVEST IN YOUR <span className="text-[var(--primary)]">EMPIRE</span>
                            </h2>
                            <p className="text-[var(--text-secondary)] text-xl max-w-2xl mx-auto font-medium">
                                No hidden fees. No complicated tiers. Just pure power to fuel your facility's legacy.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                            <PricingCard
                                title="Starter"
                                price="49"
                                icon={<Shield className="w-8 h-8" />}
                                description="Perfect for boutique studios and newcomers."
                                features={["Up to 100 Elite Members", "Basic Facility Analytics", "Standard Check-in Flow", "Automated Billing"]}
                            />
                            <PricingCard
                                title="Professional"
                                price="99"
                                icon={<Zap className="w-8 h-8" />}
                                description="The engine for growing fitness hubs."
                                features={["Up to 500 Elite Members", "Advanced ROI Analytics", "Coaching Staff Portals", "Class Schedule Engine", "Priority SMS Alerts"]}
                                featured={true}
                            />
                            <PricingCard
                                title="Elite"
                                price="199"
                                icon={<Crown className="w-8 h-8" />}
                                description="Unlimited scale for gym empires."
                                features={["Unlimited Athlete Access", "Full White-label Branding", "Custom API Integrations", "Multi-hub Management", "Dedicated Success Manager"]}
                            />
                        </div>
                    </div>
                </section>

                {/* Final CTA Banner */}
                <section className="py-32 bg-[var(--surface)] text-center relative overflow-hidden border-y border-white/5">
                    <div className="absolute inset-0 bg-black/40" />
                    
                    {/* Background gym image with parallax feel */}
                    <div className="absolute inset-0 z-0 opacity-20">
                         <img src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop" alt="Gym Motivation" className="w-full h-full object-cover" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6">
                        <motion.h2 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="text-6xl md:text-8xl font-display font-black text-white mb-10 leading-none tracking-tighter uppercase"
                        >
                            STOP TRACKING. <br />
                            <span className="text-[var(--primary)]">START DOMINATING.</span>
                        </motion.h2>
                        <p className="text-white/60 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed italic border-x border-[var(--primary)]/30 px-6">
                            "Champions keep playing until they get it right." 
                            Join 1,000+ facilities globally today.
                        </p>
                        <Button size="lg" className="px-16 h-20 text-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">
                            Ignite My Empire <ArrowRight className="ml-2 w-8 h-8" />
                        </Button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-24 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
                        <div className="max-w-sm">
                            <div className="font-display font-black text-4xl mb-6 tracking-tighter uppercase text-white">
                                IRON<span className="text-[var(--primary)]">CORE</span>
                            </div>
                            <p className="text-[var(--text-secondary)] text-lg leading-relaxed font-semibold pr-10">
                                The world's most powerful gym management engine for high-performance facilities. Built for strength, engineered for dominance.
                            </p>
                            <div className="flex gap-4 mt-8">
                                <SocialIcon icon={<Instagram />} />
                                <SocialIcon icon={<Twitter />} />
                                <SocialIcon icon={<Facebook />} />
                                <SocialIcon icon={<Mail />} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-16 md:gap-24">
                            <div className="space-y-6">
                                <h4 className="font-display font-black uppercase tracking-[0.2em] text-sm text-[var(--primary)]">Product</h4>
                                <ul className="space-y-4 text-base text-[var(--text-secondary)] font-bold">
                                    <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                    <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="font-display font-black uppercase tracking-[0.2em] text-sm text-[var(--primary)]">Company</h4>
                                <ul className="space-y-4 text-base text-[var(--text-secondary)] font-bold">
                                    <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Legal Vault</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Contact Hub</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-xs text-[var(--text-tertiary)] font-black uppercase tracking-[0.4em]">
                            © 2026 IRONCORE TECHNOLOGIES. DEPLOYED FOR GLOBAL DOMINANCE.
                        </div>
                        <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-white transition-colors">
                            <a href="#">Privacy Protocol</a>
                            <a href="#">Terms of Engagement</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const PricingCard = ({ title, price, description, icon, features, featured = false }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`p-10 rounded-[40px] border transition-all duration-500 flex flex-col h-full bg-[var(--surface)] ${
            featured 
            ? 'border-[var(--primary)] shadow-[0_40px_80px_-16px_rgba(255,107,43,0.2)] ring-1 ring-[var(--primary)]/30 relative z-10 scale-105' 
            : 'border-white/5 shadow-2xl'
        }`}
    >
        {featured && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-[11px] font-black py-2.5 px-8 rounded-full uppercase tracking-[0.3em] shadow-2xl shadow-orange-950/40">
                Most Powerful
            </div>
        )}
        
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-10 text-3xl transition-transform duration-500 hover:rotate-12 ${featured ? 'bg-[var(--primary)] text-white shadow-xl' : 'bg-[var(--surface-alt)] text-[var(--primary)]'}`}>
            {icon}
        </div>

        <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-4">
            {title}
        </h3>
        
        <p className="text-[var(--text-secondary)] text-base mb-10 font-bold leading-relaxed min-h-[50px]">
            {description}
        </p>

        <div className="flex items-baseline gap-1 mb-12">
            <span className="text-lg font-black text-[var(--primary)]">$</span>
            <span className="text-7xl font-display font-black text-white">{price}</span>
            <span className="text-sm font-black text-[var(--text-tertiary)] ml-2 uppercase tracking-widest text-vertical">/ Month</span>
        </div>

        <ul className="space-y-5 mb-14 flex-1">
            {features.map((f: string) => (
                <li key={f} className="flex items-start gap-4 text-base font-bold text-[var(--text-secondary)]">
                    <Check className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                    <span>{f}</span>
                </li>
            ))}
        </ul>

        <Button 
            className={`w-full h-16 text-xl font-black uppercase tracking-[0.2em] ${featured ? 'shadow-2xl shadow-orange-950/20' : ''}`}
            variant={featured ? 'primary' : 'secondary'}
        >
            Deploy Now
        </Button>
    </motion.div>
);

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
    <a href="#" className="w-10 h-10 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--primary)] hover:text-white transition-all duration-300">
        {React.cloneElement(icon as React.ReactElement, { size: 20 } as any)}
    </a>
);


