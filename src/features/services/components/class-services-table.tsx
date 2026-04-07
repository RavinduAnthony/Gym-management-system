import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Edit2, Trash2, CalendarRange, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { gymClassesApi } from '../api/class-services-api';
import { deleteToastClassNames } from '@/lib/toast-styles';
import type { GymClass } from '../schemas/class-service-schema';

const col = createColumnHelper<GymClass>();

interface Props {
    onEdit: (item: GymClass) => void;
    onView: (item: GymClass) => void;
}

export function GymClassesTable({ onEdit, onView }: Props) {
    const queryClient = useQueryClient();

    const { data: classes = [], isLoading, isError } = useQuery({
        queryKey: ['gymClasses'],
        queryFn: gymClassesApi.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => gymClassesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gymClasses'] });
            toast.success('Class deleted');
        },
        onError: () => toast.error('Failed to delete class'),
    });

    const handleDelete = (item: GymClass) => {
        toast(`Delete "${item.name}"?`, {
            description: 'This will permanently remove the class and all its schedules.',
            duration: 8000,
            classNames: deleteToastClassNames,
            action: { label: 'Delete', onClick: () => deleteMutation.mutate(item.id) },
            cancel: { label: 'Cancel', onClick: () => {} },
        });
    };

    const columns = [
        col.accessor('name', {
            header: 'CLASS',
            cell: info => {
                const row = info.row.original;
                return (
                    <div className="flex items-center gap-3 py-1">
                        {row.instructorPhoto ? (
                            <img src={row.instructorPhoto} alt="" className="w-10 h-10 rounded-xl object-cover border border-[var(--border)] flex-shrink-0" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                                <CalendarRange className="w-4 h-4 text-[var(--primary)]" />
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-white text-sm leading-tight">{info.getValue()}</p>
                            {row.category && <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-semibold">{row.category}</p>}
                        </div>
                    </div>
                );
            }
        }),
        col.accessor('instructorName', {
            header: 'INSTRUCTOR',
            cell: info => (
                <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{info.getValue() ?? '—'}</p>
                    {info.row.original.instructorSpecialization && (
                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">{info.row.original.instructorSpecialization}</p>
                    )}
                </div>
            )
        }),
        col.accessor('defaultAmount', {
            header: 'RATE (LKR)',
            cell: info => (
                <span className="font-black text-[var(--primary)]">
                    {info.getValue().toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </span>
            )
        }),
        col.accessor('branchName', {
            header: 'BRANCH',
            cell: info => (
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{info.getValue() ?? '—'}</span>
                </div>
            )
        }),
        col.accessor('status', {
            header: 'STATUS',
            cell: info => {
                const active = info.getValue() === 'Active';
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-zinc-700/40 text-zinc-500 border-zinc-600/30'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-zinc-500'}`} />
                        {info.getValue()}
                    </span>
                );
            }
        }),
        col.display({
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(row.original); }} className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(row.original); }}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }),
    ];

    const table = useReactTable({ data: classes, columns, getCoreRowModel: getCoreRowModel() });

    if (isLoading) return (
        <div className="flex items-center justify-center py-16 text-[var(--text-tertiary)]">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (isError) return (
        <div className="flex flex-col items-center justify-center py-16 text-red-400">
            <CalendarRange className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm font-bold">FAILED TO LOAD CLASSES</p>
        </div>
    );

    if (classes.length === 0) return (
        <div className="flex flex-col items-center justify-center py-16">
            <CalendarRange className="w-12 h-12 mb-4 text-[var(--primary)]/30" />
            <p className="text-[var(--text-tertiary)] text-sm font-black uppercase tracking-widest">No Classes Registered Yet</p>
        </div>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    {table.getHeaderGroups().map(hg => (
                        <tr key={hg.id} className="border-b border-[var(--border)] bg-[var(--surface-alt)]/50">
                            {hg.headers.map(h => (
                                <th key={h.id} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] whitespace-nowrap">
                                    {!h.isPlaceholder && flexRender(h.column.columnDef.header, h.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    <AnimatePresence>
                        {table.getRowModel().rows.map((row, i) => (
                            <motion.tr
                                key={row.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="group border-b border-[var(--border)]/50 hover:bg-[var(--surface-alt)]/40 transition-all cursor-pointer"
                                onClick={() => onView(row.original)}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-6 py-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
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
