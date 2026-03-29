// src/features/memberships/pages/memberships-page.tsx
import { useState } from 'react';
import { Plus, Package, Rocket, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { MembershipsTable } from '../components/memberships-table';
import { MembershipFormDialog } from '../components/membership-form-dialog';
import { PackageDetailsDialog } from '../components/package-details-dialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCounter } from '@/components/ui/StatCounter';
import type { MembershipPackage } from '../types';
import { membershipsApi } from '../api/memberships-api';
import { motion } from 'framer-motion';

export function MembershipsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<MembershipPackage | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<MembershipPackage | null>(null);

    const { data: packages } = useQuery({
        queryKey: ['memberships'],
        queryFn: membershipsApi.getPackages,
    });

    const handleEdit = (pkg: MembershipPackage) => {
        setEditingPackage(pkg);
        setIsDialogOpen(true);
    };

    const handleRowClick = (pkg: MembershipPackage) => {
        setSelectedPackage(pkg);
        setIsDetailsOpen(true);
    };

    const handleClose = () => {
        setIsDialogOpen(false);
        setEditingPackage(null);
    };

    const totalPackages = packages?.length ?? 0;
    const activePackages = packages?.filter(p => p.status === 'Active').length ?? 0;
    const inactivePackages = packages?.filter(p => p.status !== 'Active').length ?? 0;

    const stats = [
        { label: 'Total Packages', value: totalPackages, icon: <Package className="w-5 h-5" />, color: 'var(--primary)' },
        { label: 'Active Plans', value: activePackages, icon: <Rocket className="w-5 h-5" />, color: 'var(--success)' },
        { label: 'Inactive Tiers', value: inactivePackages, icon: <Zap className="w-5 h-5" />, color: 'var(--warning)' },
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
                        STRATEGIC <span className="text-[var(--primary)]">TIERS</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-3 font-bold italic border-l-2 border-[var(--primary)] pl-4">
                        Engineered value-plans to fuel your facility's economic engine.
                    </p>
                </motion.div>
                
                <Button onClick={() => setIsDialogOpen(true)} size="md" className="gap-2 shadow-2xl shadow-orange-900/20 px-10 h-14">
                    <Plus className="w-5 h-5" /> DESIGN NEW PACKAGE
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-8 flex items-center gap-6 bg-[var(--surface)] border-white/5 relative overflow-hidden group shadow-2xl" hover={true}>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: stat.color, boxShadow: `0 8px 16px -4px ${stat.color}44` }}>
                                {stat.icon}
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] mb-1">{stat.label}</p>
                                <div className="text-3xl font-display font-black text-[var(--text-primary)]">
                                    <StatCounter value={stat.value} />
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-[0.03] scale-150 rotate-12 transition-transform group-hover:scale-[1.8] duration-700">
                                {stat.icon}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Packages Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="p-0 overflow-hidden border-white/5 bg-[var(--surface)] shadow-2xl" hover={false}>
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                         <h3 className="font-display font-black text-lg uppercase tracking-widest text-white/50">Tactical Package Roster</h3>
                    </div>
                    <MembershipsTable onEdit={handleEdit} onRowClick={handleRowClick} />
                </Card>
            </motion.div>

            {isDialogOpen && (
                <MembershipFormDialog
                    isOpen={isDialogOpen}
                    onClose={handleClose}
                    initialData={editingPackage}
                />
            )}

            <PackageDetailsDialog
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                pkg={selectedPackage}
            />
        </div>
    );
}


