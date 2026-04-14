import { useState } from 'react';
import { Plus, Users, DollarSign, Activity, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ptPackagesApi } from '../api/pt-packages-api';
import { PtPackagesTable } from '../components/pt-packages-table';
import { PtPackageFormDialog } from '../components/pt-package-form-dialog';
import { Button } from '@/components/ui/Button';
import { Can, PERMISSIONS } from '@/core/permissions';
import { Card } from '@/components/ui/Card';
import { StatCounter } from '@/components/ui/StatCounter';
import type { PtPackage } from '../schemas/pt-package-schema';

export function PersonalTrainersServicePage() {
    const navigate = useNavigate();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<PtPackage | null>(null);

    const { data: packages = [] } = useQuery({
        queryKey: ['ptPackages'],
        queryFn: ptPackagesApi.getAll,
    });

    const handleCreateNew = () => { setSelectedPackage(null); setIsFormOpen(true); };
    const handleEdit = (item: PtPackage) => { setSelectedPackage(item); setIsFormOpen(true); };

    const totalPackages = packages.length;
    const activePackages = packages.filter(p => p.status === 'Active').length;
    const totalMonthlyPayment = packages
        .filter(p => p.status === 'Active')
        .reduce((sum, p) => sum + (p.studentCount ?? 0) * (p.paymentRatePerStudent ?? 0), 0);

    const stats = [
        { label: 'Total Trainers', value: totalPackages, prefix: '', suffix: '', icon: <Users className="w-5 h-5" />, color: 'var(--primary)' },
        { label: 'Active', value: activePackages, prefix: '', suffix: '', icon: <Activity className="w-5 h-5" />, color: 'var(--success)' },
        { label: 'Monthly Payout (LKR)', value: Math.round(totalMonthlyPayment), prefix: '', suffix: '', icon: <DollarSign className="w-5 h-5" />, color: 'var(--secondary)' },
    ];

    return (
        <div className="space-y-10 py-6">
            {/* Back navigation */}
            <button
                onClick={() => navigate('/services')}
                className="flex items-center gap-2 text-[var(--text-tertiary)] hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
            >
                <ChevronLeft className="w-4 h-4" /> Back to Services
            </button>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                        <span className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.3em]">Service Management</span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">
                        PERSONAL TRAINER <span className="text-[var(--primary)]">REGISTRATIONS</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-3 font-bold italic border-l-2 border-[var(--primary)] pl-4">
                        Track trainer student counts and calculate monthly payments.
                    </p>
                </motion.div>

                <Can permission={PERMISSIONS.SERVICES_MANAGE}>
                    <Button onClick={handleCreateNew} size="md" className="gap-2 shadow-2xl px-10 h-14">
                        <Plus className="w-5 h-5" /> REGISTER TRAINER
                    </Button>
                </Can>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="p-8 flex items-center gap-6 bg-[var(--surface)] border-white/5 relative overflow-hidden group" hover={true}>
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110 duration-300"
                                style={{ backgroundColor: stat.color, boxShadow: `0 8px 16px -4px ${stat.color}44` }}
                            >
                                {stat.icon}
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] mb-1">{stat.label}</p>
                                <div className="text-3xl font-display font-black text-[var(--text-primary)]">
                                    <StatCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Table */}
            <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                <Card className="p-0 overflow-hidden border-white/5 bg-[var(--surface)] shadow-2xl" hover={false}>
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <h3 className="font-display font-black text-lg uppercase tracking-widest text-white/50">Trainer Registry</h3>
                    </div>
                    <PtPackagesTable onEdit={handleEdit} />
                </Card>
            </motion.div>

            <PtPackageFormDialog
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                initialData={selectedPackage}
            />
        </div>
    );
}
