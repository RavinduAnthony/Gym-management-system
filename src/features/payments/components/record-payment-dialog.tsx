import { useState } from 'react';
import { X, CreditCard, CalendarDays, StickyNote } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CustomDateInput } from '@/components/ui/CustomDateInput';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { paymentsApi } from '../api/payments-api';
import type { PaymentSchedule } from '../types';

interface Props {
    schedule: PaymentSchedule | null;
    isOpen: boolean;
    onClose: () => void;
}

// Legacy fallback map (for any old data that still has string type names)
const LEGACY_TYPE_LABELS: Record<string, string> = {
    RegistrationFee: 'Registration Fee',
    MonthlyInitial: 'First Month Payment',
    RegularMonthly: 'Monthly Payment',
};

export function RecordPaymentDialog({ schedule, isOpen, onClose }: Props) {
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Cash');
    const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    // Sync amount when schedule changes
    if (isOpen && schedule && amount === '') {
        setAmount(String(schedule.amount));
    }

    const mutation = useMutation({
        mutationFn: () =>
            paymentsApi.recordPayment({
                scheduleId: schedule!.id,
                amount: parseFloat(amount) || schedule!.amount,
                method,
                paidDate: paidDate ? new Date(paidDate).toISOString() : undefined,
                notes: notes.trim() || undefined,
            }),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
            queryClient.invalidateQueries({ queryKey: ['payment-history'] });
            const isLate = updated.status === 'Late';
            toast.success(
                isLate
                    ? 'Payment recorded — marked as LATE (after 7th)'
                    : 'Payment recorded successfully'
            );
            handleClose();
        },
        onError: () => {
            toast.error('Failed to record payment');
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

    const typeLabel = schedule.paymentTypeName || LEGACY_TYPE_LABELS[schedule.paymentTypeName] || 'Payment';
    const dueFormatted = new Date(schedule.dueDate).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">Record Payment</h2>
                            <p className="text-xs text-muted-foreground">{typeLabel}</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Member info summary */}
                <div className="px-6 py-3 bg-muted/30 border-b border-border">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{schedule.memberName}</span>
                        <span className="text-muted-foreground">{schedule.packageName}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Month: <span className="text-foreground font-medium">{schedule.month}</span></span>
                        <span>Due: <span className="text-foreground font-medium">{dueFormatted}</span></span>
                        {schedule.status === 'Late' && (
                            <span className="text-red-500 font-semibold">LATE</span>
                        )}
                    </div>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Amount (LKR)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">Rs.</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Payment Method
                        </label>
                        <CustomSelect
                            value={method}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMethod(e.target.value)}
                            options={[
                                { value: 'Cash', label: 'Cash' },
                                { value: 'Card', label: 'Card' },
                                { value: 'BankTransfer', label: 'Bank Transfer' },
                            ]}
                        />
                    </div>

                    {/* Payment Date */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            <CalendarDays className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                            Payment Date
                        </label>
                        <CustomDateInput
                            value={paidDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaidDate(e.target.value)}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            Payments after the 7th of the due month are automatically marked as Late.
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            <StickyNote className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Any remarks..."
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={mutation.isPending || !amount}
                        onClick={() => mutation.mutate()}
                        className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {mutation.isPending ? 'Recording...' : 'Record Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
}
