// src/features/members/components/members-table.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Edit2, User, Trash2, Shield, UserCheck, UserX, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { membersApi } from '../api/members-api';
import { Can, PERMISSIONS } from '@/core/permissions';
import type { Member } from '../types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { usePackages } from '@/hooks/usePackages';
import { useTrainers } from '@/hooks/useTrainers';

interface MembersTableProps {
    onEdit: (member: Member) => void;
    onRowClick: (member: Member) => void;
    mode?: 'active' | 'inactive';
}

export function MembersTable({ onEdit, onRowClick, mode = 'active' }: MembersTableProps) {
    const queryClient = useQueryClient();
    const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
    const { data: members, isLoading, isError } = useQuery({
        queryKey: mode === 'inactive' ? ['members-inactive'] : ['members'],
        queryFn: mode === 'inactive' ? membersApi.getInactiveMembers : membersApi.getMembers,
    });
    const { data: packages } = usePackages();
    const { data: trainers } = useTrainers();

    const deleteMutation = useMutation({
        mutationFn: membersApi.deleteMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            queryClient.invalidateQueries({ queryKey: ['members-inactive'] });
            toast.success('Member permanently deleted');
        },
        onError: () => toast.error('Failed to delete member'),
    });

    const deactivateMutation = useMutation({
        mutationFn: membersApi.deactivateMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            queryClient.invalidateQueries({ queryKey: ['members-inactive'] });
            toast.success('Member deactivated');
        },
        onError: () => toast.error('Failed to deactivate member'),
    });

    const reactivateMutation = useMutation({
        mutationFn: membersApi.reactivateMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            queryClient.invalidateQueries({ queryKey: ['members-inactive'] });
            toast.success('Member reactivated');
        },
        onError: () => toast.error('Failed to reactivate member'),
    });

    const handleReactivate = (e: React.MouseEvent, member: Member) => {
        e.stopPropagation();
        reactivateMutation.mutate(member.id);
    };

    const columnHelper = createColumnHelper<Member>();

    const columns = [
        columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
            id: 'name',
            header: 'MEMBER',
            cell: (info) => {
                const member = info.row.original;
                return (
                    <div className="flex items-center gap-5 py-3">
                        <div className="w-14 h-14 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center text-[var(--primary)] font-bold overflow-hidden shrink-0 border border-[var(--border)] shadow-xl group-hover:border-[var(--primary)]/50 transition-all duration-300">
                            {member.photo ? (
                                <img src={member.photo} alt={info.getValue()} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 opacity-40" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="font-bold text-white text-base tracking-tight mb-1 group-hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                                {info.getValue()}
                                {mode === 'inactive' && (
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded px-2 py-0.5">
                                        Inactive
                                    </span>
                                )}
                                {member.memberType === 'Special' ? (
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-violet-500/15 text-violet-400 border border-violet-500/30 rounded px-2 py-0.5">
                                        Special
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded px-2 py-0.5">
                                        Monthly
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">{member.phone}</div>
                                {member.membershipNumber && (
                                    <div className="text-[9px] font-black uppercase tracking-widest bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded px-2 py-0.5">
                                        #{member.membershipNumber}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('membershipPlanId', {
            header: 'PACKAGE',
            cell: (info) => {
                const planId = info.getValue();
                const planName = packages?.find(p => p.id === planId)?.name;
                return (
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[var(--secondary)] shrink-0" />
                        <span className="font-bold text-white text-[11px] tracking-wider">
                            {planName ?? (planId ? '...' : '— No Package')}
                        </span>
                    </div>
                );
            },
        }),
        columnHelper.accessor('trainerId', {
            header: 'TRAINER',
            cell: (info) => {
                const trainerId = info.getValue();
                const trainer = trainers?.find(t => t.id === trainerId);
                const trainerName = trainer ? `${trainer.firstName} ${trainer.lastName}` : null;
                return (
                    <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                        <span className={`font-bold text-[11px] tracking-wider ${trainerName ? 'text-white' : 'text-[var(--text-tertiary)]'}`}>
                            {trainerName ?? 'None Assigned'}
                        </span>
                    </div>
                );
            },
        }),
        columnHelper.accessor('paymentStatus', {
            header: 'PAYMENT',
            cell: (info) => {
                const status = info.getValue();
                const isPaid = status === 'Paid';
                return (
                    <Badge
                        variant={isPaid ? 'success' : 'warning'}
                        className="font-black tracking-widest text-[9px] px-3 py-1 uppercase"
                    >
                        {isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const member = row.original;
                if (mode === 'inactive') {
                    return (
                        <div className="flex justify-end gap-3 px-6 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 duration-300">
                            <Can permission={PERMISSIONS.MEMBERS_EDIT}>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={(e) => handleReactivate(e, member)}
                                    className="bg-[var(--surface-alt)] border-[var(--border)] h-10 px-4 gap-2 hover:border-green-500/50 hover:text-green-400 rounded-lg text-[11px] font-black tracking-wider"
                                    title="Reactivate Member"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> REACTIVATE
                                </Button>
                            </Can>
                            <Can permission={PERMISSIONS.MEMBERS_DELETE}>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); setRemoveTarget(member); }}
                                    className="bg-[var(--surface-alt)] border-[var(--border)] h-10 w-10 p-0 hover:border-red-500/50 hover:text-red-400 rounded-lg"
                                    title="Delete Permanently"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </Can>
                        </div>
                    );
                }
                return (
                    <div className="flex justify-end gap-3 px-6 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 duration-300">
                        <Can permission={PERMISSIONS.MEMBERS_EDIT}>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); onEdit(member); }}
                                className="bg-[var(--surface-alt)] border-[var(--border)] h-10 w-10 p-0 hover:border-[var(--primary)]/50 hover:text-[var(--primary)] rounded-lg"
                                title="Edit Member"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                        </Can>
                        <Can permission={PERMISSIONS.MEMBERS_DELETE}>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setRemoveTarget(member); }}
                                className="bg-[var(--surface-alt)] border-[var(--border)] h-10 w-10 p-0 hover:border-red-500/50 hover:text-red-400 rounded-lg"
                                title="Remove Member"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </Can>
                    </div>
                );
            },
        }),
    ];

    const table = useReactTable({
        data: members || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return (
            <div className="p-24 flex flex-col items-center justify-center space-y-8">
                <div className="w-16 h-16 border-[5px] border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-2xl shadow-red-950/20" />
                <div className="text-center">
                    <p className="text-white font-bold text-lg uppercase tracking-widest animate-pulse">SCANNING DIRECTORY</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-center premium-card">
                <div className="w-20 h-20 rounded-2xl bg-red-950/20 flex items-center justify-center mb-8 border border-red-500/20">
                     <Shield className="w-8 h-8 text-red-500 opacity-50" />
                </div>
                <h3 className="text-3xl font-display font-black text-red-500 uppercase tracking-tighter">LINK FAILURE</h3>
                <p className="text-[var(--text-secondary)] mt-4 max-w-sm mx-auto font-bold text-sm leading-relaxed">Critical error in athlete directory synchronization. Uplink lost.</p>
                <Button variant="primary" className="mt-10 px-10 h-14 bg-[var(--primary)] shadow-2xl shadow-red-950/30" onClick={() => window.location.reload()}>RE-INITIALIZE LINK</Button>
            </div>
        );
    }

    if (!members?.length) {
        return (
            <div className="p-40 flex flex-col items-center justify-center text-center">
                <div className="relative mb-10">
                    <div className="w-28 h-28 bg-[var(--surface-alt)] rounded-3xl flex items-center justify-center border-4 border-dashed border-[var(--border)]">
                        <User className="w-14 h-14 text-[var(--text-tertiary)] opacity-20" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[var(--secondary)] rounded-2xl flex items-center justify-center shadow-xl shadow-blue-950/40">
                         <User className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h3 className="text-4xl font-display font-black text-white uppercase tracking-tighter">
                    {mode === 'inactive' ? 'NO OFFBOARDED MEMBERS' : 'ZERO ATHLETES'}
                </h3>
                <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto font-bold text-base leading-relaxed">
                    {mode === 'inactive'
                        ? 'No deactivated members found. All athletes are currently active.'
                        : 'The facility is currently inactive. No registered personnel detected in the tactical bio-registry.'}
                </p>
            </div>
        );
    }

    return (
        <>
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl premium-card">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="bg-[var(--surface-alt)]/50 border-b border-[var(--border)]">
                        {table.getHeaderGroups()[0].headers.map((header) => (
                            <th key={header.id} className="px-8 py-6 font-bold text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.3em] whitespace-nowrap">
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                    <AnimatePresence mode="popLayout">
                        {table.getRowModel().rows.map((row, i) => (
                            <motion.tr
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                key={row.id}
                                onClick={() => onRowClick(row.original)}
                                className={`hover:bg-[var(--surface-alt)]/40 transition-all group cursor-pointer ${mode === 'inactive' ? 'opacity-60 hover:opacity-100' : ''}`}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-8 py-5 whitespace-nowrap">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>

        {/* Remove Member Dialog */}
        <AnimatePresence>
            {removeTarget && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setRemoveTarget(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--border)] flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-display font-black text-lg uppercase tracking-tight text-white">
                                    Remove Member
                                </h3>
                                <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
                                    {removeTarget.firstName} {removeTarget.lastName}
                                </p>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="p-6 space-y-3">
                            {/* Deactivate option */}
                            <button
                                className="w-full flex items-start gap-4 p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all text-left group"
                                onClick={() => {
                                    deactivateMutation.mutate(removeTarget.id);
                                    setRemoveTarget(null);
                                }}
                            >
                                <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-orange-500/25 transition-colors">
                                    <UserX className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <div className="font-black text-orange-400 text-sm uppercase tracking-wider">Deactivate</div>
                                    <div className="text-[var(--text-secondary)] text-[11px] mt-1 leading-relaxed">
                                        Member is hidden from the main list. Payment history is preserved. Can be reactivated anytime.
                                    </div>
                                </div>
                            </button>

                            {/* Delete option */}
                            <button
                                className="w-full flex items-start gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all text-left group"
                                onClick={() => {
                                    deleteMutation.mutate(removeTarget.id);
                                    setRemoveTarget(null);
                                }}
                            >
                                <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-500/25 transition-colors">
                                    <Trash2 className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <div className="font-black text-red-400 text-sm uppercase tracking-wider">Delete Permanently</div>
                                    <div className="text-[var(--text-secondary)] text-[11px] mt-1 leading-relaxed">
                                        All records including payments and memberships are removed. A deletion log is kept for reference.
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Cancel */}
                        <div className="px-6 pb-6">
                            <button
                                className="w-full py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-bold hover:bg-white/5 transition-colors"
                                onClick={() => setRemoveTarget(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
}
