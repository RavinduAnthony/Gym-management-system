import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Edit2, Trash2, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ptPackagesApi } from '../api/pt-packages-api';
import { Can, PERMISSIONS } from '@/core/permissions';
import type { PtPackage } from '../schemas/pt-package-schema';
import { Button } from '@/components/ui/Button';
import { deleteToastClassNames } from '@/lib/toast-styles';

interface PtPackagesTableProps {
    onEdit: (item: PtPackage) => void;
}

export function PtPackagesTable({ onEdit }: PtPackagesTableProps) {
    const queryClient = useQueryClient();
    const { data: packages = [], isLoading } = useQuery({
        queryKey: ['ptPackages'],
        queryFn: ptPackagesApi.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: ptPackagesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ptPackages'] });
            toast.success('Registration removed successfully');
        },
        onError: () => toast.error('Failed to remove registration'),
    });

    const handleDelete = (item: PtPackage) => {
        toast(`Remove "${item.trainerName ?? 'this trainer'}"?`, {
            description: 'This will permanently delete this registration record.',
            duration: 8000,
            classNames: deleteToastClassNames,
            action: { label: 'Delete', onClick: () => deleteMutation.mutate(item.id) },
            cancel: { label: 'Cancel', onClick: () => {} },
        });
    };

    const columnHelper = createColumnHelper<PtPackage>();

    const columns = [
        columnHelper.accessor('trainerName', {
            header: 'PERSONAL TRAINER',
            cell: (info) => (
                <div className="flex items-center gap-4 py-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center text-[var(--primary)] border border-[var(--border)] shadow-lg group-hover:border-[var(--primary)]/50 transition-all">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-white text-base tracking-tight group-hover:text-[var(--primary)] transition-colors">
                            {info.getValue() ?? '—'}
                        </div>
                        <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mt-0.5">
                            Personal Trainer
                        </div>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('studentCount', {
            header: 'STUDENTS',
            cell: (info) => (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-white font-black text-xs">
                    <Users className="w-3 h-3" />
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('paymentRatePerStudent', {
            header: 'RATE / STUDENT',
            cell: (info) => (
                <span className="text-[var(--text-secondary)] font-bold text-sm">
                    LKR {info.getValue().toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'monthlyPayment',
            header: 'MONTHLY PAYMENT',
            cell: ({ row }) => {
                const { studentCount, paymentRatePerStudent } = row.original;
                const monthly = studentCount * paymentRatePerStudent;
                return (
                    <span className="font-black text-[var(--primary)] text-sm">
                        LKR {monthly.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </span>
                );
            },
        }),
        columnHelper.accessor('status', {
            header: 'STATUS',
            cell: (info) => {
                const isActive = info.getValue() === 'Active';
                return (
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]' : 'bg-[var(--danger)]'}`} />
                        <span className={`font-black uppercase text-[10px] tracking-widest ${isActive ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex justify-end gap-2 px-4 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 duration-300">
                        <Can permission={PERMISSIONS.SERVICES_MANAGE}>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                className="bg-[var(--surface-alt)] border-[var(--border)] h-9 w-9 p-0 hover:border-[var(--primary)]/50 hover:text-[var(--primary)] rounded-lg"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                        </Can>
                        <Can permission={PERMISSIONS.SERVICES_MANAGE}>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                className="bg-[var(--surface-alt)] border-[var(--border)] h-9 w-9 p-0 hover:border-red-500/50 hover:text-red-500 rounded-lg"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </Can>
                    </div>
                );
            },
        }),
    ];
    const table = useReactTable({ data: packages, columns, getCoreRowModel: getCoreRowModel() });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40 text-[var(--text-tertiary)] text-sm animate-pulse">
                Loading packages...
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5">
                        {table.getHeaderGroups().map(hg =>
                            hg.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]"
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))
                        )}
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center text-[var(--text-tertiary)] text-sm italic">
                                    No trainers registered yet. Click <span className="font-bold text-white">REGISTER TRAINER</span> to add one.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row, i) => (
                                <motion.tr
                                    key={row.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="border-b border-white/[0.04] hover:bg-white/[0.02] group cursor-pointer transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))
                        )}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
}