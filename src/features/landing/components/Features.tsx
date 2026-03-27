// src/features/landing/components/Features.tsx
import { motion } from 'framer-motion';
import { Target, Zap, Shield, TrendingUp, Activity, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const FEATURES = [
    {
        icon: <Activity className="w-8 h-8" />,
        title: "Tactical Execution",
        description: "Scale your membership operations with industrial precision. Automated billing and tactical athlete tracking."
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: "Core Analytics",
        description: "Real-time visibility into your facility's heartbeat. Track every rep, every churn, and every profit margin."
    },
    {
        icon: <Shield className="w-8 h-8" />,
        title: "Secure Infrastructure",
        description: "Unbreakable protection for athlete data. Built on a production-grade core for total reliability."
    },
    {
        icon: <Layers className="w-8 h-8" />,
        title: "Package Architect",
        description: "Design elite training memberships and coaching tiers with automated scheduling and delivery."
    },
    {
        icon: <TrendingUp className="w-8 h-8" />,
        title: "Revenue Velocity",
        description: "Maximize facility profit with intelligent automated renewals and high-conversion point-of-sale."
    },
    {
        icon: <Target className="w-8 h-8" />,
        title: "Premium SaaS UI",
        description: "A professional, deep navy aesthetic that commands authority and delivers an elite user experience."
    }
];

export const Features = () => {
    return (
        <section id="features" className="py-32 px-8 relative overflow-hidden bg-[var(--background)]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center mb-28">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="h-1 w-20 bg-[var(--primary)] mb-8 mx-auto" />
                        <h2 className="text-5xl md:text-7xl font-display font-black text-white mb-8 uppercase tracking-tighter">
                            ELITE <span className="text-[var(--primary)] font-black italic">PERFORMANCE</span>
                        </h2>
                        <p className="text-[var(--text-secondary)] text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                            Stop using basic tools for an elite business. IronCore is the premium 
                            command center for modern fitness empires.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {FEATURES.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                        >
                            <Card className="h-full border-[var(--border)] bg-[var(--surface-alt)]/40 hover:bg-[var(--surface-alt)]/60 p-12 group transition-all duration-300 premium-card">
                                <div className="mb-10 text-[var(--primary)] group-hover:scale-110 transition-transform duration-500">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-display font-black text-white mb-6 uppercase tracking-tighter group-hover:text-[var(--primary)] transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed font-bold text-sm tracking-tight">
                                    {feature.description}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
