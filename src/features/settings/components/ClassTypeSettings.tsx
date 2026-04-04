import { useState } from 'react';
import { CalendarRange, Plus, Trash2, Edit2, Check, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useClassTypes, useCreateClassType, useUpdateClassType, useDeleteClassType } from '@/hooks/useClassTypes';
import type { ClassType } from '@/features/settings/api/class-types-api';
import { toast } from 'sonner';

export function ClassTypeSettings() {
    const { data: classTypes, isLoading } = useClassTypes();
    const createClassType = useCreateClassType();
    const updateClassType = useUpdateClassType();
    const deleteClassType = useDeleteClassType();

    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newType, setNewType] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState({ name: '', description: '' });
    const [confirmDeleteType, setConfirmDeleteType] = useState<ClassType | null>(null);

    const handleAdd = () => {
        if (!newType.name.trim()) {
            toast.error('Class type name is required');
            return;
        }
        createClassType.mutate(
            { name: newType.name.trim(), description: newType.description.trim() || undefined },
            {
                onSuccess: () => {
                    setNewType({ name: '', description: '' });
                    setIsAddingMode(false);
                },
            }
        );
    };

    const startEdit = (type: ClassType) => {
        setEditingId(type.id);
        setEditValues({ name: type.name, description: type.description ?? '' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValues({ name: '', description: '' });
    };

    const handleSaveEdit = (type: ClassType) => {
        if (!editValues.name.trim()) {
            toast.error('Class type name is required');
            return;
        }
        updateClassType.mutate(
            {
                id: type.id,
                data: {
                    name: editValues.name.trim(),
                    description: editValues.description.trim() || undefined,
                    isActive: type.isActive,
                },
            },
            { onSuccess: () => setEditingId(null) }
        );
    };

    const handleDelete = () => {
        if (!confirmDeleteType) return;
        deleteClassType.mutate(confirmDeleteType.id, {
            onSuccess: () => setConfirmDeleteType(null),
            onError: () => setConfirmDeleteType(null),
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                            <CalendarRange className="w-5 h-5 text-[var(--secondary)]" /> Class Types
                        </h3>
                        <p className="text-[var(--text-tertiary)] text-xs font-bold mt-1">
                            Define class categories available for group sessions
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
                                        Loading class types...
                                    </td>
                                </tr>
                            ) : classTypes?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[var(--text-tertiary)] italic">
                                        No class types yet. Click ADD TYPE to create one.
                                    </td>
                                </tr>
                            ) : (
                                classTypes?.map((type, i) => (
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

                                        {/* Name — editable */}
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

                                        {/* Description — editable */}
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
                                                        disabled={updateClassType.isPending}
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
                                                        disabled={deleteClassType.isPending}
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

                {/* Add Form */}
                <AnimatePresence>
                    {isAddingMode && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mt-4 bg-[var(--surface-alt)] border border-[var(--primary)]/30 p-5 rounded-xl space-y-4"
                        >
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">New Class Type</h4>
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
                                        placeholder="e.g. Yoga, HIIT, Zumba"
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
                                <Button
                                    variant="secondary"
                                    onClick={() => { setIsAddingMode(false); setNewType({ name: '', description: '' }); }}
                                >
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleAdd} disabled={createClassType.isPending}>
                                    {createClassType.isPending ? 'Saving...' : 'Save Type'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDeleteType && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setConfirmDeleteType(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 max-w-md w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider text-center mb-2">
                                Delete Class Type?
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
                                Are you sure you want to delete <span className="text-white font-bold">"{confirmDeleteType.name}"</span>?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setConfirmDeleteType(null)}>
                                    Cancel
                                </Button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteClassType.isPending}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-all disabled:opacity-50"
                                >
                                    {deleteClassType.isPending ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
