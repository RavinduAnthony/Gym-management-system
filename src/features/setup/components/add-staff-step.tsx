import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, User, Mail } from 'lucide-react';
import { staffSchema, type StaffFormData } from '../schemas/setup-schema';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface Props {
    onNext: (data: StaffFormData) => void;
    onBack: () => void;
    defaultValues?: Partial<StaffFormData>;
}

export function AddStaffStep({ onNext, onBack, defaultValues }: Props) {
    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm<StaffFormData>({
        resolver: zodResolver(staffSchema),
        defaultValues: defaultValues || { staff: [] },
        mode: 'onChange',
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'staff',
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Add Staff (Optional)</h2>
                    <p className="text-muted-foreground mt-1">Invite receptionists or trainers to your gym.</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ name: '', email: '', role: 'Receptionist' })}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Staff
                </button>
            </div>

            <form onSubmit={handleSubmit(onNext)} className="space-y-6">
                {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-muted/20">
                        <User className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm font-medium text-foreground">No staff added yet</p>
                        <p className="text-xs text-muted-foreground text-center mt-1 max-w-sm">
                            You can invite staff members now or do it later from the administrative settings.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="group relative grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_auto] gap-4 p-4 border border-border rounded-xl bg-card items-start"
                            >
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Jane Doe"
                                            {...register(`staff.${index}.name`)}
                                            className={`w-full pl-9 pr-3 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm ${errors.staff?.[index]?.name ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'
                                                }`}
                                        />
                                    </div>
                                    {errors.staff?.[index]?.name && <p className="mt-1 text-xs text-destructive">{errors.staff[index]?.name?.message}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="email"
                                            placeholder="jane@gym.com"
                                            {...register(`staff.${index}.email`)}
                                            className={`w-full pl-9 pr-3 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm ${errors.staff?.[index]?.email ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'
                                                }`}
                                        />
                                    </div>
                                    {errors.staff?.[index]?.email && <p className="mt-1 text-xs text-destructive">{errors.staff[index]?.email?.message}</p>}
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
                                    <CustomSelect
                                        {...register(`staff.${index}.role`)}
                                        value={(watch('staff') as any)?.[index]?.role ?? 'Receptionist'}
                                        options={[
                                            { value: 'Receptionist', label: 'Receptionist' },
                                            { value: 'Trainer', label: 'Trainer' },
                                        ]}
                                    />
                                </div>

                                {/* Remove Button */}
                                <div className="pt-6">
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                        title="Remove staff"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
                        disabled={!isValid}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        Continue to Payment Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
