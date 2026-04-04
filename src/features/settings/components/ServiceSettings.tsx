import { useState, useEffect } from 'react';
import { Layers, Users, CalendarRange, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useServiceSettings, useUpdateServiceSetting } from '@/hooks/useServiceSettings';
import type { ServiceSetting, ServiceType } from '@/features/settings/api/service-settings-api';
import { ClassTypeSettings } from './ClassTypeSettings';

const SERVICE_META: Record<ServiceType, { label: string; description: string; icon: React.ElementType; color: string }> = {
    Classes: {
        label: 'Classes',
        description: 'Group fitness sessions, yoga, Zumba, etc.',
        icon: CalendarRange,
        color: 'text-[var(--secondary)]',
    },
    PersonalTrainers: {
        label: 'Personal Trainers',
        description: 'One-on-one personal training sessions.',
        icon: Users,
        color: 'text-[var(--primary)]',
    },
};

function ServiceCard({ setting }: { setting: ServiceSetting }) {
    const updateSetting = useUpdateServiceSetting();
    const meta = SERVICE_META[setting.serviceType];

    const [amount, setAmount] = useState(setting.defaultAmount.toString());
    const [notes, setNotes] = useState(setting.notes ?? '');
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setAmount(setting.defaultAmount.toString());
        setNotes(setting.notes ?? '');
        setIsDirty(false);
    }, [setting.defaultAmount, setting.notes]);

    const handleAmountChange = (val: string) => {
        setAmount(val);
        setIsDirty(true);
    };

    const handleNotesChange = (val: string) => {
        setNotes(val);
        setIsDirty(true);
    };

    const handleSave = () => {
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed < 0) return;
        updateSetting.mutate(
            { serviceType: setting.serviceType, data: { defaultAmount: parsed, notes: notes.trim() || undefined } },
            { onSuccess: () => setIsDirty(false) }
        );
    };

    const Icon = meta.icon;

    return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                </div>
                <div>
                    <h4 className="text-base font-black text-white uppercase tracking-wider">{meta.label}</h4>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{meta.description}</p>
                </div>
            </div>

            {/* Default Amount */}
            <div>
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">
                    Default Payment Amount
                </label>
                <div className="flex items-center gap-0">
                    <span className="h-11 px-4 flex items-center bg-[var(--surface-alt)] border border-r-0 border-[var(--border)] rounded-l-xl text-sm font-black text-[var(--text-secondary)] select-none">
                        LKR
                    </span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={e => handleAmountChange(e.target.value)}
                        className="flex-1 h-11 bg-[var(--surface)] border border-[var(--border)] rounded-r-xl px-4 text-sm font-bold text-white outline-none focus:border-[var(--primary)]/60 transition-colors"
                        placeholder="0.00"
                    />
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
                    This amount will be pre-filled when creating a payment for this service type.
                </p>
            </div>

            {/* Notes */}
            <div>
                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">
                    Notes <span className="font-normal normal-case">(optional)</span>
                </label>
                <input
                    type="text"
                    value={notes}
                    onChange={e => handleNotesChange(e.target.value)}
                    placeholder="e.g. Includes equipment, weekend rate applies..."
                    className="w-full h-11 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 text-sm text-white placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--primary)]/60 transition-colors"
                />
            </div>

            {/* Save */}
            <div className="flex justify-end pt-1">
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={!isDirty || updateSetting.isPending}
                    className="h-11 px-6 text-xs gap-2"
                >
                    <Save className="w-3.5 h-3.5" />
                    {updateSetting.isPending ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </div>
    );
}

export function ServiceSettings() {
    const { data: settings, isLoading } = useServiceSettings();

    return (
        <div className="space-y-8 pb-10">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
                <div className="mb-8">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <Layers className="w-5 h-5 text-[var(--primary)]" /> Service Settings
                    </h3>
                    <p className="text-[var(--text-tertiary)] text-xs font-bold mt-1">
                        Configure default payment amounts for each service type
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[0, 1].map(i => (
                            <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 h-64 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {settings?.map(setting => (
                            <ServiceCard key={setting.id} setting={setting} />
                        ))}
                    </div>
                )}
            </div>

            {/* Class Type Management */}
            <ClassTypeSettings />
        </div>
    );
}
