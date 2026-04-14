import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ptPackageSchema, type PtPackageFormData, type PtPackage } from '../schemas/pt-package-schema';
import { ptPackagesApi } from '../api/pt-packages-api';
import { Button } from '@/components/ui/Button';
import { useTrainers } from '@/hooks/useTrainers';
import { useServiceSettings } from '@/hooks/useServiceSettings';

interface PtPackageFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: PtPackage | null;
}

export function PtPackageFormDialog({ isOpen, onClose, initialData }: PtPackageFormDialogProps) {
    const queryClient = useQueryClient();
    const isEditing = !!initialData?.id;

    const { data: trainers = [], isLoading: trainersLoading } = useTrainers();
    const { data: serviceSettings } = useServiceSettings();
    const ptDefaultRate = serviceSettings?.find(s => s.serviceType === 'PersonalTrainers')?.defaultAmount ?? 0;

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PtPackageFormData>({
        resolver: zodResolver(ptPackageSchema),
        defaultValues: { status: 'Active', studentCount: 0, paymentRatePerStudent: ptDefaultRate, trainerId: '' },
    });

    useEffect(() => {
        if (isOpen) {
            reset(initialData
                ? { ...initialData }
                : { status: 'Active', studentCount: 0, paymentRatePerStudent: ptDefaultRate, trainerId: '' }
            );
        }
    }, [isOpen, initialData, reset, ptDefaultRate]);

    // Auto-fill trainerName when trainerId changes
    const selectedTrainerId = watch('trainerId');
    useEffect(() => {
        const trainer = trainers.find(t => t.id === selectedTrainerId);
        if (trainer) setValue('trainerName', `${trainer.firstName} ${trainer.lastName}`);
    }, [selectedTrainerId, trainers, setValue]);

    const studentCount = watch('studentCount') ?? 0;
    const rate = watch('paymentRatePerStudent') ?? ptDefaultRate;
    const monthlyPayment = studentCount * rate;

    const mutation = useMutation({
        mutationFn: (data: PtPackageFormData) =>
            isEditing && initialData?.id
                ? ptPackagesApi.update(initialData.id, data)
                : ptPackagesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ptPackages'] });
            toast.success(isEditing ? 'Registration updated successfully' : 'Trainer registered successfully');
            onClose();
        },
        onError: () => toast.error('Failed to save registration'),
    });

    const labelCls = 'text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block';
    const inputCls = 'w-full h-11 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 text-sm text-white placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--primary)]/60 transition-colors';
    const errorCls = 'text-red-500 text-[10px] font-bold mt-1';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)] bg-[var(--surface-alt)]/40">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-[var(--primary)]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-white uppercase tracking-wider">
                                        {isEditing ? 'Edit Registration' : 'Register Personal Trainer'}
                                    </h2>
                                    <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Record trainer's student count &amp; monthly payment</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-8 space-y-5">

                            {/* Trainer Select */}
                            <div>
                                <label className={labelCls}>Personal Trainer *</label>
                                <select
                                    {...register('trainerId')}
                                    className={`${inputCls} cursor-pointer`}
                                    disabled={trainersLoading}
                                >
                                    <option value="">{trainersLoading ? 'Loading trainers...' : 'Select a trainer'}</option>
                                    {trainers.map(t => (
                                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                                    ))}
                                </select>
                                {errors.trainerId && <p className={errorCls}>{errors.trainerId.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                {/* Student Count */}
                                <div>
                                    <label className={labelCls}>Number of Students *</label>
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        {...register('studentCount', { valueAsNumber: true })}
                                        className={inputCls}
                                    />
                                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Students brought in per month</p>
                                    {errors.studentCount && <p className={errorCls}>{errors.studentCount.message}</p>}
                                </div>

                                {/* Rate Per Student */}
                                <div>
                                    <label className={labelCls}>Rate Per Student (LKR) *</label>
                                    <div className="flex">
                                        <span className="h-11 px-3 flex items-center bg-[var(--surface-alt)] border border-r-0 border-[var(--border)] rounded-l-xl text-xs font-black text-[var(--text-secondary)]">LKR</span>
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            placeholder={ptDefaultRate > 0 ? String(ptDefaultRate) : '0.00'}
                                            {...register('paymentRatePerStudent', { valueAsNumber: true })}
                                            className={`${inputCls} rounded-l-none`}
                                        />
                                    </div>
                                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Default: LKR {ptDefaultRate.toFixed(2)}</p>
                                    {errors.paymentRatePerStudent && <p className={errorCls}>{errors.paymentRatePerStudent.message}</p>}
                                </div>
                            </div>

                            {/* Calculated Monthly Payment */}
                            {studentCount > 0 && (
                                <div className="flex items-center justify-between px-5 py-4 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl">
                                    <div>
                                        <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-0.5">
                                            Calculated Monthly Payment
                                        </p>
                                        <p className="text-[10px] text-[var(--text-tertiary)]">
                                            {studentCount} student{studentCount !== 1 ? 's' : ''} × LKR {rate.toFixed(2)}
                                        </p>
                                    </div>
                                    <span className="text-2xl font-black text-[var(--primary)]">
                                        LKR {monthlyPayment.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}

                            {/* Status */}
                            <div>
                                <label className={labelCls}>Status</label>
                                <select {...register('status')} className={`${inputCls} cursor-pointer`}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
                                <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                                <Button variant="primary" type="submit" disabled={mutation.isPending} className="px-8">
                                    {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Trainer'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}