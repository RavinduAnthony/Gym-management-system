// src/features/members/pages/members-list-page.tsx
import { useState } from 'react';
import { UserPlus, Filter, Download } from 'lucide-react';
import { MembersTable } from '../components/members-table';
import { MemberFormDialog } from '../components/member-form-dialog';
import { MemberDetailsDialog } from '../components/member-details-dialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCounter } from '@/components/ui/StatCounter';
import type { Member } from '../types';
import { motion } from 'framer-motion';

export function MembersListPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const handleCreateNew = () => {
        setSelectedMember(null);
        setIsFormOpen(true);
    };

    const handleEdit = (member: Member) => {
        setSelectedMember(member);
        setIsFormOpen(true);
    };

    const handleManageProfile = (member: Member) => {
        setSelectedMember(member);
        setIsDetailsOpen(true);
    };

    const stats = [
        { label: 'Active Roster', value: 186, color: 'var(--success)' },
        { label: 'Expiring Soon', value: 14, color: 'var(--warning)' },
        { label: 'Pending Ops', value: 8, color: 'var(--info)' },
        { label: 'Offboarded', value: 40, color: 'var(--text-tertiary)' },
    ];

    return (
        <div className="space-y-10 py-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-display font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">
                        ATHLETE <span className="text-[var(--primary)]">REGISTRY</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-3 font-bold italic border-l-2 border-[var(--primary)] pl-4">
                        Monitor and manage your facility's heartbeat. High-performance athlete tracking.
                    </p>
                </motion.div>
                
                <div className="flex flex-wrap gap-4">
                    <Button variant="secondary" size="md" className="gap-2 h-14 px-6 border-white/5 bg-white/[0.02]">
                        <Filter className="w-5 h-5" /> FILTERS
                    </Button>
                    <Button variant="ghost" size="md" className="gap-2 h-14 px-6 border-white/10 text-white/50">
                        <Download className="w-5 h-5" /> EXPORT
                    </Button>
                    <Button onClick={handleCreateNew} size="md" className="gap-2 shadow-2xl shadow-orange-900/20 px-10 h-14">
                        <UserPlus className="w-5 h-5" /> REGISTER ATHLETE
                    </Button>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {stats.map((stat, i) => (
                   <motion.div
                       key={i}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: i * 0.05 }}
                   >
                       <Card className="p-8 flex flex-col items-center justify-center text-center border-white/5 bg-[var(--surface)] hover:border-[var(--primary)]/20 transition-all group" hover={true}>
                           <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-tertiary)] mb-3 group-hover:text-[var(--primary)] transition-colors">{stat.label}</span>
                           <div className="text-4xl font-display font-black" style={{ color: stat.color }}>
                               <StatCounter value={stat.value} />
                           </div>
                       </Card>
                   </motion.div>
               ))}
            </div>

            {/* Table Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="p-0 overflow-hidden border-white/5 bg-[var(--surface)] shadow-2xl" hover={false}>
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                         <h3 className="font-display font-black text-lg uppercase tracking-widest text-white/50">Member Database</h3>
                    </div>
                    <MembersTable
                        onEdit={handleEdit}
                        onManageProfile={handleManageProfile}
                    />
                </Card>
            </motion.div>

            <MemberFormDialog
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                initialData={selectedMember}
            />

            <MemberDetailsDialog
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                member={selectedMember}
            />
        </div>
    );
}

