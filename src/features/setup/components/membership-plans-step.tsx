import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Calendar, DollarSign } from 'lucide-react';
import { membershipPlansSchema, type MembershipPlansFormData } from '../schemas/setup-schema';

interface Props {
    onNext: (data: MembershipPlansFormData) => void;
    onBack: () => void;
    defaultValues?: Partial<MembershipPlansFormData>;
}

export function MembershipPlansStep({ onNext, onBack, defaultValues }: Props) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<MembershipPlansFormData>({
        resolver: zodResolver(membershipPlansSchema),
        defaultValues: defaultValues || {
            // Default initial plans as per BRD 1.3.2 specifications
            plans: [
                { name: 'Monthly', durationInMonths: 1, price: 5000 },
                { name: 'Quarterly', durationInMonths: 3, price: 12000 },
                { name: 'Annual', durationInMonths: 12, price: 40000 },
            ],
        },
        mode: 'onChange',
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'plans',
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Membership Plans</h2>
                    <p className="text-muted-foreground mt-1">Set up your default subscription packages.</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ name: '', durationInMonths: 1, price: 0 })}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Plan
                </button>
            </div>

            <form onSubmit={handleSubmit(onNext)} className="space-y-6">
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="group relative grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-4 p-4 border border-border rounded-xl bg-card items-start"
                        >
                            {/* Plan Name */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Plan Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Monthly Standard"
                                    {...register(`plans.${index}.name`)}
                                    className={`w-full px-3 py-2 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm ${errors.plans?.[index]?.name ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'
                                        }`}
                                />
                                {errors.plans?.[index]?.name && (
                                    <p className="mt-1 text-xs text-destructive">{errors.plans[index]?.name?.message}</p>
                                )}
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Duration (Months)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        min="1"
                                        {...register(`plans.${index}.durationInMonths`, { valueAsNumber: true })}
                                        className={`w-full pl-9 pr-3 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm ${errors.plans?.[index]?.durationInMonths ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'
                                            }`}
                                    />
                                </div>
                                {errors.plans?.[index]?.durationInMonths && (
                                    <p className="mt-1 text-xs text-destructive">{errors.plans[index]?.durationInMonths?.message}</p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Price (LKR)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        {...register(`plans.${index}.price`, { valueAsNumber: true })}
                                        className={`w-full pl-9 pr-3 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm ${errors.plans?.[index]?.price ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'
                                            }`}
                                    />
                                </div>
                                {errors.plans?.[index]?.price && (
                                    <p className="mt-1 text-xs text-destructive">{errors.plans[index]?.price?.message}</p>
                                )}
                            </div>

                            {/* Remove Button */}
                            <div className="pt-6">
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                                    title="Remove plan"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {errors.plans?.root && (
                        <p className="text-sm font-medium text-destructive mt-2 text-center">{errors.plans.root.message}</p>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="pt-6 border-t border-border flex justify-between items-center">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-2.5 text-foreground hover:bg-muted rounded-lg text-sm font-medium transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={!isValid || fields.length === 0}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        Continue to Staff
                    </button>
                </div>
            </form>
        </div>
    );
}
