import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Clock,
    AlertTriangle,
    TrendingUp,
    RefreshCw,
    Search,
    Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { StatCounter } from '@/components/ui/StatCounter';
import { paymentsApi } from '../api/payments-api';
import { RecordPaymentDialog } from '../components/record-payment-dialog';
import type { PaymentSchedule } from '../types';

type ScheduleFilter = 'All' | 'Pending' | 'Late' | 'Paid';
type ActiveTab = 'schedule' | 'history';

const STATUS_PILL: Record<string, string> = {
    Pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Late:    'bg-red-500/10 text-red-400 border border-red-500/20',
    Paid:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

const TYPE_PILL: Record<string, { label: string; cls: string }> = {
    'Registration Fee':   { label: 'Reg. Fee',    cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    'First Month Payment':{ label: 'First Month', cls: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
    'Monthly Payment':    { label: 'Monthly',     cls: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' },
    // Legacy string fallbacks (pre-master-table records)
    'RegistrationFee':    { label: 'Reg. Fee',    cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    'MonthlyInitial':     { label: 'First Month', cls: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
    'RegularMonthly':     { label: 'Monthly',     cls: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' },
};

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtCurrency(n: number) {
    return `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PaymentsPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');
    const [filter, setFilter] = useState<ScheduleFilter>('All');
    const [search, setSearch] = useState('');
    const [selectedSchedule, setSelectedSchedule] = useState<PaymentSchedule | null>(null);

    const { data: summary } = useQuery({
        queryKey: ['payment-summary'],
        queryFn: paymentsApi.getSummary,
    });

    const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
        queryKey: ['payment-schedules'],
        queryFn: paymentsApi.getSchedules,
    });

    const { data: history = [], isLoading: historyLoading } = useQuery({
        queryKey: ['payment-history'],
        queryFn: paymentsApi.getHistory,
        enabled: activeTab === 'history',
    });

    const refreshMutation = useMutation({
        mutationFn: paymentsApi.refreshLate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
            toast.success('Late statuses refreshed');
        },
        onError: () => toast.error('Failed to refresh late statuses'),
    });

    const filteredSchedules = schedules.filter((s) => {
        if (filter !== 'All' && s.status !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                s.memberName.toLowerCase().includes(q) ||
                s.packageName.toLowerCase().includes(q) ||
                s.month.includes(q)
            );
        }
        return true;
    });

    const stats = [
        {
            label: 'Total Revenue',
            value: summary?.totalRevenue ?? 0,
            secondary: '',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'var(--primary)',
            isLKR: true,
        },
        {
            label: 'This Month',
            value: summary?.thisMonthRevenue ?? 0,
            secondary: `${summary?.paidThisMonth ?? 0} payments`,
            icon: <DollarSign className="w-5 h-5" />,
            color: 'var(--success)',
            isLKR: true,
        },
        {
            label: 'Pending',
            value: summary?.pendingCount ?? 0,
            secondary: fmtCurrency(summary?.pendingAmount ?? 0),
            icon: <Clock className="w-5 h-5" />,
            color: 'var(--warning)',
            isLKR: false,
        },
        {
            label: 'Late Payments',
            value: summary?.lateCount ?? 0,
            secondary: fmtCurrency(summary?.lateAmount ?? 0),
            icon: <AlertTriangle className="w-5 h-5" />,
            color: 'var(--destructive)',
            isLKR: false,
        },
    ];

    return (
        <div className="space-y-8 py-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-display font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">
                        PAYMENT <span className="text-[var(--primary)]">TRACKER</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-3 font-bold italic border-l-2 border-[var(--primary)] pl-4">
                        Track revenue, manage dues, and keep members on track.
                    </p>
                </motion.div>

                <button
                    onClick={() => refreshMutation.mutate()}
                    disabled={refreshMutation.isPending}
                    className="flex items-center gap-2 px-5 h-11 text-sm font-semibold bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-60"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                    Refresh Late Status
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                    >
                        <Card className="p-6 flex items-center gap-5 bg-[var(--surface)] border-white/5 relative overflow-hidden group" hover={true}>
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 transition-transform group-hover:scale-110 duration-300"
                                style={{ backgroundColor: stat.color, boxShadow: `0 8px 16px -4px ${stat.color}44` }}
                            >
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] mb-0.5">{stat.label}</p>
                                <div className="text-2xl font-display font-black text-[var(--text-primary)] leading-none">
                                    {stat.isLKR ? (
                                        <span>
                                            <span className="text-sm font-bold text-[var(--text-secondary)] mr-1">Rs.</span>
                                            <StatCounter value={stat.value} />
                                        </span>
                                    ) : (
                                        <StatCounter value={stat.value} />
                                    )}
                                </div>
                                {stat.secondary && (
                                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{stat.secondary}</p>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Tab Header */}
                <div className="flex items-center gap-1 p-1.5 bg-muted/30 border-b border-border">
                    {(['schedule', 'history'] as ActiveTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                                activeTab === tab
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab === 'schedule' ? 'Payment Schedule' : 'Payment History'}
                        </button>
                    ))}
                </div>

                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                    <div>
                        {/* Filters Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-b border-border">
                            <div className="flex gap-2 flex-wrap">
                                {(['All', 'Pending', 'Late', 'Paid'] as ScheduleFilter[]).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                            filter === f
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                                        }`}
                                    >
                                        {f}
                                        {f !== 'All' && (
                                            <span className="ml-1.5 opacity-70">
                                                {schedules.filter((s) => s.status === f).length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="relative sm:ml-auto sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search member, package..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {schedulesLoading ? (
                                <div className="p-12 text-center text-muted-foreground text-sm">Loading schedules...</div>
                            ) : filteredSchedules.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">No payment schedules found</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Package</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Month</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredSchedules.map((s) => {
                                            const type = TYPE_PILL[s.paymentType] ?? { label: s.paymentType, cls: 'bg-muted/50 text-muted-foreground' };
                                            return (
                                                <tr key={s.id} className="hover:bg-muted/20 transition-colors group">
                                                    <td className="px-5 py-3.5 font-medium text-foreground whitespace-nowrap">{s.memberName}</td>
                                                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{s.packageName || '—'}</td>
                                                    <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">{s.month}</td>
                                                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{fmtDate(s.dueDate)}</td>
                                                    <td className="px-4 py-3.5 text-right font-semibold text-foreground whitespace-nowrap">
                                                        Rs. {s.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${type.cls}`}>
                                                            {type.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_PILL[s.status] ?? ''}`}>
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        {s.status !== 'Paid' ? (
                                                            <button
                                                                onClick={() => setSelectedSchedule(s)}
                                                                className="px-3.5 py-1.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                Record
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground/50">
                                                                {s.paidDate ? fmtDate(s.paidDate) : '—'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div>
                        {historyLoading ? (
                            <div className="p-12 text-center text-muted-foreground text-sm">Loading history...</div>
                        ) : history.length === 0 ? (
                            <div className="p-12 text-center">
                                <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">No payment records found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Method</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {history.map((h) => {
                                                const type = TYPE_PILL[h.paymentTypeName] ?? { label: h.paymentTypeName, cls: 'bg-muted/50 text-muted-foreground' };
                                            return (
                                                <tr key={h.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{fmtDate(h.date)}</td>
                                                    <td className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">{h.memberName}</td>
                                                    <td className="px-4 py-3.5 text-muted-foreground">{h.planName || '—'}</td>
                                                    <td className="px-4 py-3.5 text-right font-semibold text-foreground whitespace-nowrap">
                                                        Rs. {h.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${type.cls}`}>
                                                            {type.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-muted-foreground">{h.method}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_PILL[h.status] ?? 'bg-muted/50 text-muted-foreground'}`}>
                                                            {h.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Record Payment Dialog */}
            <RecordPaymentDialog
                schedule={selectedSchedule}
                isOpen={!!selectedSchedule}
                onClose={() => setSelectedSchedule(null)}
            />
        </div>
    );
}
