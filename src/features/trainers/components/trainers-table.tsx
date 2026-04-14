// src/features/trainers/components/trainers-table.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { CalendarRange, Edit2, Trash2, User, MoreVertical, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import { deleteToastClassNames } from '@/lib/toast-styles';
import { trainersApi } from '../api/trainers-api';
import { Can, PERMISSIONS } from '@/core/permissions';
import type { Trainer } from '../types';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface TrainersTableProps {
    onEdit: (trainer: Trainer) => void;
    onViewSchedule: (trainer: Trainer) => void;
    onRowClick: (trainer: Trainer) => void;
}

export function TrainersTable({ onEdit, onViewSchedule, onRowClick }: TrainersTableProps) {
    const queryClient = useQueryClient();
    const { data: trainers, isLoading, isError } = useQuery({
        queryKey: ['trainers'],
        queryFn: trainersApi.getTrainers,
    });

    const deleteMutation = useMutation({
        mutationFn: trainersApi.deleteTrainer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trainers'] });
            toast.success('OPERATIVE DEACTIVATED', {
                description: "The trainer has been successfully removed from Core Operations.",
            });
        },
        onError: () => {
            toast.error('TASK FAILURE', {
                description: "System error during operative deactivation. Link secured.",
            });
        },
    });

    const handleDelete = (trainer: Trainer) => {
        toast(`Remove ${trainer.firstName} ${trainer.lastName}?`, {
            description: 'This will permanently delete their record and all session data.',
            duration: 8000,
            classNames: deleteToastClassNames,
            action: {
                label: 'Delete',
                onClick: () => deleteMutation.mutate(trainer.id),
            },
            cancel: {
                label: 'Cancel',
                onClick: () => { },
            },
        });
    };

    const columnHelper = createColumnHelper<Trainer>();

    const columns = [
        columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
            id: 'name',
            header: 'FACILITY OPERATIVE',
            cell: (info) => {
                const trainer = info.row.original;
                return (
                    <div className="flex items-center gap-5 py-3">
                        <div className="w-14 h-14 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center text-[var(--primary)] font-bold overflow-hidden shrink-0 border border-[var(--border)] shadow-xl group-hover:border-[var(--primary)]/50 transition-all duration-300">
                            {trainer.photo ? (
                                <img src={trainer.photo} alt={info.getValue()} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 opacity-40" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="font-bold text-white text-base tracking-tight mb-1 group-hover:text-[var(--primary)] transition-colors">
                                {info.getValue()}
                            </div>
                            <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">{trainer.email}</div>
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('trainerTypeName', {
            header: 'TRAINER TYPE',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[var(--primary)]" />
                    <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                        {info.getValue() || <span className="text-[var(--text-tertiary)] font-normal normal-case">—</span>}
                    </span>
                </div>
            ),
        }),
        columnHelper.accessor('status', {
            header: 'READY STATUS',
            cell: (info) => {
                const status = info.getValue();
                const isActive = status === 'Active';
                return (
                    <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]' : 'bg-[var(--danger)]'}`} />
                         <span className={`font-black uppercase text-[10px] tracking-widest ${isActive ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                            {isActive ? 'ACTIVE' : 'STANDBY'}
                         </span>
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const trainer = row.original;
                return (
                    <div className="flex justify-end gap-3 px-6 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 duration-300">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onViewSchedule(trainer); }}
                            className="bg-[var(--surface-alt)] border-[var(--border)] h-10 w-10 p-0 hover:border-[var(--secondary)]/50 hover:text-[var(--secondary)] rounded-lg"
                            title="Operational Schedule"
                        >
                            <CalendarRange className="w-4 h-4" />
                        </Button>
                        <Can permission={PERMISSIONS.TRAINERS_EDIT}>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); onEdit(trainer); }}
                                className="bg-[var(--surface-alt)] border-[var(--border)] h-10 w-10 p-0 hover:border-[var(--primary)]/50 hover:text-[var(--primary)] rounded-lg"
                                title="Edit Operative"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                        </Can>
                        <Can permission={PERMISSIONS.TRAINERS_DELETE}>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleDelete(trainer); }}
                                className="bg-[var(--surface-alt)] border-[var(--border)] h-10 w-10 p-0 text-red-500 hover:bg-red-500/10 hover:border-red-500/30 rounded-lg"
                                title="Revoke Access"
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
        data: trainers || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return (
            <div className="p-24 flex flex-col items-center justify-center space-y-8">
                <div className="w-16 h-16 border-[5px] border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-2xl shadow-red-950/20" />
                <div className="text-center">
                    <p className="text-white font-bold text-lg uppercase tracking-widest animate-pulse">UPDATING ROSTER</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-center premium-card">
                <div className="w-20 h-20 rounded-2xl bg-red-950/20 flex items-center justify-center mb-8 border border-red-500/20">
                     <Trash2 className="w-8 h-8 text-red-500 opacity-50" />
                </div>
                <h3 className="text-3xl font-display font-black text-red-500 uppercase tracking-tighter">DATA LINK SEVERED</h3>
                <p className="text-[var(--text-secondary)] mt-4 max-w-sm mx-auto font-bold text-sm leading-relaxed">Operative roster inaccessible. Re-establishing secure satellite connection.</p>
                <Button variant="primary" className="mt-10 px-10 h-14 bg-[var(--primary)] shadow-2xl shadow-red-950/30" onClick={() => window.location.reload()}>RE-INITIALIZE LINK</Button>
            </div>
        );
    }

    if (!trainers?.length) {
        return (
            <div className="p-40 flex flex-col items-center justify-center text-center">
                <div className="relative mb-10">
                    <div className="w-28 h-28 bg-[var(--surface-alt)] rounded-3xl flex items-center justify-center border-4 border-dashed border-[var(--border)]">
                        <User className="w-14 h-14 text-[var(--text-tertiary)] opacity-20" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[var(--primary)] rounded-2xl flex items-center justify-center shadow-xl shadow-red-950/40">
                         <MoreVertical className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h3 className="text-4xl font-display font-black text-white uppercase tracking-tighter">ZERO OPERATIVES</h3>
                <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto font-bold text-base leading-relaxed">
                    Facility personnel roster is empty. Your core requires leadership to maintain peak output.
                </p>
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
                                onClick={() => onRowClick(row.original)}
                                className="hover:bg-[var(--surface-alt)]/40 transition-all group cursor-pointer"
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
