import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/CustomSelect';

import { membershipPackageSchema } from '../schemas/membership-schema';
import { membershipsApi } from '../api/memberships-api';
import type { MembershipPackageFormData, MembershipPackage } from '../types';
import { useBranches } from '@/hooks/useBranches';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: MembershipPackage | null;
}

export function MembershipFormDialog({ isOpen, onClose, initialData }: Props) {
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
    } = useForm<MembershipPackageFormData>({
        resolver: zodResolver(membershipPackageSchema) as any,
        defaultValues: initialData || {
            name: '',
            durationInMonths: 1,
            price: 0,
            branch: '',
            status: 'Active',
            maxVisits: undefined,
            trainerIncluded: false,
            freezeDays: 0,
            discountAllowed: false,
            billingFrequency: 'Monthly',
            benefits: [],
        },
    });

    // We can just use an array of strings in state for benefits to make it simple
    // since react-hook-form handles strings arrays simply
    const [benefitInput, setBenefitInput] = useState('');
    const currentBenefits = watch('benefits') || [];

    const handleAddBenefit = () => {
        if (!benefitInput.trim()) return;
        if (currentBenefits.includes(benefitInput.trim())) {
            toast.error('Benefit already exists');
            return;
        }
        setValue('benefits', [...currentBenefits, benefitInput.trim()]);
        setBenefitInput('');
    };

    const handleRemoveBenefit = (benefit: string) => {
        setValue(
            'benefits',
            currentBenefits.filter((b) => b !== benefit)
        );
    };

    const mutation = useMutation({
        mutationFn: (data: MembershipPackageFormData) => {
            return isEditing && initialData?.id
                ? membershipsApi.updatePackage(initialData.id, data)
                : membershipsApi.createPackage(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
            toast.success(isEditing ? 'Package updated successfully' : 'Package created successfully');
            reset();
            onClose();
        },
        onError: () => {
            toast.error('Failed to save package');
        },
    });

    const onSubmit = (data: MembershipPackageFormData) => {
        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl border border-border flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">
                        {isEditing ? 'Edit Package' : 'Create Membership Package'}
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
                    <form id="membership-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
                        {/* 1. Basic Details */}
                        <section>
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                                1. Basic Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Package Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. VIP Ultimate Plan"
                                        {...register('name')}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Duration (Months)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        {...register('durationInMonths', { valueAsNumber: true })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.durationInMonths && <p className="mt-1 text-xs text-destructive">{errors.durationInMonths.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Price (LKR)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        {...register('price', { valueAsNumber: true })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {watch('billingFrequency') === 'FullPayment' ? 'One-time full package price.' : 'Amount charged each month.'}
                                    </p>
                                </div>

                                {/* Billing Frequency */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-2">Billing Mode</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {([
                                            { value: 'Monthly', title: 'Monthly Payments', desc: 'Member pays each month separately. Regular & Late tracking applies.' },
                                            { value: 'FullPayment', title: 'Full Payment at Once', desc: 'Single upfront payment covering the entire package duration.' },
                                        ] as const).map((opt) => {
                                            const selected = watch('billingFrequency') === opt.value;
                                            return (
                                                <label
                                                    key={opt.value}
                                                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                        selected
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/40'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        value={opt.value}
                                                        {...register('billingFrequency')}
                                                        className="mt-0.5 accent-[var(--primary)]"
                                                    />
                                                    <div>
                                                        <p className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>{opt.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Branch</label>
                                    <CustomSelect
                                        {...register('branch')}
                                        value={watch('branch')}
                                        placeholder={branchesLoading ? 'Loading branches...' : (branches?.length === 0 ? 'No branches available' : 'Select a branch')}
                                        disabled={branchesLoading}
                                        options={[
                                            { value: 'All Branches', label: 'All Branches' },
                                            ...(branches?.map(b => ({ value: b.id, label: b.name })) ?? []),
                                        ]}
                                    />
                                    {errors.branch && <p className="mt-1 text-xs text-destructive">{errors.branch.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                                    <CustomSelect
                                        {...register('status')}
                                        value={watch('status')}
                                        options={[
                                            { value: 'Active', label: 'Active' },
                                            { value: 'Inactive', label: 'Inactive' },
                                        ]}
                                    />
                                    {errors.status && <p className="mt-1 text-xs text-destructive">{errors.status.message}</p>}
                                </div>
                            </div>
                        </section>

                        {/* 2. Optional Settings */}
                        <section>
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                                2. Optional Settings
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Max Visits (Per Month)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Leave empty for unlimited"
                                        {...register('maxVisits', { valueAsNumber: true })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Leave blank for unlimited monthly visits.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Freeze Days Allowed</label>
                                    <input
                                        type="number"
                                        min="0"
                                        {...register('freezeDays', { valueAsNumber: true })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Total days member can pause subscription.</p>
                                </div>

                                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('trainerIncluded')}
                                            className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                                        />
                                        <div>
                                            <p className="text-sm text-foreground font-medium">Personal Trainer Included</p>
                                            <p className="text-xs text-muted-foreground">Does this package come with a dedicated PT?</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('discountAllowed')}
                                            className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                                        />
                                        <div>
                                            <p className="text-sm text-foreground font-medium">Allow Staff Discounts</p>
                                            <p className="text-xs text-muted-foreground">Can sales staff apply manual discounts?</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* 3. Package Benefits */}
                        <section>
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                                3. Package Benefits
                            </h3>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={benefitInput}
                                    onChange={(e) => setBenefitInput(e.target.value)}
                                    placeholder="e.g. Free Protein Shake, Sauna Access"
                                    className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddBenefit();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddBenefit}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>

                            {currentBenefits.length > 0 ? (
                                <ul className="space-y-2">
                                    {currentBenefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-center justify-between px-4 py-2.5 bg-card border border-border rounded-lg text-sm">
                                            <div className="flex items-center gap-2 text-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                                <span>{benefit}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveBenefit(benefit)}
                                                className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center p-6 border-2 border-dashed border-border rounded-xl">
                                    <p className="text-sm text-muted-foreground">No benefits added yet.</p>
                                </div>
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
                        form="membership-form"
                        type="submit"
                        disabled={mutation.isPending}
                        className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Package'}
                    </button>
                </div>
            </div>
        </div>
    );
}
