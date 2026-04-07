import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, CalendarRange, Users, CreditCard, MapPin, Clock, Info, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomDateInput } from '@/components/ui/CustomDateInput';
import { gymClassSchema, type GymClassFormData, type GymClass, type TimeSlotItem } from '../schemas/class-service-schema';
import { gymClassesApi } from '../api/class-services-api';
import { classTimeSlotsApi } from '../api/class-timeslots-api';
import { trainersApi } from '@/features/trainers/api/trainers-api';
import { useBranches } from '@/hooks/useBranches';
import { useServiceSettings } from '@/hooks/useServiceSettings';
import { useClassTypes } from '@/hooks/useClassTypes';
import { useWorkingHours } from '@/hooks/useWorkingHours';

// ─── Constants ─────────────────────────────────────────

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT: Record<string, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
    Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

// ─── Required fields per tab ──────────────────────────
const TAB_REQUIRED_FIELDS: Record<string, (keyof GymClassFormData)[]> = {
    basic:      ['name'],
    location:   ['branchId'],
    instructor: ['instructorId'],
    schedule:   ['timeSlots', 'batchStartDate'],
    pricing:    ['maxCapacity'],
};

type Tab = 'location' | 'basic' | 'instructor' | 'schedule' | 'pricing';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'basic',      label: 'Basic Info', icon: <Info className="w-4 h-4" /> },
    { id: 'location',   label: 'Location',   icon: <MapPin className="w-4 h-4" /> },
    { id: 'instructor', label: 'Instructor', icon: <Users className="w-4 h-4" /> },
    { id: 'schedule',   label: 'Schedule',   icon: <CalendarRange className="w-4 h-4" /> },
    { id: 'pricing',    label: 'Capacity',   icon: <CreditCard className="w-4 h-4" /> },
];

// ─── Slot helpers ──────────────────────────────────────

function generateSlots(openTime: string, closeTime: string): string[] {
    const slots: string[] = [];
    const [oh, om] = openTime.split(':').map(Number);
    const [ch, cm] = closeTime.split(':').map(Number);
    let cur = oh * 60 + om;
    const end = ch * 60 + cm;
    while (cur + 30 <= end) {
        slots.push(
            `${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`
        );
        cur += 30;
    }
    return slots;
}

