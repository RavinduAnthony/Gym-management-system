// src/features/settings/components/WorkingHoursSettings.tsx
import { Clock, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { api } from '@/core/api/axios-instance';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DaySchedule {
    day: string;
    open: string;
    close: string;
    closed: boolean;
}

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map((day) => ({
    day,
    open: day === 'Sunday' ? '08:00' : '05:00',
    close: day === 'Sunday' ? '14:00' : '22:00',
    closed: false,
}));

export function WorkingHoursSettings() {
    const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        api.get('/workinghours')
            .then(res => {
                const data: Array<{ day: string; openTime: string; closeTime: string; isClosed: boolean }> =
                    res.data?.data ?? [];
                if (data.length > 0) {
                    setSchedule(data.map(d => ({
                        day: d.day,
                        open: d.openTime,
                        close: d.closeTime,
                        closed: d.isClosed,
                    })));
                }
            })
            .catch(() => { /* keep defaults */ })
            .finally(() => setIsLoading(false));
    }, []);

    const updateDay = (index: number, field: keyof DaySchedule, value: string | boolean) => {
        setSchedule((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/workinghours', schedule.map(s => ({
                day: s.day,
                openTime: s.open,
                closeTime: s.close,
                isClosed: s.closed,
            })));
            toast.success('Working hours saved successfully!');
        } catch {
            toast.error('Failed to save working hours.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3 mb-1">
                    <Clock className="w-5 h-5 text-[var(--warning)]" /> Working Hours
                </h3>
                <p className="text-[var(--text-tertiary)] text-xs font-bold">Define your facility's operational schedule</p>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[1.5fr_1fr_1fr_0.6fr] gap-4 px-6 py-4 bg-[var(--surface-alt)]/50 border-b border-[var(--border)]">
                    <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Day</span>
                    <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] flex items-center gap-2"><Sun className="w-3 h-3" /> Opens</span>
                    <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] flex items-center gap-2"><Moon className="w-3 h-3" /> Closes</span>
                    <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] text-center">Status</span>
                </div>

                {/* Schedule Rows */}
                {isLoading ? (
                    <div className="px-6 py-8 text-sm font-bold text-[var(--text-tertiary)] animate-pulse text-center">
                        Loading schedule...
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border)]">
                        {schedule.map((s, i) => {
                            const isWeekend = s.day === 'Saturday' || s.day === 'Sunday';
                            return (
                                <div
                                    key={s.day}
                                    className={`grid grid-cols-[1.5fr_1fr_1fr_0.6fr] gap-4 px-6 py-4 items-center transition-all ${s.closed ? 'opacity-40' : 'hover:bg-[var(--surface-alt)]/30'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${isWeekend ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`} />
                                        <span className="font-bold text-white text-sm">{s.day}</span>
                                        {isWeekend && <span className="text-[8px] font-black text-[var(--warning)] uppercase tracking-widest bg-[var(--warning)]/10 px-2 py-0.5 rounded-full">Weekend</span>}
                                    </div>
                                    <input
                                        type="time"
                                        value={s.open}
                                        onChange={(e) => updateDay(i, 'open', e.target.value)}
                                        disabled={s.closed}
                                        className="bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg py-2.5 px-4 text-sm font-bold text-white outline-none focus:border-[var(--primary)] transition-all disabled:opacity-30"
                                    />
                                    <input
                                        type="time"
                                        value={s.close}
                                        onChange={(e) => updateDay(i, 'close', e.target.value)}
                                        disabled={s.closed}
                                        className="bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg py-2.5 px-4 text-sm font-bold text-white outline-none focus:border-[var(--primary)] transition-all disabled:opacity-30"
                                    />
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => updateDay(i, 'closed', !s.closed)}
                                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                s.closed
                                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                                    : 'bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]'
                                            }`}
                                        >
                                            {s.closed ? 'CLOSED' : 'OPEN'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <Button variant="primary" className="px-10 h-12" onClick={handleSave} disabled={isSaving || isLoading}>
                    {isSaving ? 'SAVING...' : 'SAVE SCHEDULE'}
                </Button>
            </div>
        </div>
    );
}

