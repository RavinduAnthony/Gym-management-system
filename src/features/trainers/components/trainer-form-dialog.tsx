import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomDateInput } from '@/components/ui/CustomDateInput';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';

import { trainerSchema } from '../schemas/trainer-schema';
import { trainersApi } from '../api/trainers-api';
import type { TrainerFormData, Trainer } from '../types';
import { useBranches } from '@/hooks/useBranches';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function parseAvailability(value?: string) {
    if (!value) return { days: [] as string[], startTime: '', endTime: '' };
    const match = value.match(/^([^\s]+)(?:\s+(\d{2}:\d{2})-(\d{2}:\d{2}))?$/);
    if (!match) return { days: [] as string[], startTime: '', endTime: '' };
    const days = match[1].split(',').filter(d => (DAYS as readonly string[]).includes(d));
    return { days, startTime: match[2] ?? '', endTime: match[3] ?? '' };
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Trainer | null;
}

export function TrainerFormDialog({ isOpen, onClose, initialData }: Props) {
    const isEditing = !!initialData;
    const queryClient = useQueryClient();
    const { data: branches, isLoading: branchesLoading } = useBranches();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TrainerFormData>({
        resolver: zodResolver(trainerSchema) as any,
        defaultValues: initialData || {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            specialization: '',
            status: 'Active',
            branchId: '',
            experienceYears: 0,
            availability: '',
            certifications: [],
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    ...initialData,
                    dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
                } as any);
                const parsed = parseAvailability(initialData.availability);
                setSelectedDays(parsed.days);
                setAvailStartTime(parsed.startTime);
                setAvailEndTime(parsed.endTime);
            } else {
                reset({
                    firstName: '',
                    lastName: '',
                    phone: '',
                    email: '',
                    specialization: '',
                    status: 'Active',
                    branchId: '',
                    experienceYears: 0,
                    availability: '',
                    certifications: [],
                });
                setSelectedDays([]);
                setAvailStartTime('');
                setAvailEndTime('');
            }
        }
    }, [initialData, isOpen, reset]);

    const [certInput, setCertInput] = useState('');
    const currentCerts = watch('certifications') || [];

    // --- Availability state ---
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [availStartTime, setAvailStartTime] = useState('');
    const [availEndTime, setAvailEndTime] = useState('');

    const syncAvailability = useCallback(
        (days: string[], start: string, end: string) => {
            if (days.length === 0) { setValue('availability', ''); return; }
            const timeStr = start && end ? ` ${start}-${end}` : '';
            setValue('availability', `${days.join(',')}${timeStr}`);
        },
        [setValue]
    );

    useEffect(() => {
        syncAvailability(selectedDays, availStartTime, availEndTime);
    }, [selectedDays, availStartTime, availEndTime, syncAvailability]);

    const toggleDay = (day: string) => {
        setSelectedDays(prev => {
            const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
            return next;
        });
    };
    // -------------------------

    const handleAddCert = () => {
        if (!certInput.trim()) return;
        if (currentCerts.includes(certInput.trim())) {
            toast.error('Certification already added');
            return;
        }
        setValue('certifications', [...currentCerts, certInput.trim()]);
        setCertInput('');
    };

    const handleRemoveCert = (cert: string) => {
        setValue(
            'certifications',
            currentCerts.filter((c) => c !== cert)
        );
    };

    const mutation = useMutation({
        mutationFn: (data: TrainerFormData) => {
            return isEditing && initialData?.id
                ? trainersApi.updateTrainer(initialData.id, data)
                : trainersApi.createTrainer(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trainers'] });
            toast.success(isEditing ? 'Trainer updated successfully' : 'Trainer created successfully');
            reset();
            onClose();
        },
        onError: () => {
            toast.error('Failed to save trainer record');
        },
    });

    const onSubmit = (data: TrainerFormData) => {
        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl border border-border flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">
                        {isEditing ? 'Edit Trainer Profile' : 'Add New Trainer'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="trainer-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
                        {/* 1. Basic Details */}
                        <section>
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                                1. Personal & Contact
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">First Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Jane"
                                        {...register('firstName')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Last Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        {...register('lastName')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number *</label>
                                    <input
                                        type="tel"
                                        placeholder="07xxxxxxx"
                                        {...register('phone')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Email Address *</label>
                                    <input
                                        type="email"
                                        placeholder="trainer@gym.com"
                                        {...register('email')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth (Optional)</label>
                                    <CustomDateInput
                                        {...register('dateOfBirth')}
                                        value={watch('dateOfBirth') as string | undefined}
                                        className="sm:max-w-xs"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. Employment Details */}
                        <section>
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                                2. Employment Info
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Primary Specialization *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Weightlifting, Yoga"
                                        {...register('specialization')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.specialization && <p className="mt-1 text-xs text-destructive">{errors.specialization.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Assigned Branch *</label>
                                    <CustomSelect
                                        {...register('branchId')}
                                        value={watch('branchId')}
                                        placeholder={branchesLoading ? 'Loading branches...' : (branches?.length === 0 ? 'No branches available' : 'Select a branch')}
                                        disabled={branchesLoading}
                                        options={branches?.map(b => ({ value: b.id, label: b.name })) ?? []}
                                    />
                                    {errors.branchId && <p className="mt-1 text-xs text-destructive">{errors.branchId.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Status *</label>
                                    <CustomSelect
                                        {...register('status')}
                                        value={watch('status')}
                                        options={[
                                            { value: 'Active', label: 'Active' },
                                            { value: 'Inactive', label: 'Inactive' },
                                            { value: 'On Leave', label: 'On Leave' },
                                        ]}
                                    />
                                    {errors.status && <p className="mt-1 text-xs text-destructive">{errors.status.message}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-2">General Availability</label>
                                    {/* Day toggles */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {DAYS.map(day => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                                    selectedDays.includes(day)
                                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                        : 'bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground'
                                                }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Time range */}
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs text-muted-foreground mb-1">From</label>
                                            <CustomTimeInput
                                                value={availStartTime}
                                                onChange={e => setAvailStartTime(e.target.value)}
                                            />
                                        </div>
                                        <span className="text-muted-foreground pb-2.5 select-none">—</span>
                                        <div className="flex-1">
                                            <label className="block text-xs text-muted-foreground mb-1">To</label>
                                            <CustomTimeInput
                                                value={availEndTime}
                                                onChange={e => setAvailEndTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Years of Experience</label>
                                    <input
                                        type="number"
                                        min="0"
                                        {...register('experienceYears', { valueAsNumber: true })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 3. Certifications */}
                        <section>
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                                3. Certifications (Optional)
                            </h3>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={certInput}
                                    onChange={(e) => setCertInput(e.target.value)}
                                    placeholder="e.g. ACE Certified, Level 1 First Aid"
                                    className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCert();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCert}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>

                            {currentCerts.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {currentCerts.map((cert, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-full text-xs">
                                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                                <span>{cert}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCert(cert)}
                                                className="p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full ml-1"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground mt-2">No certifications added yet.</p>
                            )}
                        </section>
                    </form>
                </div>

                {/* Footer fixed at bottom */}
                <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-muted/20">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="trainer-form"
                        type="submit"
                        disabled={mutation.isPending}
                        className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Trainer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
