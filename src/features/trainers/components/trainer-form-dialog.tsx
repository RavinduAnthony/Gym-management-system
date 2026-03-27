import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { trainerSchema } from '../schemas/trainer-schema';
import { trainersApi } from '../api/trainers-api';
import type { TrainerFormData, Trainer } from '../types';
import { useBranches } from '@/hooks/useBranches';

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
            }
        }
    }, [initialData, isOpen, reset]);

    const [certInput, setCertInput] = useState('');
    const currentCerts = watch('certifications') || [];

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
                                    <input
                                        type="date"
                                        {...register('dateOfBirth')}
                                        className="w-full sm:max-w-xs px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
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
                                    <select
                                        {...register('branchId')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                        disabled={branchesLoading}
                                    >
                                        <option value="">{branchesLoading ? 'Loading branches...' : (branches?.length === 0 ? 'No branches available' : 'Select a branch')}</option>
                                        {branches?.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    {errors.branchId && <p className="mt-1 text-xs text-destructive">{errors.branchId.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Status *</label>
                                    <select
                                        {...register('status')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                    {errors.status && <p className="mt-1 text-xs text-destructive">{errors.status.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">General Availability</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Mon-Fri 8AM-5PM"
                                        {...register('availability')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
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
