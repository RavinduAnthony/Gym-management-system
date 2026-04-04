import { useState } from 'react';
import { Plus, CalendarRange, Users, Activity, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gymClassesApi } from '../api/class-services-api';
import { GymClassesTable } from '../components/class-services-table';
import { GymClassFormDialog } from '../components/class-service-form-dialog';
import { GymClassDetailsDialog } from '../components/gym-class-details-dialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCounter } from '@/components/ui/StatCounter';
import type { GymClass } from '../schemas/class-service-schema';

export function ClassesPage() {
    const navigate = useNavigate();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
    const [viewClass, setViewClass] = useState<GymClass | null>(null);

    const { data: classes = [] } = useQuery({
        queryKey: ['gymClasses'],
        queryFn: gymClassesApi.getAll,
    });

    const handleCreateNew = () => { setSelectedClass(null); setIsFormOpen(true); };
    const handleEdit = (item: GymClass) => { setSelectedClass(item); setIsFormOpen(true); };
    const handleView = (item: GymClass) => { setViewClass(item); };

    const totalClasses = classes.length;
    const activeClasses = classes.filter((c: GymClass) => c.status === 'Active').length;
    const totalCapacity = classes.reduce((sum: number, c: GymClass) => sum + (c.maxCapacity ?? 0), 0);

    const stats = [
        { label: 'Total Classes', value: totalClasses, icon: <CalendarRange className="w-5 h-5" />, color: 'var(--primary)' },
        { label: 'Active', value: activeClasses, icon: <Activity className="w-5 h-5" />, color: 'var(--success)' },
        { label: 'Total Capacity', value: totalCapacity, icon: <Users className="w-5 h-5" />, color: 'var(--info)' },
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
                        CLASS <span className="text-[var(--primary)]">REGISTRY</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-3 font-bold italic border-l-2 border-[var(--primary)] pl-4">
                        Manage group fitness classes and scheduled sessions.
                    </p>
                </motion.div>

                <Button onClick={handleCreateNew} size="md" className="gap-2 shadow-2xl shadow-orange-900/20 px-10 h-14">
                    <Plus className="w-5 h-5" /> REGISTER CLASS
                </Button>
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
                                    <StatCounter value={stat.value} />
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
                        <h3 className="font-display font-black text-lg uppercase tracking-widest text-white/50">Active Registry</h3>
                    </div>
                    <GymClassesTable onEdit={handleEdit} onView={handleView} />
                </Card>
            </motion.div>

            <GymClassFormDialog
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                initialData={selectedClass}
            />
            <GymClassDetailsDialog
                isOpen={!!viewClass}
                onClose={() => setViewClass(null)}
                gymClass={viewClass}
            />
        </div>
    );
}
