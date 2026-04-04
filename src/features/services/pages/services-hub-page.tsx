import { useNavigate } from 'react-router-dom';
import { CalendarRange, Users, ArrowRight, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const SERVICE_CARDS = [
    {
        key: 'classes',
        path: '/services/classes',
        title: 'Classes',
        subtitle: 'Group fitness & scheduled sessions',
        description: 'Manage group classes, schedules, capacity limits and registrations across your facility.',
        icon: CalendarRange,
        accentColor: 'var(--secondary)',
        shadowColor: '#f59e0b44',
        stats: [
            { label: 'Session Types' },
            { label: 'Scheduled' },
            { label: 'Active' },
        ],
    },
    {
        key: 'personal-trainers',
        path: '/services/personal-trainers',
        title: 'Personal Trainers',
        subtitle: 'One-on-one training packages',
        description: 'Set up personal training packages, durations, pricing and assign to trainers.',
        icon: Users,
        accentColor: 'var(--primary)',
        shadowColor: '#f97316aa',
        stats: [
            { label: 'Packages' },
            { label: 'Active' },
            { label: 'Sessions' },
        ],
    },
];

export function ServicesHubPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-10 py-6">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                    <span className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.3em]">Service Management</span>
                </div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-display font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none flex items-center gap-4">
                        <Layers className="w-9 h-9 text-[var(--text-tertiary)]" />
                        SERVICE <span className="text-[var(--primary)]">COMMAND</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-3 font-bold italic border-l-2 border-[var(--primary)] pl-4">
                        Select a service category to manage registrations and packages.
                    </p>
                </motion.div>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {SERVICE_CARDS.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.key}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12 }}
                            onClick={() => navigate(card.path)}
                            className="group relative cursor-pointer bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl"
                            style={{ boxShadow: `0 0 0 0 ${card.shadowColor}` }}
                            whileHover={{ y: -4 }}
                        >
                            {/* Background glow */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"
                                style={{ background: `radial-gradient(ellipse at top left, ${card.shadowColor} 0%, transparent 60%)` }}
                            />

                            {/* Icon */}
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl transition-transform group-hover:scale-110 duration-300 relative z-10"
                                style={{ backgroundColor: card.accentColor, boxShadow: `0 8px 20px -4px ${card.shadowColor}` }}
                            >
                                <Icon className="w-8 h-8" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <p
                                    className="text-[10px] font-black uppercase tracking-[0.3em] mb-1"
                                    style={{ color: card.accentColor }}
                                >
                                    {card.subtitle}
                                </p>
                                <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-4">
                                    {card.title}
                                </h2>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
                                    {card.description}
                                </p>

                                {/* CTA */}
                                <div
                                    className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest transition-all duration-300 group-hover:gap-5"
                                    style={{ color: card.accentColor }}
                                >
                                    Manage {card.title}
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
