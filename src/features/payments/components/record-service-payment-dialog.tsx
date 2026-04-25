import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CustomDateInput } from '@/components/ui/CustomDateInput';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { paymentsApi } from '../api/payments-api';
import type { ServicePaymentSchedule } from '../types';

interface Props {
    schedule: ServicePaymentSchedule | null;
    isOpen: boolean;
    onClose: () => void;
}

export function RecordServicePaymentDialog({ schedule, isOpen, onClose }: Props) {
    const queryClient = useQueryClient();
    const [amount, setAmount]   = useState('');
    const [method, setMethod]   = useState('Cash');
    const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes]     = useState('');

    if (isOpen && schedule && amount === '') {
        setAmount(String(schedule.amount));
    }

    const mutation = useMutation({
        mutationFn: () =>
            paymentsApi.recordServicePayment({
                scheduleId: schedule!.id,
                amount: parseFloat(amount) || schedule!.amount,
                method,
                paidDate: paidDate ? new Date(paidDate).toISOString() : undefined,
                notes: notes.trim() || undefined,
            }),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['service-payment-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['service-payment-history'] });
            queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
            const isLate = updated.status === 'Late';
            toast.success(isLate
                ? 'Service payment recorded — marked as LATE'
                : 'Service payment recorded successfully');
            handleClose();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message ?? 'Failed to record service payment');
        },
    });

    const handleClose = () => {
        setAmount('');
        setMethod('Cash');
        setPaidDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        onClose();
    };

    if (!isOpen || !schedule) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/10 rounded-lg">
                            <CreditCard className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">Record Service Payment</h2>
                            <p className="text-xs text-muted-foreground">
                                {schedule.serviceType === 'Class' ? 'Gym Class' : 'Personal Trainer'} — {schedule.month}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Service info */}
                <div className="px-6 py-3 bg-muted/30 border-b border-border">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{schedule.serviceName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            schedule.serviceType === 'Class'
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-purple-500/10 text-purple-400'
                        }`}>
                            {schedule.serviceType === 'Class' ? 'Class' : 'PT'}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Due: {new Date(schedule.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}Settlement window: last week of {schedule.month}
                    </p>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                            Amount (Rs.)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <CustomSelect
                        label="Payment Method"
                        value={method}
                        onChange={setMethod}
                        options={[
                            { value: 'Cash',         label: 'Cash' },
                            { value: 'Card',         label: 'Card' },
                            { value: 'BankTransfer', label: 'Bank Transfer' },
                        ]}
                    />

                    <CustomDateInput
                        label="Payment Date"
                        value={paidDate}
                        onChange={setPaidDate}
                    />

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <p className="text-xs text-amber-400">
                            <span className="font-bold">Late payment rule:</span> Payments received in week 1 of the following month
                            are credited to the previous billing month and marked as <span className="font-bold">Late</span>.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => mutation.mutate()}
                            disabled={mutation.isPending}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition-colors disabled:opacity-60"
                        >
                            {mutation.isPending ? 'Recording...' : 'Record Payment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
