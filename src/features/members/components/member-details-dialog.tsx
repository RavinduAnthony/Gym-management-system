import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, User, History, Bell, CalendarClock, CreditCard, ExternalLink, Activity, BadgeAlert } from 'lucide-react';
import { toast } from 'sonner';

import { membersApi } from '../api/members-api';
import type { Member } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    member: Member | null;
}

export function MemberDetailsDialog({ isOpen, onClose, member }: Props) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'profile' | 'renewal' | 'history' | 'notifications'>('profile');

    // Renewal Form State
    const [renewPlan, setRenewPlan] = useState('Monthly Standard');
    const [renewAmount, setRenewAmount] = useState('5000');
    const [renewEndDate, setRenewEndDate] = useState('');

    const { data: payments, isLoading: paymentsLoading } = useQuery({
        queryKey: ['member-payments', member?.id],
        queryFn: () => membersApi.getPaymentsByMember(member!.id),
        enabled: !!member && isOpen && (activeTab === 'history' || activeTab === 'profile'),
    });

    const renewMutation = useMutation({
        mutationFn: () => membersApi.renewMembership(member!.id, renewPlan, parseInt(renewAmount, 10), renewEndDate),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            queryClient.invalidateQueries({ queryKey: ['member-payments', member?.id] });
            toast.success('Membership renewed & payment recorded');
            setRenewEndDate('');
            setActiveTab('history'); // Bounce to history to see it
        },
        onError: () => toast.error('Failed to process renewal'),
    });

    const handleSimulateNotification = (type: string) => {
        toast('Message Queued', {
            description: `Sending ${type} notification to ${member?.firstName}.`,
            icon: <Bell className="w-4 h-4 text-primary" />,
        });
    };

    if (!isOpen || !member) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-2xl border border-border flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header Profile Summary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5 border-b border-border bg-muted/10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl overflow-hidden shadow-sm shrink-0">
                            {member.photo ? (
                                <img src={member.photo} alt={member.firstName} className="w-full h-full object-cover" />
                            ) : (
                                member.firstName.charAt(0) + member.lastName.charAt(0)
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {member.firstName} {member.lastName}
                            </h2>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                    {member.status}
                                </span>
                                <span className="text-sm text-muted-foreground">{member.phone}</span>
                                {member.email && (
                                    <>
                                        <span className="text-muted-foreground/30">•</span>
                                        <span className="text-sm text-muted-foreground">{member.email}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 sm:mt-0 mt-4 self-end sm:self-auto text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sidebar + Content Layout */}
                <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">

                    {/* Navigation Sidebar */}
                    <div className="w-full sm:w-56 border-r border-border bg-muted/5 p-4 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <User className="w-4 h-4" /> Profile Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('renewal')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'renewal' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <CalendarClock className="w-4 h-4" /> Manage Renewals
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <History className="w-4 h-4" /> Payment History
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <Bell className="w-4 h-4" /> Notifications
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-background">

                        {/* 1. Profile Overview Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Grid stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 border border-border rounded-xl bg-muted/20">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Current Plan</p>
                                        <p className="text-sm font-bold text-foreground truncate">{member.membershipPlanId}</p>
                                    </div>
                                    <div className="p-4 border border-border rounded-xl bg-muted/20">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Expiry Date</p>
                                        <p className="text-sm font-bold text-foreground">
                                            {member.membershipEndDate}
                                        </p>
                                    </div>
                                    <div className="p-4 border border-border rounded-xl bg-muted/20">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Assigned Trainer</p>
                                        <p className="text-sm font-bold text-foreground">{member.trainerId || 'None Assigned'}</p>
                                    </div>
                                    <div className="p-4 border border-border rounded-xl bg-muted/20">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Fitness Branch</p>
                                        <p className="text-sm font-bold text-foreground">{member.branchId}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                            <Activity className="w-4 h-4" /> Health & Stats
                                        </h3>
                                        <div className="space-y-3 bg-card border border-border rounded-xl p-5 shadow-sm">
                                            <div className="flex justify-between border-b border-border/50 pb-2">
                                                <span className="text-sm text-muted-foreground">Height</span>
                                                <span className="text-sm font-medium text-foreground">{member.height ? `${member.height} cm` : 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-border/50 pb-2">
                                                <span className="text-sm text-muted-foreground">Weight</span>
                                                <span className="text-sm font-medium text-foreground">{member.weight ? `${member.weight} kg` : 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-border/50 pb-2">
                                                <span className="text-sm text-muted-foreground">Blood Type / Gender</span>
                                                <span className="text-sm font-medium text-foreground">{member.gender}</span>
                                            </div>
                                            <div className="pt-1">
                                                <span className="text-sm text-muted-foreground block mb-1">Medical Notes:</span>
                                                <p className="text-sm font-medium text-foreground bg-muted/50 p-3 rounded-lg border border-border/50 min-h-[60px]">
                                                    {member.medicalConditions || 'No conditions reported.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-destructive mb-4 flex items-center gap-2">
                                            <BadgeAlert className="w-4 h-4" /> Emergency Info
                                        </h3>
                                        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 mb-6">
                                            <p className="text-sm text-muted-foreground mb-1">Emergency Contact</p>
                                            <p className="font-semibold text-foreground text-lg">
                                                {member.emergencyContact || 'Not provided'}
                                            </p>
                                        </div>

                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Location</h3>
                                        <div className="bg-muted/10 border border-border rounded-xl p-4">
                                            <p className="text-sm text-foreground leading-relaxed">
                                                {member.address || 'No address provided in system.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Renewal Management Tab */}
                        {activeTab === 'renewal' && (
                            <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                                        <CalendarClock className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">Process Renewal</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Current plan expires on: <strong className="text-foreground">{member.membershipEndDate}</strong>
                                    </p>
                                </div>

                                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">New Membership Plan</label>
                                        <select
                                            value={renewPlan}
                                            onChange={(e) => setRenewPlan(e.target.value)}
                                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                        >
                                            <option value="Monthly Standard">Monthly Standard</option>
                                            <option value="Quarterly Pro">Quarterly Pro</option>
                                            <option value="Annual VIP">Annual VIP</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">New Expiry Date</label>
                                        <input
                                            type="date"
                                            value={renewEndDate}
                                            onChange={(e) => setRenewEndDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">Final Amount (LKR)</label>
                                            <input
                                                type="number"
                                                value={renewAmount}
                                                onChange={(e) => setRenewAmount(e.target.value)}
                                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">Discount Applied</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => renewMutation.mutate()}
                                        disabled={renewMutation.isPending || !renewEndDate}
                                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-m disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        {renewMutation.isPending ? 'Processing...' : 'Charge & Renew Package'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 3. History Tab */}
                        {activeTab === 'history' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <History className="w-5 h-5 text-muted-foreground" /> Payment Ledger
                                </h3>

                                <div className="bg-card border border-border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Transaction Date</th>
                                                <th className="px-6 py-4 font-medium">Description</th>
                                                <th className="px-6 py-4 font-medium text-right">Amount (LKR)</th>
                                                <th className="px-6 py-4 font-medium text-center">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {paymentsLoading ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground animate-pulse">
                                                        Loading ledger...
                                                    </td>
                                                </tr>
                                            ) : payments?.length ? (
                                                payments.map((p) => (
                                                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-foreground">
                                                            {new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 text-muted-foreground">{p.planName} Renewal</td>
                                                        <td className="px-6 py-4 font-semibold text-foreground text-right">Rs. {p.amount.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button className="text-primary hover:text-primary/80 transition-colors mx-auto p-1 rounded-md hover:bg-primary/10">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                        No payment records found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 4. Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-8">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">Member Communications</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Send targeted alerts or promotional messages
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-sm">
                                        <div>
                                            <h4 className="font-semibold text-foreground">Membership Expiry Reminder</h4>
                                            <p className="text-sm text-muted-foreground">Send an automated reminder that their plan is ending soon.</p>
                                        </div>
                                        <button
                                            onClick={() => handleSimulateNotification('Expiry Reminder (SMS/Email)')}
                                            className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Send Alert
                                        </button>
                                    </div>

                                    <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-sm">
                                        <div>
                                            <h4 className="font-semibold text-foreground">Payment Overdue Notice</h4>
                                            <p className="text-sm text-muted-foreground">Alert them of pending renewal fees required to access branch.</p>
                                        </div>
                                        <button
                                            onClick={() => handleSimulateNotification('Payment Warning')}
                                            className="px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Send Warning
                                        </button>
                                    </div>

                                    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-foreground">Custom Promotional Message</h4>
                                            <p className="text-sm text-muted-foreground">Compose a custom SMS/Email message.</p>
                                        </div>
                                        <textarea
                                            className="w-full bg-background border border-input rounded-lg p-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none mb-3 resize-none"
                                            rows={3}
                                            placeholder={`Hi ${member.firstName}, don't miss our new Zumba classes starting tomorrow...`}
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleSimulateNotification('Custom Message')}
                                                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Send Campaign
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
