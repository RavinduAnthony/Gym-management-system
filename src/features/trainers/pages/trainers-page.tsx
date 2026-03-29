// src/features/trainers/pages/trainers-page.tsx
import { useState } from 'react';
import { Plus, UserCheck, Award, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { trainersApi } from '../api/trainers-api';
import { TrainersTable } from '../components/trainers-table';
import { TrainerFormDialog } from '../components/trainer-form-dialog';
import { TrainerScheduleDialog } from '../components/trainer-schedule-dialog';
import { TrainerDetailsDialog } from '../components/trainer-details-dialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCounter } from '@/components/ui/StatCounter';
import type { Trainer } from '../types';
import { motion } from 'framer-motion';

export function TrainersPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

    const handleCreateNew = () => {
        setSelectedTrainer(null);
        setIsFormOpen(true);
    };

    const handleEdit = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setIsFormOpen(true);
    };

    const handleSchedule = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setIsScheduleOpen(true);
    };

    const handleRowClick = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setIsDetailsOpen(true);
    };

    const { data: trainers } = useQuery({
        queryKey: ['trainers'],
        queryFn: trainersApi.getTrainers,
    });

    const totalTrainers = trainers?.length ?? 0;
    const totalCertifications = trainers?.reduce((sum, t) => sum + (t.certifications?.length ?? 0), 0) ?? 0;
    const activeTrainers = trainers?.filter(t => t.status === 'Active').length ?? 0;

    const stats = [
        { label: 'Total Trainers', value: totalTrainers, icon: <UserCheck className="w-5 h-5" />, color: 'var(--primary)', suffix: '' },
        { label: 'Certifications', value: totalCertifications, icon: <Award className="w-5 h-5" />, color: 'var(--success)', suffix: '' },
        { label: 'Active', value: activeTrainers, icon: <ShieldCheck className="w-5 h-5" />, color: 'var(--info)', suffix: '' },
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
                        COACHING <span className="text-[var(--primary)]">COMMAND</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-3 font-bold italic border-l-2 border-[var(--primary)] pl-4">
                        Manage your elite staff and performance logistics.
                    </p>
                </motion.div>

                <Button onClick={handleCreateNew} size="md" className="gap-2 shadow-2xl shadow-orange-900/20 px-10 h-14">
                    <Plus className="w-5 h-5" /> REGISTER TRAINER
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-8 flex items-center gap-6 bg-[var(--surface)] border-white/5 relative overflow-hidden group" hover={true}>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: stat.color, boxShadow: `0 8px 16px -4px ${stat.color}44` }}>
                                {stat.icon}
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] mb-1">{stat.label}</p>
                                <div className="text-3xl font-display font-black text-[var(--text-primary)]">
                                    <StatCounter value={stat.value} suffix={stat.suffix} />
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-[0.03] scale-150 rotate-12 transition-transform group-hover:scale-[1.8] duration-700">
                                {stat.icon}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Trainers Table */}
            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="p-0 overflow-hidden border-white/5 bg-[var(--surface)] shadow-2xl" hover={false}>
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <h3 className="font-display font-black text-lg uppercase tracking-widest text-white/50">Active Registry</h3>
                    </div>
                    <TrainersTable onEdit={handleEdit} onViewSchedule={handleSchedule} onRowClick={handleRowClick} />
                </Card>
            </motion.div>

            <TrainerFormDialog
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                initialData={selectedTrainer}
            />

            <TrainerScheduleDialog
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                trainer={selectedTrainer}
            />

            <TrainerDetailsDialog
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                trainer={selectedTrainer}
            />
        </div>
    );
}


