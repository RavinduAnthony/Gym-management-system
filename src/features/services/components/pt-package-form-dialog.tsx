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

interface PtPackageFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: PtPackage | null;
}

export function PtPackageFormDialog({ isOpen, onClose, initialData }: PtPackageFormDialogProps) {
    const queryClient = useQueryClient();
    const isEditing = !!initialData?.id;

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PtPackageFormData>({
        resolver: zodResolver(ptPackageSchema),
        defaultValues: { status: 'Active', sessions: 12, durationMinutes: 60, validityDays: 90, defaultAmount: 0 },
    });

    useEffect(() => {
        if (isOpen) {
            reset(initialData
                ? { ...initialData }
                : { status: 'Active', sessions: 12, durationMinutes: 60, validityDays: 90, defaultAmount: 0, name: '' }
            );
        }
    }, [isOpen, initialData, reset]);

    const mutation = useMutation({
        mutationFn: (data: PtPackageFormData) =>
            isEditing && initialData?.id
                ? ptPackagesApi.update(initialData.id, data)
                : ptPackagesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ptPackages'] });
            toast.success(isEditing ? 'Package updated successfully' : 'Package registered successfully');
            onClose();
        },
        onError: () => toast.error('Failed to save package'),
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
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
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
                                        {isEditing ? 'Edit Package' : 'Register New Package'}
                                    </h2>
                                    <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Personal trainer service package</p>
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
                        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className={labelCls}>Package Name *</label>
                                    <input {...register('name')} placeholder="e.g. Starter Pack, Elite 24-Session" className={inputCls} />
                                    {errors.name && <p className={errorCls}>{errors.name.message}</p>}
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className={labelCls}>Description</label>
                                    <input {...register('description')} placeholder="Brief description of the package" className={inputCls} />
                                </div>

                                {/* Sessions */}
                                <div>
                                    <label className={labelCls}>Number of Sessions *</label>
                                    <input type="number" min={1} {...register('sessions', { valueAsNumber: true })} placeholder="12" className={inputCls} />
                                    {errors.sessions && <p className={errorCls}>{errors.sessions.message}</p>}
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className={labelCls}>Session Duration (minutes) *</label>
                                    <input type="number" min={1} {...register('durationMinutes', { valueAsNumber: true })} placeholder="60" className={inputCls} />
                                    {errors.durationMinutes && <p className={errorCls}>{errors.durationMinutes.message}</p>}
                                </div>

                                {/* Validity */}
                                <div>
                                    <label className={labelCls}>Validity (days) *</label>
                                    <input type="number" min={1} {...register('validityDays', { valueAsNumber: true })} placeholder="90" className={inputCls} />
                                    {errors.validityDays && <p className={errorCls}>{errors.validityDays.message}</p>}
                                </div>

                                {/* Default Amount */}
                                <div>
                                    <label className={labelCls}>Default Amount (LKR) *</label>
                                    <div className="flex">
                                        <span className="h-11 px-3 flex items-center bg-[var(--surface-alt)] border border-r-0 border-[var(--border)] rounded-l-xl text-xs font-black text-[var(--text-secondary)]">LKR</span>
                                        <input
                                            type="number" min={0} step={0.01}
                                            {...register('defaultAmount', { valueAsNumber: true })}
                                            placeholder="0.00"
                                            className={`${inputCls} rounded-l-none`}
                                        />
                                    </div>
                                    {errors.defaultAmount && <p className={errorCls}>{errors.defaultAmount.message}</p>}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className={labelCls}>Status</label>
                                    <select {...register('status')} className={`${inputCls} cursor-pointer`}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
                                <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                                <Button variant="primary" type="submit" disabled={mutation.isPending} className="px-8">
                                    {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Package'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
