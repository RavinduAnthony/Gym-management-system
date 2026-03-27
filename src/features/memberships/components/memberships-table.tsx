// src/features/memberships/components/memberships-table.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Edit2, Trash2, Package, Clock, Shield, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { membershipsApi } from '../api/memberships-api';
import type { MembershipPackage } from '../types';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    onEdit: (pkg: MembershipPackage) => void;
}

export function MembershipsTable({ onEdit }: Props) {
    const queryClient = useQueryClient();

    const { data: packages, isLoading, isError } = useQuery({
        queryKey: ['memberships'],
        queryFn: membershipsApi.getPackages,
    });

    const deleteMutation = useMutation({
        mutationFn: membershipsApi.deletePackage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
            toast.success('TIER DECOMMISSIONED', {
                description: 'Operational package has been removed from the registry.',
            });
        },
        onError: () => {
            toast.error('TASK FAILURE', {
                description: 'System error during tier decommissioning. Link secured.',
            });
        },
    });

    const handleDelete = (pkg: MembershipPackage) => {
        toast.error(`DECOMMISSION TIER: "${pkg.name}"?`, {
            description: 'This will terminate the availability of this operational package.',
            duration: Infinity,
            action: {
                label: 'EXECUTE',
                onClick: () => deleteMutation.mutate(pkg.id),
            },
            cancel: {
                label: 'ABORT',
                onClick: () => { },
            },
        });
    };

    const columnHelper = createColumnHelper<MembershipPackage>();

    const columns = [
        columnHelper.accessor('name', {
            header: 'PACKAGE IDENTITY',
            cell: (info) => (
                <div className="flex items-center gap-5 py-3">
                    <div className="w-14 h-14 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center text-[var(--secondary)] border border-[var(--border)] shadow-xl group-hover:border-[var(--secondary)]/50 transition-all duration-300">
                        <Package className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-bold text-white text-base tracking-tight mb-1 group-hover:text-[var(--secondary)] transition-colors">
                            {info.getValue()}
                        </div>
                        <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">TIER CONFIGURATION</div>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('durationInMonths', {
            header: 'CYCLE',
            cell: (info) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 font-bold text-white uppercase text-[11px] tracking-wider mb-2">
                        <Clock className="w-4 h-4 text-[var(--secondary)]" />
                        {info.getValue()} {info.getValue() === 1 ? 'Month' : 'Months'}
                    </div>
                    <span className="text-[9px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest pl-6">COMMITMENT</span>
                </div>
            ),
        }),
        columnHelper.accessor('price', {
            header: 'VALUE',
            cell: (info) => (
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2 font-display font-black text-2xl text-white group-hover:text-[var(--primary)] transition-colors">
                        <span className="text-xs text-[var(--primary)] font-bold uppercase tracking-widest">Rs.</span>
                        {new Intl.NumberFormat('en-LK', {
                            maximumFractionDigits: 0,
                        }).format(info.getValue())}
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('status', {
            header: 'DEPLOYMENT',
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
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: (info) => {
                const pkg = info.row.original;
                return (
                    <div className="flex justify-end gap-3 px-6 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 duration-300">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onEdit(pkg); }}
                            className="bg-[var(--surface-alt)] border-[var(--border)] h-10 w-10 p-0 hover:border-[var(--primary)]/50 hover:text-[var(--primary)] rounded-lg"
                            title="Refactor Architecture"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleDelete(pkg); }}
                            className="bg-[var(--surface-alt)] border-[var(--border)] h-10 w-10 p-0 text-red-500 hover:bg-red-500/10 hover:border-red-500/30 rounded-lg"
                            title="Decommission Tier"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        }),
    ];

    const table = useReactTable({
        data: packages || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return (
            <div className="p-24 flex flex-col items-center justify-center space-y-8">
                 <div className="w-16 h-16 border-[5px] border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-2xl shadow-red-950/20" />
                <p className="text-white font-bold text-lg uppercase tracking-widest animate-pulse">SYNCHRONIZING TIERS</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-center premium-card">
                 <div className="w-20 h-20 rounded-2xl bg-red-950/20 flex items-center justify-center mb-8 border border-red-500/20">
                     <Shield className="w-8 h-8 text-red-500 opacity-50" />
                </div>
                <h3 className="text-3xl font-display font-black text-red-500 uppercase tracking-tighter">ACCESS DENIED</h3>
                <p className="text-[var(--text-secondary)] mt-4 max-w-sm mx-auto font-bold text-sm leading-relaxed">Economic engine link severed. Satellite re-synchronization required.</p>
                <Button variant="primary" className="mt-10 px-10 h-14 bg-[var(--primary)] shadow-2xl shadow-red-950/30" onClick={() => window.location.reload()}>RE-INITIALIZE LINK</Button>
            </div>
        );
    }

    if (!packages?.length) {
        return (
            <div className="p-40 flex flex-col items-center justify-center text-center">
                <div className="relative mb-10">
                    <div className="w-28 h-28 bg-[var(--surface-alt)] rounded-3xl flex items-center justify-center border-4 border-dashed border-[var(--border)]">
                        <Package className="w-14 h-14 text-[var(--text-tertiary)] opacity-20" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-[var(--primary)] rounded-2xl flex items-center justify-center shadow-xl shadow-red-950/40">
                         <Plus className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h3 className="text-4xl font-display font-black text-white uppercase tracking-tighter">ZERO STRUCTURE</h3>
                <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto font-bold text-base leading-relaxed">
                    No membership packages registered. Operation requires a defined economic architecture.
                </p>
                <Button className="mt-10 px-12 h-16 text-lg font-black bg-[var(--primary)] shadow-2xl shadow-red-950/40">ARCHITECT FIRST PACKAGE</Button>
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
