import { useState } from 'react';
import { Dumbbell, Plus, Trash2, Edit2, Check, X as XIcon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useTrainerTypes, useCreateTrainerType, useUpdateTrainerType, useDeleteTrainerType } from '@/hooks/useTrainerTypes';
import type { TrainerType } from '@/features/settings/api/trainer-types-api';
import { toast } from 'sonner';

export function TrainerTypeSettings() {
    const { data: trainerTypes, isLoading } = useTrainerTypes();
    const createTrainerType = useCreateTrainerType();
    const updateTrainerType = useUpdateTrainerType();
    const deleteTrainerType = useDeleteTrainerType();

    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newType, setNewType] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState({ name: '', description: '' });
    const [confirmDeleteType, setConfirmDeleteType] = useState<TrainerType | null>(null);

    const handleAdd = () => {
        if (!newType.name.trim()) {
            toast.error('Trainer type name is required');
            return;
        }
        createTrainerType.mutate(
            { name: newType.name.trim(), description: newType.description.trim() || undefined },
            {
                onSuccess: () => {
                    setNewType({ name: '', description: '' });
                    setIsAddingMode(false);
                },
            }
        );
    };

    const startEdit = (type: TrainerType) => {
        setEditingId(type.id);
        setEditValues({ name: type.name, description: type.description ?? '' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValues({ name: '', description: '' });
    };

    const handleDelete = () => {
        if (!confirmDeleteType) return;
        deleteTrainerType.mutate(confirmDeleteType.id, {
            onSuccess: () => setConfirmDeleteType(null),
            onError: () => setConfirmDeleteType(null),
        });
    };

    const handleSaveEdit = (type: TrainerType) => {
        if (!editValues.name.trim()) {
            toast.error('Trainer type name is required');
            return;
        }
        updateTrainerType.mutate(
            {
                id: type.id,
                data: { name: editValues.name.trim(), description: editValues.description.trim() || undefined, isActive: type.isActive },
            },
            { onSuccess: () => setEditingId(null) }
        );
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                            <Dumbbell className="w-5 h-5 text-[var(--primary)]" /> Trainer Types
                        </h3>
                        <p className="text-[var(--text-tertiary)] text-xs font-bold mt-1">
                            Define trainer categories for your facility
                        </p>
                    </div>
                    {!isAddingMode && (
                        <Button variant="primary" onClick={() => setIsAddingMode(true)} className="h-11 px-6 text-xs">
                            <Plus className="w-4 h-4 mr-2" /> ADD TYPE
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[var(--surface-alt)]/50 border-b border-[var(--border)]">
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">#</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Type Name</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Description</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[var(--text-tertiary)] animate-pulse">
                                        Loading trainer types...
                                    </td>
                                </tr>
                            ) : trainerTypes?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[var(--text-tertiary)] italic">
                                        No trainer types yet. Click ADD TYPE to create one.
                                    </td>
                                </tr>
                            ) : (
                                trainerTypes?.map((type, i) => (
                                    <motion.tr
                                        key={type.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="hover:bg-[var(--surface-alt)]/40 group transition-all"
                                    >
                                        <td className="px-6 py-5">
                                            <span className="text-[var(--text-tertiary)] text-xs font-black">{i + 1}</span>
                                        </td>

                                        {/* Name cell — editable */}
                                        <td className="px-6 py-5">
                                            {editingId === type.id ? (
                                                <input
                                                    autoFocus
                                                    value={editValues.name}
                                                    onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                                                    className="w-full bg-[var(--surface)] border border-[var(--primary)]/60 rounded-lg py-1.5 px-3 text-sm font-bold text-white outline-none"
                                                />
                                            ) : (
                                                <span className="text-white font-bold text-sm">{type.name}</span>
                                            )}
                                        </td>

                                        {/* Description cell — editable */}
                                        <td className="px-6 py-5">
                                            {editingId === type.id ? (
                                                <input
                                                    value={editValues.description}
                                                    onChange={e => setEditValues(v => ({ ...v, description: e.target.value }))}
                                                    placeholder="Optional"
                                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-1.5 px-3 text-sm text-white outline-none focus:border-[var(--primary)]/60"
                                                />
                                            ) : (
                                                <span className="text-[var(--text-secondary)] text-sm">
                                                    {type.description || <span className="italic text-[var(--text-tertiary)]">—</span>}
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${type.isActive ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--text-tertiary)]'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${type.isActive ? 'text-[var(--success)]' : 'text-[var(--text-tertiary)]'}`}>
                                                    {type.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5 text-right">
                                            {editingId === type.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(type)}
                                                        disabled={updateTrainerType.isPending}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--success)] hover:border-[var(--success)]/40 transition-all"
                                                        title="Save"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/30 transition-all"
                                                        title="Cancel"
                                                    >
                                                        <XIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => startEdit(type)}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteType(type)}
                                                        disabled={deleteTrainerType.isPending}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/30 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add Inline Form */}
                {isAddingMode && (
                    <div className="mt-4 bg-[var(--surface-alt)] border border-[var(--primary)]/30 p-5 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">New Trainer Type</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">
                                    Type Name *
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newType.name}
                                    onChange={e => setNewType({ ...newType, name: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    placeholder="e.g. Personal Trainer, Yoga Instructor"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm font-bold text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={newType.description}
                                    onChange={e => setNewType({ ...newType, description: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    placeholder="Optional description"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm font-bold text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="secondary" onClick={() => { setIsAddingMode(false); setNewType({ name: '', description: '' }); }}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleAdd} disabled={createTrainerType.isPending}>
                                {createTrainerType.isPending ? 'Saving...' : 'Save Type'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDeleteType && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setConfirmDeleteType(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 w-full max-w-sm mx-4 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white uppercase tracking-wider">Delete Trainer Type</h3>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mb-6">
                                Are you sure you want to delete{' '}
                                <span className="font-bold text-white">"{confirmDeleteType.name}"</span>?
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setConfirmDeleteType(null)}
                                >
                                    Cancel
                                </Button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteTrainerType.isPending}
                                    className="flex-1 h-11 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-wider hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-50"
                                >
                                    {deleteTrainerType.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

