// src/features/members/pages/members-list-page.tsx
import { useState } from 'react';
import { UserPlus, Filter, Download, UserX } from 'lucide-react';
import { MembersTable } from '../components/members-table';
import { MemberFormDialog } from '../components/member-form-dialog';
import { MemberDetailsDialog } from '../components/member-details-dialog';
import { Button } from '@/components/ui/Button';
import { Can, PERMISSIONS } from '@/core/permissions';
import { Card } from '@/components/ui/Card';
import { StatCounter } from '@/components/ui/StatCounter';
import type { Member } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members-api';

export function MembersListPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [showOffboarded, setShowOffboarded] = useState(false);

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

    const { data: members = [] } = useQuery({ queryKey: ['members'], queryFn: membersApi.getMembers });
    const { data: inactiveMembers = [] } = useQuery({ queryKey: ['members-inactive'], queryFn: membersApi.getInactiveMembers });

    const activeMembers = members.filter(m => m.status === 'Active').length;
    const pendingMembers = members.filter(m => m.status !== 'Active' && m.status !== 'Inactive').length;
    const offboardedCount = inactiveMembers.length;

    const stats = [
        { label: 'Active Roster', value: activeMembers, color: 'var(--success)', onClick: () => setShowOffboarded(false) },
        { label: 'Expiring Soon', value: 0, color: 'var(--warning)', onClick: undefined },
        { label: 'Pending Ops', value: pendingMembers, color: 'var(--info)', onClick: undefined },
        { label: 'Offboarded', value: offboardedCount, color: 'var(--text-tertiary)', onClick: () => setShowOffboarded(v => !v), isOffboarded: true },
    ] as const;

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
                    <Can permission={PERMISSIONS.MEMBERS_CREATE}>
                        <Button onClick={handleCreateNew} size="md" className="gap-2 shadow-2xl shadow-orange-900/20 px-10 h-14">
                            <UserPlus className="w-5 h-5" /> REGISTER ATHLETE
                        </Button>
                    </Can>
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
                       <Card
                           className={`p-8 flex flex-col items-center justify-center text-center border-white/5 bg-[var(--surface)] transition-all group ${stat.onClick ? 'cursor-pointer' : ''} ${showOffboarded && 'isOffboarded' in stat && stat.isOffboarded ? 'border-[var(--primary)]/30 bg-[var(--primary)]/5' : 'hover:border-[var(--primary)]/20'}`}
                           hover={!!stat.onClick}
                           onClick={stat.onClick}
                       >
                           <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--text-tertiary)] mb-3 group-hover:text-[var(--primary)] transition-colors">{stat.label}</span>
                           <div className="text-4xl font-display font-black" style={{ color: stat.color }}>
                               <StatCounter value={stat.value} />
                           </div>
                           {'isOffboarded' in stat && stat.isOffboarded && (
                               <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mt-2">
                                   {showOffboarded ? 'click to hide' : 'click to view'}
                               </span>
                           )}
                       </Card>
                   </motion.div>
               ))}
            </div>

            {/* Offboarded Members Section */}
            <AnimatePresence>
                {showOffboarded && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="p-0 overflow-hidden border-gray-500/20 bg-[var(--surface)] shadow-2xl" hover={false}>
                            <div className="p-6 border-b border-gray-500/10 bg-gray-500/5 flex items-center gap-3">
                                <UserX className="w-5 h-5 text-gray-400" />
                                <h3 className="font-display font-black text-lg uppercase tracking-widest text-gray-400">Offboarded Members</h3>
                                <span className="ml-auto text-[11px] font-black uppercase tracking-widest text-gray-500 bg-gray-500/10 border border-gray-500/20 rounded-full px-3 py-1">
                                    {offboardedCount} member{offboardedCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <MembersTable
                                onEdit={handleEdit}
                                onRowClick={handleManageProfile}
                                mode="inactive"
                            />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Members Table Section */}
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
                        onRowClick={handleManageProfile}
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

