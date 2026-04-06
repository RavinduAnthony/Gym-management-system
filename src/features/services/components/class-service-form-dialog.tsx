import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, CalendarRange, Users, CreditCard, MapPin, Clock, Info } from 'lucide-react';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomDateInput } from '@/components/ui/CustomDateInput';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';
import { gymClassSchema, type GymClassFormData, type GymClass } from '../schemas/class-service-schema';
import { gymClassesApi } from '../api/class-services-api';
import { trainersApi } from '@/features/trainers/api/trainers-api';
import { useBranches } from '@/hooks/useBranches';
import { useServiceSettings } from '@/hooks/useServiceSettings';
import { useClassTypes } from '@/hooks/useClassTypes';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type Tab = 'basic' | 'instructor' | 'schedule' | 'pricing' | 'location';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'basic', label: 'Basic Info', icon: <Info className="w-4 h-4" /> },
    { id: 'instructor', label: 'Instructor', icon: <Users className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarRange className="w-4 h-4" /> },
    { id: 'pricing', label: 'Capacity & Pricing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'location', label: 'Location', icon: <MapPin className="w-4 h-4" /> },
];

function calcDurationMinutes(start: string, end: string): number {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? diff : 0;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: GymClass | null;
}

export function GymClassFormDialog({ isOpen, onClose, initialData }: Props) {
    const isEditing = !!initialData;
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>('basic');

    const { data: branches, isLoading: branchesLoading } = useBranches();
    const { data: serviceSettings } = useServiceSettings();
    const { data: classTypes, isLoading: classTypesLoading } = useClassTypes();
    const { data: trainers, isLoading: trainersLoading } = useQuery({
        queryKey: ['trainers'],
        queryFn: trainersApi.getTrainers,
    });

    const classDefaultAmount = serviceSettings?.find((s: any) => s.serviceType === 'Classes')?.defaultAmount ?? 0;

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<GymClassFormData>({
        resolver: zodResolver(gymClassSchema) as any,
        defaultValues: {
            name: '', category: '', description: '',
            instructorId: '', daysOfWeek: [],
            startTime: '', endTime: '', durationMinutes: 0,
            batchStartDate: '', batchEndDate: '',
            maxCapacity: 20, defaultAmount: 0,
            branchId: '', status: 'Active',
        },
    });

    // Day toggles
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const syncDays = useCallback((days: string[]) => {
        setValue('daysOfWeek', days, { shouldValidate: true });
    }, [setValue]);
    const toggleDay = (day: string) => {
        const next = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day];
        setSelectedDays(next);
        syncDays(next);
    };

    // Local state for time inputs (CustomTimeInput uses ChangeEvent not plain string)
    const [startTimeVal, setStartTimeVal] = useState('');
    const [endTimeVal, setEndTimeVal] = useState('');
    const [hourlyRate, setHourlyRate] = useState<number>(0);
    const durationMinutes = watch('durationMinutes');

    // Auto-calc duration
    useEffect(() => {
        const dur = calcDurationMinutes(startTimeVal, endTimeVal);
        if (dur > 0) setValue('durationMinutes', dur);
    }, [startTimeVal, endTimeVal, setValue]);

    // Recalculate full session fee when hourly rate or duration changes
    useEffect(() => {
        const fullFee = parseFloat((hourlyRate * durationMinutes / 60).toFixed(2));
        setValue('defaultAmount', fullFee, { shouldValidate: false });
    }, [hourlyRate, durationMinutes, setValue]);

    // Reset form on open/close
    useEffect(() => {
        if (isOpen) {
            setActiveTab('basic');
            if (initialData) {
                const days = (initialData.daysOfWeek ?? '').split(',').filter(Boolean);
                setSelectedDays(days);
                setStartTimeVal(initialData.startTime ?? '');
                setEndTimeVal(initialData.endTime ?? '');
                reset({
                    name: initialData.name,
                    category: initialData.category ?? '',
                    description: initialData.description ?? '',
                    instructorId: initialData.instructorId ?? '',
                    daysOfWeek: days,
                    startTime: initialData.startTime,
                    endTime: initialData.endTime,
                    durationMinutes: initialData.durationMinutes,
                    batchStartDate: initialData.batchStartDate?.split('T')[0] ?? '',
                    batchEndDate: initialData.batchEndDate?.split('T')[0] ?? '',
                    maxCapacity: initialData.maxCapacity,
                    defaultAmount: initialData.defaultAmount,
                    branchId: initialData.branchId ?? '',
                    status: initialData.status as 'Active' | 'Inactive',
                });
                const calcHourly = initialData.durationMinutes > 0
                    ? parseFloat((initialData.defaultAmount / (initialData.durationMinutes / 60)).toFixed(2))
                    : classDefaultAmount;
                setHourlyRate(calcHourly);
            } else {
                setSelectedDays([]);
                setStartTimeVal('');
                setEndTimeVal('');
                setHourlyRate(classDefaultAmount);
                reset({
                    name: '', category: '', description: '',
                    instructorId: '', daysOfWeek: [],
                    startTime: '', endTime: '', durationMinutes: 0,
                    batchStartDate: '', batchEndDate: '',
                    maxCapacity: 20, defaultAmount: 0,
                    branchId: '', status: 'Active',
                });
            }
        }
    }, [isOpen, initialData, reset, classDefaultAmount]);

    const mutation = useMutation({
        mutationFn: (data: GymClassFormData) =>
            isEditing && initialData?.id
                ? gymClassesApi.update(initialData.id, data)
                : gymClassesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gymClasses'] });
            toast.success(isEditing ? 'Class updated successfully' : 'Class registered successfully');
            onClose();
        },
        onError: () => toast.error('Failed to save class'),
    });

    const onSubmit = (data: GymClassFormData) => mutation.mutate(data);
    const selectedInstructor = trainers?.find((t: any) => t.id === watch('instructorId'));

    if (!isOpen) return null;

    const inputCls = 'w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-foreground text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)]/60 transition-colors';
    const labelCls = 'text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block';
    const errorCls = 'text-red-500 text-[10px] font-bold mt-1';

    const CATEGORY_OPTIONS = (classTypes ?? [])
        .filter((t: any) => t.isActive)
        .map((t: any) => ({ value: t.name, label: t.name }));

    const STATUS_OPTIONS = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    const branchOptions = (branches ?? []).map((b: any) => ({ value: b.id, label: b.name }));
    const trainerOptions = (trainers ?? []).map((t: any) => ({
        value: t.id,
        label: `${t.firstName} ${t.lastName}${t.specialization ? ` — ${t.specialization}` : ''}`,
    }));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-alt)]/40 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 flex items-center justify-center">
                            <CalendarRange className="w-4 h-4 text-[var(--secondary)]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                                {isEditing ? 'Edit Class' : 'Register New Class'}
                            </h2>
                            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Group fitness session registration</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-foreground hover:border-foreground/20 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--border)] bg-[var(--surface-alt)]/20 shrink-0 overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-[var(--primary)] text-[var(--primary)]'
                                    : 'border-transparent text-[var(--text-tertiary)] hover:text-foreground'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form body */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6">

                        {/* ─── Basic Info ─── */}
                        {activeTab === 'basic' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Class Name *</label>
                                    <input
                                        {...register('name')}
                                        placeholder="e.g. Morning Yoga, HIIT Blast"
                                        className={inputCls}
                                    />
                                    {errors.name && <p className={errorCls}>{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Category</label>
                                    <CustomSelect
                                        {...register('category')}
                                        options={CATEGORY_OPTIONS}
                                        value={watch('category') ?? ''}
                                        placeholder={classTypesLoading ? 'Loading types...' : CATEGORY_OPTIONS.length === 0 ? 'No types — add in Settings' : 'Select category'}
                                        disabled={classTypesLoading}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Description</label>
                                    <textarea
                                        {...register('description')}
                                        rows={3}
                                        placeholder="Brief description of the class..."
                                        className={`${inputCls} resize-none`}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Status</label>
                                    <CustomSelect
                                        {...register('status')}
                                        options={STATUS_OPTIONS}
                                        value={watch('status') ?? 'Active'}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ─── Instructor ─── */}
                        {activeTab === 'instructor' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Select Instructor</label>
                                    {trainersLoading ? (
                                        <p className="text-xs text-[var(--text-tertiary)]">Loading trainers...</p>
                                    ) : (
                                        <CustomSelect
                                            {...register('instructorId')}
                                            options={trainerOptions}
                                            value={watch('instructorId') ?? ''}
                                            placeholder="Choose an instructor"
                                        />
                                    )}
                                    {errors.instructorId && <p className={errorCls}>{errors.instructorId.message}</p>}
                                </div>

                                {selectedInstructor && (
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/40 p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            {selectedInstructor.photo ? (
                                                <img
                                                    src={selectedInstructor.photo}
                                                    alt={`${selectedInstructor.firstName} ${selectedInstructor.lastName}`}
                                                    className="w-12 h-12 rounded-full object-cover border border-[var(--border)]"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-black text-sm">
                                                    {selectedInstructor.firstName?.[0]}{selectedInstructor.lastName?.[0]}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-foreground">
                                                    {selectedInstructor.firstName} {selectedInstructor.lastName}
                                                </p>
                                                <p className="text-xs text-[var(--text-tertiary)]">{selectedInstructor.specialization}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <span className="text-[var(--text-tertiary)] uppercase tracking-wider text-[10px] font-bold">Phone</span>
                                                <p className="text-foreground mt-0.5">{selectedInstructor.phone ?? '—'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-tertiary)] uppercase tracking-wider text-[10px] font-bold">Email</span>
                                                <p className="text-foreground mt-0.5 truncate">{selectedInstructor.email ?? '—'}</p>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-tertiary)] uppercase tracking-wider text-[10px] font-bold">Experience</span>
                                                <p className="text-foreground mt-0.5">{selectedInstructor.experienceYears ?? 0} yrs</p>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-tertiary)] uppercase tracking-wider text-[10px] font-bold">Status</span>
                                                <p className="text-foreground mt-0.5">{selectedInstructor.status ?? '—'}</p>
                                            </div>
                                        </div>
                                        {selectedInstructor.certifications?.length > 0 && (
                                            <div>
                                                <span className="text-[var(--text-tertiary)] uppercase tracking-wider text-[10px] font-bold">Certifications</span>
                                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                    {selectedInstructor.certifications.map((cert: string, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold border border-[var(--primary)]/20"
                                                        >
                                                            {cert}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Schedule ─── */}
                        {activeTab === 'schedule' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Days of Week *</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {DAYS.map((day) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                    selectedDays.includes(day)
                                                        ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                                                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--primary)]/40 hover:text-foreground'
                                                }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.daysOfWeek && <p className={errorCls}>{errors.daysOfWeek.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Start Time *</label>
                                        <CustomTimeInput
                                            value={startTimeVal}
                                            onChange={(e) => {
                                                setStartTimeVal(e.target.value);
                                                setValue('startTime', e.target.value, { shouldValidate: true });
                                            }}
                                        />
                                        {errors.startTime && <p className={errorCls}>{errors.startTime.message}</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls}>End Time *</label>
                                        <CustomTimeInput
                                            value={endTimeVal}
                                            onChange={(e) => {
                                                setEndTimeVal(e.target.value);
                                                setValue('endTime', e.target.value, { shouldValidate: true });
                                            }}
                                        />
                                        {errors.endTime && <p className={errorCls}>{errors.endTime.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Duration</label>
                                    <div className={`${inputCls} flex items-center gap-2 opacity-70 cursor-default`}>
                                        <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
                                        <span className="text-foreground">
                                            {durationMinutes > 0
                                                ? `${Math.floor(durationMinutes / 60) > 0 ? `${Math.floor(durationMinutes / 60)}h ` : ''}${durationMinutes % 60 > 0 ? `${durationMinutes % 60}m` : ''}`
                                                : 'Auto-calculated from start & end time'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Batch Start Date *</label>
                                        <CustomDateInput
                                            {...register('batchStartDate')}
                                            value={watch('batchStartDate') ?? ''}
                                        />
                                        {errors.batchStartDate && <p className={errorCls}>{errors.batchStartDate.message}</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls}>Batch End Date *</label>
                                        <CustomDateInput
                                            {...register('batchEndDate')}
                                            value={watch('batchEndDate') ?? ''}
                                        />
                                        {errors.batchEndDate && <p className={errorCls}>{errors.batchEndDate.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── Capacity & Pricing ─── */}
                        {activeTab === 'pricing' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Maximum Capacity *</label>
                                    <input
                                        type="number"
                                        min={1}
                                        {...register('maxCapacity', { valueAsNumber: true })}
                                        placeholder="20"
                                        className={inputCls}
                                    />
                                    {errors.maxCapacity && <p className={errorCls}>{errors.maxCapacity.message}</p>}
                                </div>

                                <div>
                                    <label className={labelCls}>Hourly Rate (LKR/hr)</label>
                                    <div className="flex">
                                        <span className="px-3 flex items-center bg-[var(--surface-alt)] border border-r-0 border-[var(--border)] rounded-l-xl text-xs font-black text-[var(--text-secondary)]">LKR/hr</span>
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={hourlyRate}
                                            onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className={`${inputCls} rounded-l-none`}
                                        />
                                    </div>
                                    {classDefaultAmount > 0 && (
                                        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                                            Default from Service Settings: LKR {classDefaultAmount.toLocaleString()}/hr
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelCls}>Full Session Fee (LKR)</label>
                                    <div className={`${inputCls} flex items-center justify-between bg-[var(--surface-alt)]/30 cursor-default`}>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-[var(--text-tertiary)]" />
                                            <span className={`font-black text-base ${watch('defaultAmount') > 0 ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`}>
                                                {watch('defaultAmount') > 0
                                                    ? `LKR ${watch('defaultAmount').toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
                                                    : '—'}
                                            </span>
                                        </div>
                                        {durationMinutes > 0 && hourlyRate > 0 && (
                                            <span className="text-[10px] text-[var(--text-tertiary)]">
                                                LKR {hourlyRate}/hr &times; {durationMinutes}min
                                            </span>
                                        )}
                                    </div>
                                    {errors.defaultAmount && <p className={errorCls}>{errors.defaultAmount.message}</p>}
                                    {durationMinutes === 0 && (
                                        <p className="text-[10px] text-amber-500/80 mt-1">Set start &amp; end time in the Schedule tab to calculate the fee</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── Location ─── */}
                        {activeTab === 'location' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Branch *</label>
                                    {branchesLoading ? (
                                        <p className="text-xs text-[var(--text-tertiary)]">Loading branches...</p>
                                    ) : (
                                        <CustomSelect
                                            {...register('branchId')}
                                            options={branchOptions}
                                            value={watch('branchId') ?? ''}
                                            placeholder="Select branch"
                                        />
                                    )}
                                    {errors.branchId && <p className={errorCls}>{errors.branchId.message}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {(() => {
                        const currentTabIndex = TABS.findIndex(t => t.id === activeTab);
                        const isLastTab = currentTabIndex === TABS.length - 1;
                        const nextTab = !isLastTab ? TABS[currentTabIndex + 1] : null;
                        return (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-alt)]/20 shrink-0">
                                {/* Step dots */}
                                <div className="flex items-center gap-1.5">
                                    {TABS.map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`rounded-full transition-all ${
                                                activeTab === tab.id
                                                    ? 'w-4 h-2 bg-[var(--primary)]'
                                                    : 'w-2 h-2 bg-[var(--border)] hover:bg-[var(--text-tertiary)]'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] hover:text-foreground hover:border-foreground/20 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    {isLastTab ? (
                                        <button
                                            type="submit"
                                            disabled={mutation.isPending}
                                            className="px-6 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50"
                                        >
                                            {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Class'}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(nextTab!.id)}
                                            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all"
                                        >
                                            {nextTab!.icon}
                                            Next: {nextTab!.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </form>
            </div>
        </div>
    );
}
