import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Calendar as CalendarIcon, Clock, MapPin, Trash2, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomDateInput } from '@/components/ui/CustomDateInput';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';

import { trainerScheduleSchema } from '../schemas/trainer-schema';
import { trainersApi } from '../api/trainers-api';
import type { Trainer, TrainerScheduleFormData } from '../types';
import { useBranches } from '@/hooks/useBranches';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    trainer: Trainer | null;
}

export function TrainerScheduleDialog({ isOpen, onClose, trainer }: Props) {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);

    // Fetch existing schedules for this trainer
    const { data: schedules, isLoading } = useQuery({
        queryKey: ['trainer-schedules', trainer?.id],
        queryFn: () => trainersApi.getSchedulesByTrainer(trainer!.id),
        enabled: !!trainer && isOpen,
    });
    
    const { data: branches, isLoading: branchesLoading } = useBranches();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<TrainerScheduleFormData>({
        resolver: zodResolver(trainerScheduleSchema) as any,
        defaultValues: {
            trainerId: trainer?.id || '',
            branchId: trainer?.branchId || '',
            date: new Date().toISOString().split('T')[0], // Today default
            startTime: '09:00',
            endTime: '10:00',
            sessionType: 'One-on-One',
        },
    });

    const createMutation = useMutation({
        mutationFn: trainersApi.createSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trainer-schedules', trainer?.id] });
            toast.success('Schedule block added');
            setIsCreating(false);
            reset();
        },
        onError: () => toast.error('Failed to add schedule block'),
    });

    const deleteMutation = useMutation({
        mutationFn: trainersApi.deleteSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trainer-schedules', trainer?.id] });
            toast.success('Schedule block removed');
        },
        onError: () => toast.error('Failed to remove block'),
    });

    const onSubmit = (data: TrainerScheduleFormData) => {
        // Enforce trainer ID in case form state lost it
        if (!trainer?.id) return;
        createMutation.mutate({ ...data, trainerId: trainer.id });
    };

    if (!isOpen || !trainer) return null;

    // Helper to format 24h to 12h
    const formatTime = (time: string) => {
        const [h, m] = time.split(':');
        let hours = parseInt(h);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // 0 -> 12
        return `${hours}:${m} ${ampm}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="bg-card w-full max-w-lg max-h-[90vh] rounded-2xl border border-border flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Schedule Management</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {trainer.firstName} {trainer.lastName} • {trainer.specialization}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Add New Block Toggle */}
                    {!isCreating ? (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full py-4 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center gap-2 text-primary hover:bg-primary/5 transition-colors font-medium"
                        >
                            <CalendarPlus className="w-5 h-5" />
                            Add Schedule Block
                        </button>
                    ) : (
                        <div className="bg-muted/30 border border-border rounded-xl p-5 relative">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <h3 className="font-semibold text-foreground mb-4">New Time Block</h3>

                            <form id="schedule-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Date *</label>
                                    <CustomDateInput
                                        {...register('date')}
                                        value={watch('date')}
                                    />
                                    {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Start Time *</label>
                                        <CustomTimeInput
                                            {...register('startTime')}
                                            value={watch('startTime')}
                                        />
                                        {errors.startTime && <p className="mt-1 text-xs text-destructive">{errors.startTime.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">End Time *</label>
                                        <CustomTimeInput
                                            {...register('endTime')}
                                            value={watch('endTime')}
                                        />
                                        {errors.endTime && <p className="mt-1 text-xs text-destructive">{errors.endTime.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Session Type</label>
                                        <CustomSelect
                                            {...register('sessionType')}
                                            value={watch('sessionType')}
                                            options={[
                                                { value: 'One-on-One', label: '1-on-1 PT' },
                                                { value: 'Group', label: 'Group Class' },
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Branch</label>
                                        <CustomSelect
                                            {...register('branchId')}
                                            value={watch('branchId')}
                                            placeholder={branchesLoading ? 'Loading branches...' : (branches?.length === 0 ? 'No branches available' : 'Select a branch')}
                                            disabled={branchesLoading}
                                            options={branches?.map(b => ({ value: b.id, label: b.name })) ?? []}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {createMutation.isPending ? 'Saving...' : 'Save Block'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Schedule List */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Upcoming Schedule</h3>

                        {isLoading ? (
                            <div className="py-8 flex justify-center">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : schedules && schedules.length > 0 ? (
                            <div className="space-y-3">
                                {schedules.map((schedule) => (
                                    <div key={schedule.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/40 border border-border rounded-xl gap-4 group">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                                <CalendarIcon className="w-4 h-4 text-primary" />
                                                <span>{new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                <span className="text-muted-foreground mx-1">•</span>
                                                <Clock className="w-4 h-4 text-primary" />
                                                <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {schedule.branchId}
                                                </div>
                                                <span className="px-2 py-0.5 bg-background border border-border rounded text-[10px] uppercase tracking-wider font-semibold">
                                                    {schedule.sessionType}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteMutation.mutate(schedule.id)}
                                            disabled={deleteMutation.isPending}
                                            className="self-end sm:self-auto p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                                            title="Delete block"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 border-2 border-dashed border-border rounded-xl text-center flex flex-col items-center">
                                <CalendarIcon className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
                                <p className="text-muted-foreground text-sm">No schedule blocks assigned.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
