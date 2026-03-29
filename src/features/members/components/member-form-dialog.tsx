import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, User, Activity, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomDateInput } from '@/components/ui/CustomDateInput';

import { memberSchema } from '../schemas/member-schema';
import { membersApi } from '../api/members-api';
import type { MemberFormData, Member } from '../types';
import { useBranches } from '@/hooks/useBranches';
import { usePackages } from '@/hooks/usePackages';
import { useTrainers } from '@/hooks/useTrainers';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Member | null;
}

export function MemberFormDialog({ isOpen, onClose, initialData }: Props) {
    const isEditing = !!initialData;
    const queryClient = useQueryClient();
    const { data: branches, isLoading: branchesLoading } = useBranches();
    const { data: packages, isLoading: packagesLoading } = usePackages();
    const { data: trainers, isLoading: trainersLoading } = useTrainers();
    const [activeTab, setActiveTab] = useState<'personal' | 'health' | 'membership'>('personal');

    // Normalize ISO datetime strings to YYYY-MM-DD for <input type="date">
    const toDateStr = (val?: string | null) =>
        val ? val.split('T')[0] : '';

    const {
        register,
        handleSubmit,
        reset,
        trigger,
        watch,
        setValue,
        formState: { errors },
    } = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema) as any,
        defaultValues: initialData
            ? {
                ...initialData,
                gender: initialData.gender as 'Male' | 'Female' | 'Other' | 'Prefer Not to Say',
                dateOfBirth: toDateStr(initialData.dateOfBirth),
                joinDate: toDateStr(initialData.joinDate),
                membershipPlanId: initialData.membershipPlanId ?? '',
                membershipStartDate: toDateStr(initialData.membershipStartDate),
                membershipEndDate: toDateStr(initialData.membershipEndDate),
                paymentStatus: (initialData.paymentStatus as 'Paid' | 'Pending') ?? 'Pending',
                status: (initialData.status as 'Active' | 'Inactive') ?? 'Active',
                email: initialData.email ?? '',
                emergencyContact: initialData.emergencyContact ?? '',
                address: initialData.address ?? '',
                medicalConditions: initialData.medicalConditions ?? '',
                trainerId: initialData.trainerId ?? '',
            }
            : {
                firstName: '',
                lastName: '',
                phone: '',
                gender: 'Prefer Not to Say',
                dateOfBirth: '',
                joinDate: new Date().toISOString().split('T')[0],
                branchId: '',
                status: 'Active',
                email: '',
                emergencyContact: '',
                address: '',
                height: undefined,
                weight: undefined,
                medicalConditions: '',
                membershipPlanId: '',
                membershipStartDate: new Date().toISOString().split('T')[0],
                membershipEndDate: '',
                paymentStatus: 'Pending',
                trainerId: '',
            },
    });

    // Reset form with fresh data every time the dialog opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            reset(
                initialData
                    ? {
                        ...initialData,
                        gender: initialData.gender as 'Male' | 'Female' | 'Other' | 'Prefer Not to Say',
                        dateOfBirth: toDateStr(initialData.dateOfBirth),
                        joinDate: toDateStr(initialData.joinDate),
                        membershipPlanId: initialData.membershipPlanId ?? '',
                        membershipStartDate: toDateStr(initialData.membershipStartDate),
                        membershipEndDate: toDateStr(initialData.membershipEndDate),
                        paymentStatus: (initialData.paymentStatus as 'Paid' | 'Pending') ?? 'Pending',
                        status: (initialData.status as 'Active' | 'Inactive') ?? 'Active',
                        email: initialData.email ?? '',
                        emergencyContact: initialData.emergencyContact ?? '',
                        address: initialData.address ?? '',
                        medicalConditions: initialData.medicalConditions ?? '',
                        trainerId: initialData.trainerId ?? '',
                    }
                    : {
                        firstName: '',
                        lastName: '',
                        phone: '',
                        gender: 'Prefer Not to Say',
                        dateOfBirth: '',
                        joinDate: new Date().toISOString().split('T')[0],
                        branchId: '',
                        status: 'Active',
                        email: '',
                        emergencyContact: '',
                        address: '',
                        height: undefined,
                        weight: undefined,
                        medicalConditions: '',
                        membershipPlanId: '',
                        membershipStartDate: new Date().toISOString().split('T')[0],
                        membershipEndDate: '',
                        paymentStatus: 'Pending',
                        trainerId: '',
                    }
            );
            setActiveTab('personal');
        }
    }, [isOpen, initialData]);

    // Watch package + start date to auto-calculate end date
    const selectedPlanId = watch('membershipPlanId');
    const membershipStartDate = watch('membershipStartDate');

    const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const planId = e.target.value;
        setValue('membershipPlanId', planId, { shouldValidate: true });
        recalculateEndDate(planId, membershipStartDate);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const startDate = e.target.value;
        setValue('membershipStartDate', startDate, { shouldValidate: true });
        recalculateEndDate(selectedPlanId, startDate);
    };

    const recalculateEndDate = (planId: string, startDate: string) => {
        if (!planId || !startDate) return;
        const selectedPkg = packages?.find(p => p.id === planId);
        if (!selectedPkg) return;
        const start = new Date(startDate);
        start.setMonth(start.getMonth() + selectedPkg.durationInMonths);
        setValue('membershipEndDate', start.toISOString().split('T')[0]);
    };

    const mutation = useMutation({
        mutationFn: (data: MemberFormData) => {
            const selectedPkg = packages?.find(p => p.id === data.membershipPlanId);
            const price = selectedPkg?.price ?? 0;
            if (isEditing && initialData?.id) {
                return membersApi.updateMember(initialData.id, { ...data, _price: price } as any, initialData.membershipId);
            }
            return membersApi.createMember({ ...data, _price: price } as any);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success(isEditing ? 'Member updated successfully' : 'Member registered successfully');
            reset();
            onClose();
        },
        onError: () => {
            toast.error('Failed to save member record');
        },
    });

    const onSubmit = (data: MemberFormData) => {
        mutation.mutate(data);
    };

    const handleNextTab = async (current: 'personal' | 'health') => {
        let fieldsToValidate: (keyof MemberFormData)[] = [];

        if (current === 'personal') {
            fieldsToValidate = ['firstName', 'lastName', 'phone', 'gender', 'dateOfBirth', 'joinDate', 'branchId', 'email'];
        }

        const isStepValid = await trigger(fieldsToValidate);

        if (isStepValid) {
            setActiveTab(current === 'personal' ? 'health' : 'membership');
        } else {
            toast.error('Please fill in all required fields correctly.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="bg-card w-full max-w-3xl max-h-[95vh] rounded-2xl border border-border flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">
                        {isEditing ? 'Edit Member Profile' : 'New Member Registration'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-4 border-b border-border gap-6">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <User className="w-4 h-4" /> Personal
                    </button>
                    <button
                        onClick={() => setActiveTab('health')}
                        className={`pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'health' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <Activity className="w-4 h-4" /> Health & Specs
                    </button>
                    <button
                        onClick={() => setActiveTab('membership')}
                        className={`pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'membership' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <CreditCard className="w-4 h-4" /> Membership
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="member-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">

                        {/* Tab 1: Personal Details */}
                        <div className={activeTab === 'personal' ? 'block' : 'hidden'}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">First Name *</label>
                                    <input
                                        type="text"
                                        {...register('firstName')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Last Name *</label>
                                    <input
                                        type="text"
                                        {...register('lastName')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number *</label>
                                    <input
                                        type="tel"
                                        {...register('phone')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Email (Optional)</label>
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Gender *</label>
                                    <CustomSelect
                                        {...register('gender')}
                                        value={watch('gender')}
                                        options={[
                                            { value: 'Prefer Not to Say', label: 'Prefer Not to Say' },
                                            { value: 'Male', label: 'Male' },
                                            { value: 'Female', label: 'Female' },
                                            { value: 'Other', label: 'Other' },
                                        ]}
                                    />
                                    {errors.gender && <p className="mt-1 text-xs text-destructive">{errors.gender.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth *</label>
                                    <CustomDateInput
                                        {...register('dateOfBirth')}
                                        value={watch('dateOfBirth')}
                                    />
                                    {errors.dateOfBirth && <p className="mt-1 text-xs text-destructive">{errors.dateOfBirth.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Branch *</label>
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
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Join Date *</label>
                                    <CustomDateInput
                                        {...register('joinDate')}
                                        value={watch('joinDate')}
                                    />
                                    {errors.joinDate && <p className="mt-1 text-xs text-destructive">{errors.joinDate.message}</p>}
                                </div>

                                {isEditing && (
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Member Status</label>
                                        <CustomSelect
                                            {...register('status')}
                                            value={watch('status')}
                                            options={[
                                                { value: 'Active', label: 'Active' },
                                                { value: 'Inactive', label: 'Inactive' },
                                            ]}
                                        />
                                    </div>
                                )}

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
                                    <textarea
                                        {...register('address')}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tab 2: Health Details (All Optional) */}
                        <div className={activeTab === 'health' ? 'block' : 'hidden'}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Height (cm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...register('height', { valueAsNumber: true })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...register('weight', { valueAsNumber: true })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Emergency Contact Number</label>
                                    <input
                                        type="text"
                                        {...register('emergencyContact')}
                                        placeholder="Name - Phone Number"
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Medical Conditions / Notes</label>
                                    <textarea
                                        {...register('medicalConditions')}
                                        placeholder="List any past injuries, surgeries, or conditions trainers should be aware of..."
                                        rows={3}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tab 3: Membership Details */}
                        <div className={activeTab === 'membership' ? 'block' : 'hidden'}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Select Membership Plan *</label>
                                    <CustomSelect
                                        value={selectedPlanId ?? ''}
                                        onChange={handlePackageChange}
                                        placeholder={packagesLoading ? 'Loading packages...' : (packages?.length === 0 ? 'No packages available' : 'Select a package')}
                                        disabled={packagesLoading}
                                        options={packages?.filter(p => p.status === 'Active' || p.id === selectedPlanId).map(p => ({
                                            value: p.id,
                                            label: `${p.name} — Rs. ${p.price.toLocaleString()} / ${p.durationInMonths} month${p.durationInMonths > 1 ? 's' : ''}`,
                                        })) ?? []}
                                    />
                                    {errors.membershipPlanId && <p className="mt-1 text-xs text-destructive">{errors.membershipPlanId.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Plan Start Date *</label>
                                    <CustomDateInput
                                        value={membershipStartDate ?? ''}
                                        onChange={handleStartDateChange}
                                    />
                                    {errors.membershipStartDate && <p className="mt-1 text-xs text-destructive">{errors.membershipStartDate.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Plan End / Expiry Date
                                        {selectedPlanId && membershipStartDate && (
                                            <span className="ml-2 text-xs font-normal text-primary">(auto-calculated)</span>
                                        )}
                                    </label>
                                    <CustomDateInput
                                        {...register('membershipEndDate')}
                                        value={watch('membershipEndDate')}
                                        readOnly={!!(selectedPlanId && membershipStartDate)}
                                    />
                                    {errors.membershipEndDate && <p className="mt-1 text-xs text-destructive">{errors.membershipEndDate.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Trainer Assigned</label>
                                    <CustomSelect
                                        {...register('trainerId')}
                                        value={watch('trainerId')}
                                        placeholder="No Trainer Assigned"
                                        disabled={trainersLoading}
                                        options={[
                                            { value: '', label: 'No Trainer Assigned' },
                                            ...(trainers?.filter(t => t.status === 'Active').map(t => ({
                                                value: t.id,
                                                label: `${t.firstName} ${t.lastName}${t.specialization ? ` (${t.specialization})` : ''}`,
                                            })) ?? []),
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        {isEditing ? 'Payment Status' : 'Initial Payment Status'}
                                    </label>
                                    <CustomSelect
                                        {...register('paymentStatus')}
                                        value={watch('paymentStatus')}
                                        options={[
                                            { value: 'Pending', label: 'Payment Pending' },
                                            { value: 'Paid', label: 'Mark as Paid' },
                                        ]}
                                    />
                                    {!isEditing && <p className="text-xs text-muted-foreground mt-1">Marking paid generates a receipt record.</p>}
                                </div>

                                {!isEditing && (
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Registration Fee (LKR)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium pointer-events-none">Rs.</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                {...register('registrationFee', { valueAsNumber: true })}
                                                defaultValue={0}
                                                className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">One-time fee — set to 0 to waive.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer fixed at bottom */}
                <div className="px-6 py-4 border-t border-border flex justify-between bg-muted/20">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>

                    <div className="flex gap-3">
                        {activeTab === 'personal' && (
                            <button
                                type="button"
                                onClick={() => handleNextTab('personal')}
                                className="px-5 py-2.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                Next: Health Details
                            </button>
                        )}
                        {activeTab === 'health' && (
                            <button
                                type="button"
                                onClick={() => handleNextTab('health')}
                                className="px-5 py-2.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                Next: Membership
                            </button>
                        )}
                        {activeTab === 'membership' && (
                            <button
                                form="member-form"
                                type="submit"
                                disabled={mutation.isPending}
                                className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {mutation.isPending ? 'Saving...' : isEditing ? 'Save Member' : 'Register Member'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
