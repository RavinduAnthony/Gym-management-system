// src/features/settings/pages/settings-page.tsx
import { useState } from 'react';
import { Building2, Users, Shield, CreditCard, Clock, Dumbbell, Layers, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GymProfileSettings } from '../components/GymProfileSettings';
import { UsersRolesSettings } from '../components/UsersRolesSettings';
import { MembershipRulesSettings } from '../components/MembershipRulesSettings';
import { PaymentSettings } from '../components/PaymentSettings';
import { WorkingHoursSettings } from '../components/WorkingHoursSettings';
import { TrainerTypeSettings } from '../components/TrainerTypeSettings';
import { ServiceSettings } from '../components/ServiceSettings';

const TABS = [
    { id: 'gym-profile', label: 'Gym Profile', icon: Building2 },
    { id: 'users-roles', label: 'Users & Roles', icon: Users },
    { id: 'membership-rules', label: 'Membership Rules', icon: Shield },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'working-hours', label: 'Working Hours', icon: Clock },
    { id: 'trainer-settings', label: 'Trainer Settings', icon: Dumbbell },
    { id: 'service-settings', label: 'Service Settings', icon: Layers },
];

const TAB_CONTENT: Record<string, React.ReactNode> = {
    'gym-profile': <GymProfileSettings />,
    'users-roles': <UsersRolesSettings />,
    'membership-rules': <MembershipRulesSettings />,
    'payments': <PaymentSettings />,
    'working-hours': <WorkingHoursSettings />,
    'trainer-settings': <TrainerTypeSettings />,
    'service-settings': <ServiceSettings />,
};

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState('gym-profile');

    return (
        <div className="py-8 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                    <span className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.3em]">System Configuration</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none flex items-center gap-4">
                    <Settings className="w-10 h-10 text-[var(--text-tertiary)]" /> Settings
                </h1>
            </div>

            {/* Layout: Sidebar Tabs + Content */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings Sidebar */}
                <div className="lg:w-64 shrink-0">
                    <nav className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 lg:sticky lg:top-28 space-y-1">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200 relative
                                        ${isActive
                                            ? 'bg-[var(--surface-alt)] text-white border border-[var(--border-strong)] shadow-lg'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]/50 hover:text-white border border-transparent'
                                        }
                                    `}
                                >
                                    <tab.icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? 'text-[var(--primary)]' : ''}`} />
                                    {tab.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="settingsActiveTab"
                                            className="absolute left-0 w-1 h-5 bg-[var(--primary)] rounded-r-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                        >
                            {TAB_CONTENT[activeTab]}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
