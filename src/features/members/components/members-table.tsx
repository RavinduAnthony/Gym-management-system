// src/features/members/components/members-table.tsx
import { useQuery } from '@tanstack/react-query';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Edit2, User, CreditCard, ChevronRight, MapPin, Shield } from 'lucide-react';
import { membersApi } from '../api/members-api';
import type { Member } from '../types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface MembersTableProps {
    onEdit: (member: Member) => void;
    onManageProfile: (member: Member) => void;
}

export function MembersTable({ onEdit, onManageProfile }: MembersTableProps) {
    const { data: members, isLoading, isError } = useQuery({
        queryKey: ['members'],
        queryFn: membersApi.getMembers,
    });

    const columnHelper = createColumnHelper<Member>();

    const columns = [
        columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
            id: 'name',
            header: 'FACILITY ATHLETE',
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
                            <div className="font-bold text-white text-base tracking-tight mb-1 group-hover:text-[var(--primary)] transition-colors">
                                {info.getValue()}
                            </div>
                            <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">{member.phone}</div>
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('branchId', {
            header: 'SECTOR',
            cell: (info) => (
                <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[var(--secondary)]" />
                    <span className="font-bold text-white uppercase text-[11px] tracking-wider">{info.getValue() || 'CORE UNIT'}</span>
                </div>
            ),
        }),
        columnHelper.accessor('membershipPlanId', {
            header: 'PACKAGE',
            cell: (info) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                         <Shield className="w-4 h-4 text-[var(--secondary)]" />
                         <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                            {info.row.original.membershipPlanId || 'PROBATION'}
                         </span>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('status', {
            header: 'STATUS',
            cell: (info) => {
                const status = info.getValue();
                const isActive = status === 'Active';
                return (
                    <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]' : 'bg-[var(--danger)]'}`} />
                         <span className={`font-black uppercase text-[10px] tracking-widest ${isActive ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                            {isActive ? 'ACTIVE' : 'OFFLINE'}
                         </span>
                    </div>
                );
            },
        }),
        columnHelper.accessor('paymentStatus', {
            header: 'CAPITAL',
            cell: (info) => {
                const status = info.getValue();
                const isPaid = status === 'Paid';
                return (
                    <Badge 
                        variant={isPaid ? 'success' : 'warning'}
                        className="font-black tracking-widest text-[9px] px-3 py-1 bg-[var(--surface-alt)] border-[var(--border)] uppercase"
                    >
                        {isPaid ? 'VAL' : 'AWT'}
                    </Badge>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const member = row.original;
                return (
                    <div className="flex justify-end gap-3 px-6 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 duration-300">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onManageProfile(member); }}
                            className="bg-[var(--surface-alt)] border-[var(--border)] h-10 w-10 p-0 hover:border-[var(--secondary)]/50 hover:text-[var(--secondary)] rounded-lg"
                            title="Capital Management"
                        >
                            <CreditCard className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onEdit(member); }}
                            className="bg-[var(--surface-alt)] border-[var(--border)] h-10 w-10 p-0 hover:border-[var(--primary)]/50 hover:text-[var(--primary)] rounded-lg"
                            title="Edit Profile"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-[var(--surface-alt)] border-[var(--border)] h-10 w-10 p-0 hover:bg-[var(--surface-hover)] rounded-lg"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
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
                <h3 className="text-4xl font-display font-black text-white uppercase tracking-tighter">ZERO ATHLETES</h3>
                <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto font-bold text-base leading-relaxed">
                    The facility is currently inactive. No registered personnel detected in the tactical bio-registry.
                </p>
                <Button className="mt-10 px-12 h-16 text-lg font-black bg-[var(--secondary)] shadow-2xl shadow-blue-950/40">INITIATE RECRUITMENT</Button>
            </div>
        );
    }

    return (
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
                                className="hover:bg-[var(--surface-alt)]/40 transition-all group cursor-default"
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
    );
}
