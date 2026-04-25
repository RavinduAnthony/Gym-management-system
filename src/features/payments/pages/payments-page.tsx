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
    Users,
    Dumbbell,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { StatCounter } from '@/components/ui/StatCounter';
import { paymentsApi } from '../api/payments-api';
import { RecordPaymentDialog } from '../components/record-payment-dialog';
import { RecordServicePaymentDialog } from '../components/record-service-payment-dialog';
import type { PaymentSchedule, ServicePaymentSchedule } from '../types';

type ScheduleFilter = 'All' | 'Pending' | 'Late' | 'Paid';
type ActiveTab = 'schedule' | 'history';
type ActiveSection = 'members' | 'services';

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

const SERVICE_TYPE_PILL: Record<string, { label: string; cls: string }> = {
    Class: { label: 'Gym Class',        cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    PT:    { label: 'Personal Trainer', cls: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
};

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtCurrency(n: number) {
    return `Rs. ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PaymentsPage() {
    const queryClient = useQueryClient();

    // ─── Section + tab state ────────────────────────────────────────────────
    const [activeSection, setActiveSection]             = useState<ActiveSection>('members');
    const [memberTab, setMemberTab]                     = useState<ActiveTab>('schedule');
    const [serviceTab, setServiceTab]                   = useState<ActiveTab>('schedule');

    // ─── Filters ────────────────────────────────────────────────────────────
    const [filter, setFilter]                           = useState<ScheduleFilter>('All');
    const [search, setSearch]                           = useState('');
    const [serviceFilter, setServiceFilter]             = useState<ScheduleFilter>('All');
    const [serviceSearch, setServiceSearch]             = useState('');
    const [serviceTypeFilter, setServiceTypeFilter]     = useState<'All' | 'Class' | 'PT'>('All');

    // ─── Dialogs ────────────────────────────────────────────────────────────
    const [selectedSchedule, setSelectedSchedule]               = useState<PaymentSchedule | null>(null);
    const [selectedServiceSchedule, setSelectedServiceSchedule] = useState<ServicePaymentSchedule | null>(null);

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
        enabled: memberTab === 'history',
    });

    const { data: serviceSchedules = [], isLoading: serviceSchedulesLoading } = useQuery({
        queryKey: ['service-payment-schedules'],
        queryFn: paymentsApi.getServiceSchedules,
        enabled: activeSection === 'services',
    });

    const { data: serviceHistory = [], isLoading: serviceHistoryLoading } = useQuery({
        queryKey: ['service-payment-history'],
        queryFn: paymentsApi.getServiceHistory,
        enabled: activeSection === 'services' && serviceTab === 'history',
    });

    const refreshMutation = useMutation({
        mutationFn: async () => {
            await paymentsApi.refreshLate();
            await paymentsApi.refreshServiceLate();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['service-payment-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['payment-summary'] });
            toast.success('Late statuses refreshed');
        },
        onError: () => toast.error('Failed to refresh late statuses'),
    });

    const generateMutation = useMutation({
        mutationFn: () => paymentsApi.generateServiceSchedules(),
        onSuccess: (count) => {
            queryClient.invalidateQueries({ queryKey: ['service-payment-schedules'] });
            toast.success(`Generated ${count} service payment schedule(s)`);
        },
        onError: () => toast.error('Failed to generate service schedules'),
    });

    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-04"
    const thisMonthSchedules = schedules.filter((s) => s.month === currentMonth);

    const filteredSchedules = thisMonthSchedules.filter((s) => {
        if (filter !== 'All' && s.status !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                s.memberName.toLowerCase().includes(q) ||
                s.packageName.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const pendingThisMonth = thisMonthSchedules.filter((s) => s.status === 'Pending');
    const lateThisMonth    = thisMonthSchedules.filter((s) => s.status === 'Late');

    const thisMonthServiceSchedules = serviceSchedules.filter((s) => s.month === currentMonth);
    const pendingService = thisMonthServiceSchedules.filter((s) => s.status === 'Pending');
    const lateService    = thisMonthServiceSchedules.filter((s) => s.status === 'Late');

    const filteredServiceSchedules = thisMonthServiceSchedules.filter((s) => {
        if (serviceFilter !== 'All' && s.status !== serviceFilter) return false;
        if (serviceTypeFilter !== 'All' && s.serviceType !== serviceTypeFilter) return false;
        if (serviceSearch) return s.serviceName.toLowerCase().includes(serviceSearch.toLowerCase());
        return true;
    });

    const stats = [
        {
            label: 'Total Income',
            value: summary?.thisYearRevenue ?? 0,
            secondary: 'combined (members + services)',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'var(--primary)',
            isLKR: true,
        },
        {
            label: 'This Month',
            value: summary?.thisMonthRevenue ?? 0,
            secondary: 'combined revenue',
            icon: <DollarSign className="w-5 h-5" />,
            color: 'var(--success)',
            isLKR: true,
        },
        {
            label: 'Pending',
            value: pendingThisMonth.length + pendingService.length,
            secondary: `Rs. ${(
                pendingThisMonth.reduce((s, x) => s + x.amount, 0) +
                pendingService.reduce((s, x) => s + x.amount, 0)
            ).toLocaleString()}`,
            icon: <Clock className="w-5 h-5" />,
            color: 'var(--warning)',
            isLKR: false,
        },
        {
            label: 'Late Payments',
            value: lateThisMonth.length + lateService.length,
            secondary: `Rs. ${(
                lateThisMonth.reduce((s, x) => s + x.amount, 0) +
                lateService.reduce((s, x) => s + x.amount, 0)
            ).toLocaleString()}`,
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

                <div className="flex gap-3">
                    <button
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isPending}
                        className="flex items-center gap-2 px-5 h-11 text-sm font-semibold bg-violet-600/10 border border-violet-500/30 rounded-lg text-violet-400 hover:bg-violet-600/20 transition-colors disabled:opacity-60"
                    >
                        <Dumbbell className={`w-4 h-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
                        Generate Schedules
                    </button>
                    <button
                        onClick={() => refreshMutation.mutate()}
                        disabled={refreshMutation.isPending}
                        className="flex items-center gap-2 px-5 h-11 text-sm font-semibold bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-60"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                        Refresh Late Status
                    </button>
                </div>
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

            {/* Section Switcher */}
            <div className="flex gap-1 p-1.5 bg-muted/30 border border-border rounded-xl w-fit">
                <button
                    onClick={() => setActiveSection('members')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeSection === 'members'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    Member Payments
                    {(pendingThisMonth.length + lateThisMonth.length) > 0 && (
                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-full">
                            {pendingThisMonth.length + lateThisMonth.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveSection('services')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeSection === 'services'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Dumbbell className="w-4 h-4" />
                    Classes &amp; PT Payments
                    {(pendingService.length + lateService.length) > 0 && (
                        <span className="px-1.5 py-0.5 bg-violet-500/10 text-violet-400 text-[10px] font-bold rounded-full">
                            {pendingService.length + lateService.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ─── MEMBER PAYMENTS SECTION ──────────────────────────────────────── */}
            {activeSection === 'members' && (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-1 p-1.5 bg-muted/30 border-b border-border">
                        {(['schedule', 'history'] as ActiveTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setMemberTab(tab)}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                                    memberTab === tab
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab === 'schedule' ? 'Payment Schedule' : 'Payment History'}
                            </button>
                        ))}
                    </div>

                    {/* Member Schedule Tab */}
                    {memberTab === 'schedule' && (
                        <div>
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
                                                    {thisMonthSchedules.filter((s) => s.status === f).length}
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

                    {/* Member History Tab */}
                    {memberTab === 'history' && (
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
            )}

            {/* ─── SERVICE PAYMENTS SECTION (Classes + PT) ─────────────────────── */}
            {activeSection === 'services' && (
                <div className="space-y-4">
                    {/* Service mini-stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Service This Month', value: summary?.serviceThisMonthRevenue ?? 0, isLKR: true, cls: 'text-violet-400' },
                            { label: 'Service This Year',  value: summary?.serviceThisYearRevenue  ?? 0, isLKR: true, cls: 'text-blue-400' },
                            {
                                label: 'Service Pending',
                                value: summary?.servicePendingCount ?? 0,
                                isLKR: false,
                                cls: 'text-amber-400',
                                sub: `Rs. ${(summary?.servicePendingAmount ?? 0).toLocaleString()}`,
                            },
                            {
                                label: 'Service Late',
                                value: summary?.serviceLateCount ?? 0,
                                isLKR: false,
                                cls: 'text-red-400',
                                sub: `Rs. ${(summary?.serviceLateAmount ?? 0).toLocaleString()}`,
                            },
                        ].map((s, i) => (
                            <div key={i} className="bg-card border border-border rounded-xl p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
                                <p className={`text-xl font-display font-black mt-1 ${s.cls}`}>
                                    {s.isLKR ? `Rs. ${(s.value as number).toLocaleString()}` : s.value}
                                </p>
                                {'sub' in s && s.sub && <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>}
                            </div>
                        ))}
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        {/* Settlement rule notice */}
                        <div className="px-5 py-3 bg-violet-500/5 border-b border-violet-500/10 flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-violet-300">
                                <span className="font-bold">Settlement rule:</span> Service payments must be settled in the last week of the
                                billing month. Payment received in week 1 of the following month is credited to the previous month and
                                marked as <span className="font-bold text-red-400">Late</span>.
                            </p>
                        </div>

                        {/* Tab Header */}
                        <div className="flex items-center gap-1 p-1.5 bg-muted/30 border-b border-border">
                            {(['schedule', 'history'] as ActiveTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setServiceTab(tab)}
                                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                                        serviceTab === tab
                                            ? 'bg-card text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab === 'schedule' ? 'Payment Schedule' : 'Payment History'}
                                </button>
                            ))}
                        </div>

                        {/* Service Schedule Tab */}
                        {serviceTab === 'schedule' && (
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-b border-border">
                                    <div className="flex gap-2 flex-wrap">
                                        {(['All', 'Pending', 'Late', 'Paid'] as ScheduleFilter[]).map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setServiceFilter(f)}
                                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                                    serviceFilter === f
                                                        ? 'bg-violet-600 text-white border-violet-600'
                                                        : 'border-border text-muted-foreground hover:text-foreground hover:border-violet-500/40'
                                                }`}
                                            >
                                                {f}
                                                {f !== 'All' && (
                                                    <span className="ml-1.5 opacity-70">
                                                        {thisMonthServiceSchedules.filter((s) => s.status === f).length}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                        <span className="w-px h-5 bg-border self-center" />
                                        {(['All', 'Class', 'PT'] as const).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setServiceTypeFilter(t)}
                                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                                    serviceTypeFilter === t
                                                        ? t === 'Class'
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : t === 'PT'
                                                                ? 'bg-purple-600 text-white border-purple-600'
                                                                : 'bg-muted text-foreground border-border'
                                                        : 'border-border text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                {t === 'All' ? 'All Types' : t === 'Class' ? 'Classes' : 'PT'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative sm:ml-auto sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search class / trainer..."
                                            value={serviceSearch}
                                            onChange={(e) => setServiceSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    {serviceSchedulesLoading ? (
                                        <div className="p-12 text-center text-muted-foreground text-sm">Loading schedules...</div>
                                    ) : filteredServiceSchedules.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <Dumbbell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                            <p className="text-muted-foreground text-sm">No service schedules found for this month</p>
                                            <p className="text-xs text-muted-foreground/60 mt-1">
                                                Use "Generate Schedules" to create this month's schedules for active classes and PT registrations.
                                            </p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Month</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</th>
                                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {filteredServiceSchedules.map((s) => {
                                                    const sType = SERVICE_TYPE_PILL[s.serviceType] ?? { label: s.serviceType, cls: 'bg-muted/50 text-muted-foreground border border-border' };
                                                    return (
                                                        <tr key={s.id} className="hover:bg-muted/20 transition-colors group">
                                                            <td className="px-5 py-3.5 font-medium text-foreground whitespace-nowrap">{s.serviceName}</td>
                                                            <td className="px-4 py-3.5">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${sType.cls}`}>
                                                                    {sType.label}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">{s.month}</td>
                                                            <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{fmtDate(s.dueDate)}</td>
                                                            <td className="px-4 py-3.5 text-right font-semibold text-foreground whitespace-nowrap">
                                                                Rs. {s.amount.toLocaleString()}
                                                            </td>
                                                            <td className="px-4 py-3.5">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_PILL[s.status] ?? ''}`}>
                                                                    {s.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5 text-right">
                                                                {s.status !== 'Paid' ? (
                                                                    <button
                                                                        onClick={() => setSelectedServiceSchedule(s)}
                                                                        className="px-3.5 py-1.5 text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg hover:bg-violet-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
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

                        {/* Service History Tab */}
                        {serviceTab === 'history' && (
                            <div>
                                {serviceHistoryLoading ? (
                                    <div className="p-12 text-center text-muted-foreground text-sm">Loading history...</div>
                                ) : serviceHistory.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-muted-foreground text-sm">No service payment history</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Billing Month</th>
                                                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Method</th>
                                                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {serviceHistory.map((h) => {
                                                    const sType = SERVICE_TYPE_PILL[h.serviceType] ?? { label: h.serviceType, cls: 'bg-muted/50 text-muted-foreground border border-border' };
                                                    return (
                                                        <tr key={h.id} className="hover:bg-muted/20 transition-colors">
                                                            <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{fmtDate(h.date)}</td>
                                                            <td className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">{h.serviceName}</td>
                                                            <td className="px-4 py-3.5">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${sType.cls}`}>
                                                                    {sType.label}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">{h.month}</td>
                                                            <td className="px-4 py-3.5 text-right font-semibold text-foreground whitespace-nowrap">
                                                                Rs. {h.amount.toLocaleString()}
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
                </div>
            )}

            {/* Dialogs */}
            <RecordPaymentDialog
                schedule={selectedSchedule}
                isOpen={!!selectedSchedule}
                onClose={() => setSelectedSchedule(null)}
            />
            <RecordServicePaymentDialog
                schedule={selectedServiceSchedule}
                isOpen={!!selectedServiceSchedule}
                onClose={() => setSelectedServiceSchedule(null)}
            />
        </div>
    );
}