function addMinutes(time: string, min: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + min;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function slotKey(day: string, startTime: string) { return `${day}|${startTime}`; }

function formatTime12(t: string): string {
    const [h, m] = t.split(':').map(Number);
    const suffix = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

// ─── Component ─────────────────────────────────────────

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: GymClass | null;
}

export function GymClassFormDialog({ isOpen, onClose, initialData }: Props) {
    const isEditing = !!initialData;
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>('location');

    const { data: branches, isLoading: branchesLoading } = useBranches();
    const { data: serviceSettings } = useServiceSettings();
    const { data: classTypes, isLoading: classTypesLoading } = useClassTypes();
    const { data: workingHours } = useWorkingHours();
    const { data: trainers, isLoading: trainersLoading } = useQuery({
        queryKey: ['trainers'],
        queryFn: trainersApi.getTrainers,
    });

    const classDefaultHourlyRate =
        serviceSettings?.find((s: any) => s.serviceType === 'Classes')?.defaultAmount ?? 0;

    // ─── Form ──────────────────────────────────────────
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useForm<GymClassFormData>({
        resolver: zodResolver(gymClassSchema) as any,
        defaultValues: {
            branchId: '',
            name: '', category: '', description: '',
            instructorId: '',
            timeSlots: [],
            batchStartDate: '', batchEndDate: '',
            maxCapacity: 20,
            hourlyRate: 0,
            defaultAmount: 0,
            status: 'Active',
        },
    });

    const branchId = watch('branchId');
    const hourlyRate = watch('hourlyRate');

    // ─── Occupied slots for selected branch ───────────
    const { data: occupiedSlots } = useQuery({
        queryKey: ['classTimeSlots', branchId, isEditing ? initialData?.id : null],
        queryFn: () => classTimeSlotsApi.getByBranch(branchId, isEditing ? initialData?.id : undefined),
        enabled: !!branchId,
    });

    const occupiedKeys = new Set(
        (occupiedSlots ?? []).map(s => slotKey(s.dayOfWeek, s.startTime))
    );
    const occupiedByClass: Map<string, string> = new Map(
        (occupiedSlots ?? []).map(s => [slotKey(s.dayOfWeek, s.startTime), s.className])
    );

    // ─── Selected slots local state ────────────────────
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const syncTimeSlots = useCallback((keys: Set<string>) => {
        const items: TimeSlotItem[] = Array.from(keys).map(k => {
            const [day, start] = k.split('|');
            return { dayOfWeek: day, startTime: start, endTime: addMinutes(start, 30) };
        });
        setValue('timeSlots', items, { shouldValidate: true });
        const totalHoursPerWeek = keys.size * 0.5;
        setValue('defaultAmount', parseFloat((totalHoursPerWeek * 4 * (hourlyRate || 0)).toFixed(2)));
    }, [setValue, hourlyRate]);

    const toggleSlot = (day: string, startTime: string) => {
        const key = slotKey(day, startTime);
        if (occupiedKeys.has(key)) return;
        const next = new Set(selectedKeys);
        if (next.has(key)) next.delete(key); else next.add(key);
        setSelectedKeys(next);
        syncTimeSlots(next);
    };

    // Recalc monthly fee when hourlyRate changes
    useEffect(() => {
        const totalHoursPerWeek = selectedKeys.size * 0.5;
        setValue('defaultAmount', parseFloat((totalHoursPerWeek * 4 * (hourlyRate || 0)).toFixed(2)));
    }, [hourlyRate, selectedKeys.size, setValue]);

    // ─── Reset on open ──────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        setActiveTab('basic');
        setSelectedDay(null);

        if (initialData) {
            // Expand per-day schedules → individual 30-min slot chips for the picker
            const expandedSlots: TimeSlotItem[] = (initialData.schedules ?? []).flatMap(sched => {
                const [sh, sm] = sched.startTime.split(':').map(Number);
                const [eh, em] = sched.endTime.split(':').map(Number);
                const items: TimeSlotItem[] = [];
                let cur = sh * 60 + sm;
                const end = eh * 60 + em;
                while (cur + 30 <= end) {
                    const startStr = `${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`;
                    items.push({ dayOfWeek: sched.dayOfWeek, startTime: startStr, endTime: addMinutes(startStr, 30) });
                    cur += 30;
                }
                return items;
            });
            const keys = new Set(expandedSlots.map(s => slotKey(s.dayOfWeek, s.startTime)));
            setSelectedKeys(keys);
            reset({
                branchId: initialData.branchId ?? '',
                name: initialData.name,
                category: initialData.category ?? '',
                description: initialData.description ?? '',
                instructorId: initialData.instructorId ?? '',
                timeSlots: expandedSlots,
                batchStartDate: initialData.batchStartDate?.split('T')[0] ?? '',
                batchEndDate: initialData.batchEndDate?.split('T')[0] ?? '',
                maxCapacity: initialData.maxCapacity,
                hourlyRate: initialData.hourlyRate ?? classDefaultHourlyRate,
                defaultAmount: initialData.defaultAmount,
                status: initialData.status as 'Active' | 'Inactive',
            });
        } else {
            setSelectedKeys(new Set());
            reset({
                branchId: '',
                name: '', category: '', description: '',
                instructorId: '',
                timeSlots: [],
                batchStartDate: '', batchEndDate: '',
                maxCapacity: 20,
                hourlyRate: classDefaultHourlyRate,
                defaultAmount: 0,
                status: 'Active',
            });
        }
    }, [isOpen, initialData, reset, classDefaultHourlyRate]);

    // ─── Mutation ──────────────────────────────────────
    const mutation = useMutation({
        mutationFn: (data: GymClassFormData) =>
            isEditing && initialData?.id
                ? gymClassesApi.update(initialData.id, data)
                : gymClassesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gymClasses'] });
            queryClient.invalidateQueries({ queryKey: ['classTimeSlots'] });
            toast.success(isEditing ? 'Class updated successfully' : 'Class registered successfully');
            onClose();
        },
        onError: () => toast.error('Failed to save class'),
    });

    const onSubmit = (data: GymClassFormData) => mutation.mutate(data);
    const onValidationError = (errs: any) => {
        const first = Object.values(errs)[0] as any;
        const msg = first?.message ?? first?.root?.message ?? 'Please fill in all required fields';
        toast.error(msg);
    };
    const selectedInstructor = trainers?.find((t: any) => t.id === watch('instructorId'));

    if (!isOpen) return null;

    // ─── Styles ────────────────────────────────────────
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

    const totalHoursPerWeek = selectedKeys.size * 0.5;
    const monthlyFee = totalHoursPerWeek * 4 * (hourlyRate || 0);

    // ─── Render ────────────────────────────────────────
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
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
                            <CalendarRange className="w-4 h-4 text-[var(--primary)]" />
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
                <form
                    onSubmit={handleSubmit(onSubmit, onValidationError)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') e.preventDefault(); }}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <div className="flex-1 overflow-y-auto p-6">

                        {/* ─── Location (first) ─── */}
                        {activeTab === 'location' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Branch *</label>
                                    <p className="text-[10px] text-[var(--text-tertiary)] mb-3">
                                        Select a branch first — time slot availability is branch-specific.
                                    </p>
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

                                {branchId && (
                                    <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                                            <span className="text-xs font-black text-[var(--primary)] uppercase tracking-wider">Branch Selected</span>
                                        </div>
                                        <p className="text-sm text-foreground font-bold">
                                            {(branches ?? []).find((b: any) => b.id === branchId)?.name ?? ''}
                                        </p>
                                        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                                            Time slot availability loaded for this branch.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

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
                                                        <span key={i} className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold border border-[var(--primary)]/20">
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
                            <div className="space-y-5">
                                {/* Hourly rate (editable per class) */}
                                <div>
                                    <label className={labelCls}>Hourly Rate (LKR/hr)</label>
                                    <div className="flex">
                                        <span className="px-3 flex items-center bg-[var(--surface-alt)] border border-r-0 border-[var(--border)] rounded-l-xl text-xs font-black text-[var(--text-secondary)]">LKR/hr</span>
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            {...register('hourlyRate', { valueAsNumber: true })}
                                            placeholder="0.00"
                                            className={`${inputCls} rounded-l-none`}
                                        />
                                    </div>
                                    {classDefaultHourlyRate > 0 && (
                                        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                                            Default from Service Settings: LKR {classDefaultHourlyRate.toLocaleString()}/hr
                                        </p>
                                    )}
                                </div>

                                {/* Monthly fee live preview */}
                                {selectedKeys.size > 0 && (
                                    <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-black mb-1">Monthly Fee</p>
                                                <p className="text-lg font-black text-[var(--primary)]">
                                                    LKR {monthlyFee.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div className="text-right text-[10px] text-[var(--text-tertiary)]">
                                                <p>{totalHoursPerWeek} hrs/week</p>
                                                <p>× 4 weeks × LKR {(hourlyRate || 0).toLocaleString()}/hr</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
                                            {selectedKeys.size} slot{selectedKeys.size !== 1 ? 's' : ''} selected
                                            ({totalHoursPerWeek} hr{totalHoursPerWeek !== 1 ? 's' : ''}/week)
                                        </p>
                                    </div>
                                )}

                                {/* Slot picker — two-step: day grid → slot chips */}
                                {!branchId ? (
                                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
                                        <MapPin className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                                        <p className="text-xs text-amber-600 font-bold">Select a branch in the Location tab first</p>
                                    </div>
                                ) : (workingHours ?? []).length === 0 ? (
                                    <p className="text-xs text-[var(--text-tertiary)]">No working hours configured. Set them in Settings → Working Hours.</p>
                                ) : selectedDay === null ? (
                                    /* ── Step 1: Day grid ── */
                                    <div>
                                        <label className={labelCls}>Select a Day *</label>
                                        <p className="text-[10px] text-[var(--text-tertiary)] mb-4">
                                            Tap a day to choose time slots. Closed days are dimmed.
                                        </p>
                                        <div className="grid grid-cols-7 gap-2">
                                            {DAY_ORDER.map(day => {
                                                const wh = (workingHours ?? []).find(w => w.day === day);
                                                const isClosed = !wh || wh.isClosed;
                                                const slots = isClosed ? [] : generateSlots(wh!.openTime, wh!.closeTime);
                                                const countSelected = slots.filter(s => selectedKeys.has(slotKey(day, s))).length;
                                                return (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        disabled={isClosed}
                                                        onClick={() => setSelectedDay(day)}
                                                        className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all ${
                                                            isClosed
                                                                ? 'border-[var(--border)] bg-[var(--surface-alt)]/20 opacity-40 cursor-not-allowed'
                                                                : countSelected > 0
                                                                    ? 'border-[var(--primary)] bg-[var(--primary)]/8 text-[var(--primary)]'
                                                                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 text-foreground'
                                                        }`}
                                                    >
                                                        <span className="text-[11px] font-black">{DAY_SHORT[day] ?? day}</span>
                                                        <span className={`text-[9px] font-bold mt-1 ${
                                                            isClosed ? 'text-[var(--text-tertiary)]' :
                                                            countSelected > 0 ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'
                                                        }`}>
                                                            {isClosed ? 'Closed' : countSelected > 0 ? `${countSelected * 0.5}h` : '—'}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.timeSlots && (
                                            <p className={`${errorCls} mt-3`}>{(errors.timeSlots as any).message}</p>
                                        )}
                                    </div>
                                ) : (() => {
                                    /* ── Step 2: Slot chips for selected day ── */
                                    const wh = (workingHours ?? []).find(w => w.day === selectedDay)!;
                                    const slots = generateSlots(wh.openTime, wh.closeTime);
                                    return (
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedDay(null)}
                                                    className="flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)] hover:text-foreground transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                    All Days
                                                </button>
                                                <div className="h-4 w-px bg-[var(--border)]" />
                                                <span className="text-sm font-black text-foreground">{selectedDay}</span>
                                                <span className="text-xs text-[var(--text-tertiary)]">
                                                    {formatTime12(wh.openTime)} – {formatTime12(wh.closeTime)}
                                                </span>
                                            </div>
                                            <label className={labelCls}>Time Slots</label>
                                            <p className="text-[10px] text-[var(--text-tertiary)] mb-3">
                                                Click to select. Each slot = 30 min. Grayed = taken by another class.
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {slots.map(start => {
                                                    const key = slotKey(selectedDay, start);
                                                    const isSelected = selectedKeys.has(key);
                                                    const isOccupied = occupiedKeys.has(key);
                                                    return (
                                                        <button
                                                            key={start}
                                                            type="button"
                                                            disabled={isOccupied}
                                                            onClick={() => toggleSlot(selectedDay, start)}
                                                            title={isOccupied
                                                                ? `Taken by: ${occupiedByClass.get(key)}`
                                                                : `${formatTime12(start)} – ${formatTime12(addMinutes(start, 30))}`}
                                                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                                                                isOccupied
                                                                    ? 'bg-[var(--surface-alt)] border-[var(--border)] text-[var(--text-tertiary)] opacity-40 cursor-not-allowed line-through'
                                                                    : isSelected
                                                                        ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                                                                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)]'
                                                            }`}
                                                        >
                                                            {start}–{addMinutes(start, 30)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Batch dates */}
                                <div className="grid grid-cols-2 gap-4 pt-1 border-t border-[var(--border)]">
                                    <div>
                                        <label className={labelCls}>Batch Start Date *</label>
                                        <CustomDateInput
                                            {...register('batchStartDate')}
                                            value={watch('batchStartDate') ?? ''}
                                        />
                                        {errors.batchStartDate && <p className={errorCls}>{errors.batchStartDate.message}</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls}>Batch End Date</label>
                                        <CustomDateInput
                                            {...register('batchEndDate')}
                                            value={watch('batchEndDate') ?? ''}
                                        />
                                        {errors.batchEndDate && <p className={errorCls}>{errors.batchEndDate.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── Capacity ─── */}
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

                                {/* Pricing summary */}
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/30 p-4 space-y-3">
                                    <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Pricing Summary</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[var(--text-secondary)]">Hourly Rate</span>
                                        <span className="text-sm font-bold text-foreground">LKR {(hourlyRate || 0).toLocaleString()}/hr</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[var(--text-secondary)]">Weekly Hours</span>
                                        <span className="text-sm font-bold text-foreground">
                                            {totalHoursPerWeek} hr{totalHoursPerWeek !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                                        <span className="text-xs font-black text-foreground uppercase tracking-wider">Monthly Fee</span>
                                        <span className={`text-base font-black ${monthlyFee > 0 ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`}>
                                            {monthlyFee > 0
                                                ? `LKR ${monthlyFee.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
                                                : '—'}
                                        </span>
                                    </div>
                                    {selectedKeys.size === 0 && (
                                        <p className="text-[10px] text-amber-500/80 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Select time slots in the Schedule tab to calculate
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {(() => {
                        const currentIndex = TABS.findIndex(t => t.id === activeTab);
                        const isLastTab = currentIndex === TABS.length - 1;
                        const nextTab = !isLastTab ? TABS[currentIndex + 1] : null;
                        return (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-alt)]/20 shrink-0">
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
                                            type="button"
                                            disabled={mutation.isPending}
                                            onClick={() => handleSubmit(onSubmit, onValidationError)()}
                                            className="px-6 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50"
                                        >
                                            {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Class'}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const fields = TAB_REQUIRED_FIELDS[activeTab] ?? [];
                                                const valid = fields.length === 0 || await trigger(fields);
                                                if (valid) setActiveTab(nextTab!.id);
                                            }}
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
