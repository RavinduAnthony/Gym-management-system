import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, User, Activity, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import { memberSchema } from '../schemas/member-schema';
import { membersApi } from '../api/members-api';
import type { MemberFormData, Member } from '../types';
import { useBranches } from '@/hooks/useBranches';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Member | null;
}

export function MemberFormDialog({ isOpen, onClose, initialData }: Props) {
    const isEditing = !!initialData;
    const queryClient = useQueryClient();
    const { data: branches, isLoading: branchesLoading } = useBranches();
    const [activeTab, setActiveTab] = useState<'personal' | 'health' | 'membership'>('personal');

    const {
        register,
        handleSubmit,
        reset,
        trigger,
        formState: { errors },
    } = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema) as any,
        defaultValues: initialData || {
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

    const mutation = useMutation({
        mutationFn: (data: MemberFormData) => {
            return isEditing && initialData?.id
                ? membersApi.updateMember(initialData.id, data)
                : membersApi.createMember(data);
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
                                    <select
                                        {...register('gender')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    >
                                        <option value="Prefer Not to Say">Prefer Not to Say</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <p className="mt-1 text-xs text-destructive">{errors.gender.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth *</label>
                                    <input
                                        type="date"
                                        {...register('dateOfBirth')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.dateOfBirth && <p className="mt-1 text-xs text-destructive">{errors.dateOfBirth.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Branch *</label>
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
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Join Date *</label>
                                    <input
                                        type="date"
                                        {...register('joinDate')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.joinDate && <p className="mt-1 text-xs text-destructive">{errors.joinDate.message}</p>}
                                </div>

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
                                    <select
                                        {...register('membershipPlanId')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    >
                                        <option value="">Select a package</option>
                                        <option value="pkg_monthly">Monthly Standard (5000 LKR)</option>
                                        <option value="pkg_quarterly">Quarterly Pro (12000 LKR)</option>
                                        <option value="pkg_annual">Annual VIP (40000 LKR)</option>
                                    </select>
                                    {errors.membershipPlanId && <p className="mt-1 text-xs text-destructive">{errors.membershipPlanId.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Plan Start Date *</label>
                                    <input
                                        type="date"
                                        {...register('membershipStartDate')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.membershipStartDate && <p className="mt-1 text-xs text-destructive">{errors.membershipStartDate.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Plan End / Expiry Date *</label>
                                    <input
                                        type="date"
                                        {...register('membershipEndDate')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.membershipEndDate && <p className="mt-1 text-xs text-destructive">{errors.membershipEndDate.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Trainer Assigned</label>
                                    <select
                                        {...register('trainerId')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    >
                                        <option value="">No Trainer Assigned</option>
                                        <option value="trn_1">Sarah Connor (CrossFit)</option>
                                        <option value="trn_2">David Silva (Bodybuilding)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Initial Payment Status</label>
                                    <select
                                        {...register('paymentStatus')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm font-medium"
                                    >
                                        <option value="Pending">Payment Pending</option>
                                        <option value="Paid">Mark as Paid</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground mt-1">Marking paid generates a receipt record.</p>
                                </div>
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
