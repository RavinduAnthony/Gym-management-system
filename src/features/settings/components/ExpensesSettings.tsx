import { useState } from 'react';
import { TrendingUp, Plus, Trash2, Edit2, Check, X as XIcon, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import {
    useFixedExpenses, useCreateFixedExpense, useUpdateFixedExpense, useDeleteFixedExpense,
    useVariableExpenses, useCreateVariableExpense, useUpdateVariableExpense, useDeleteVariableExpense,
} from '@/hooks/useExpenses';
import type { FixedExpense, VariableExpense } from '@/features/settings/api/expenses-api';
import { toast } from 'sonner';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
}

// ─── Fixed Expenses Section ──────────────────────────────────────────────────

function FixedExpensesSection() {
    const { data: expenses, isLoading } = useFixedExpenses();
    const createExpense = useCreateFixedExpense();
    const updateExpense = useUpdateFixedExpense();
    const deleteExpense = useDeleteFixedExpense();

    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newExpense, setNewExpense] = useState({ name: '', amount: '', description: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState({ name: '', amount: '', description: '' });
    const [confirmDelete, setConfirmDelete] = useState<FixedExpense | null>(null);

    const handleAdd = () => {
        if (!newExpense.name.trim()) { toast.error('Expense name is required'); return; }
        const amount = parseFloat(newExpense.amount);
        if (isNaN(amount) || amount < 0) { toast.error('Enter a valid amount'); return; }
        createExpense.mutate(
            { name: newExpense.name.trim(), amount, description: newExpense.description.trim() || undefined },
            { onSuccess: () => { setNewExpense({ name: '', amount: '', description: '' }); setIsAddingMode(false); } }
        );
    };

    const startEdit = (expense: FixedExpense) => {
        setEditingId(expense.id);
        setEditValues({ name: expense.name, amount: String(expense.amount), description: expense.description ?? '' });
    };

    const cancelEdit = () => { setEditingId(null); };

    const handleSaveEdit = (expense: FixedExpense) => {
        if (!editValues.name.trim()) { toast.error('Expense name is required'); return; }
        const amount = parseFloat(editValues.amount);
        if (isNaN(amount) || amount < 0) { toast.error('Enter a valid amount'); return; }
        updateExpense.mutate(
            { id: expense.id, data: { name: editValues.name.trim(), amount, description: editValues.description.trim() || undefined, isActive: expense.isActive } },
            { onSuccess: () => setEditingId(null) }
        );
    };

    const handleDelete = () => {
        if (!confirmDelete) return;
        deleteExpense.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null), onError: () => setConfirmDelete(null) });
    };

    const totalFixed = expenses?.filter(e => e.isActive).reduce((sum, e) => sum + e.amount, 0) ?? 0;

    return (
        <>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-[var(--primary)]" /> Fixed Expenses
                        </h3>
                        <p className="text-[var(--text-tertiary)] text-xs font-bold mt-1">
                            Recurring monthly costs (rent, utilities, salaries…)
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {(expenses?.length ?? 0) > 0 && (
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Monthly Total</p>
                                <p className="text-lg font-black text-[var(--primary)]">{formatCurrency(totalFixed)}</p>
                            </div>
                        )}
                        {!isAddingMode && (
                            <Button variant="primary" onClick={() => setIsAddingMode(true)} className="h-11 px-6 text-xs">
                                <Plus className="w-4 h-4 mr-2" /> ADD
                            </Button>
                        )}
                    </div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[var(--surface-alt)]/50 border-b border-[var(--border)]">
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">#</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Expense Name</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Description</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-[var(--text-tertiary)] animate-pulse">Loading…</td></tr>
                            ) : expenses?.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-[var(--text-tertiary)] italic">No fixed expenses yet. Click ADD to create one.</td></tr>
                            ) : (
                                expenses?.map((expense, i) => (
                                    <motion.tr key={expense.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                        className="hover:bg-[var(--surface-alt)]/40 group transition-all">
                                        <td className="px-6 py-5"><span className="text-[var(--text-tertiary)] text-xs font-black">{i + 1}</span></td>

                                        <td className="px-6 py-5">
                                            {editingId === expense.id ? (
                                                <input autoFocus value={editValues.name} onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                                                    className="w-full bg-[var(--surface)] border border-[var(--primary)]/60 rounded-lg py-1.5 px-3 text-sm font-bold text-white outline-none" />
                                            ) : (
                                                <span className="text-white font-bold text-sm">{expense.name}</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-5">
                                            {editingId === expense.id ? (
                                                <input value={editValues.description} onChange={e => setEditValues(v => ({ ...v, description: e.target.value }))}
                                                    placeholder="Optional"
                                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-1.5 px-3 text-sm text-white outline-none focus:border-[var(--primary)]/60" />
                                            ) : (
                                                <span className="text-[var(--text-secondary)] text-sm">
                                                    {expense.description || <span className="italic text-[var(--text-tertiary)]">—</span>}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-5">
                                            {editingId === expense.id ? (
                                                <input type="number" min="0" value={editValues.amount} onChange={e => setEditValues(v => ({ ...v, amount: e.target.value }))}
                                                    className="w-32 bg-[var(--surface)] border border-[var(--primary)]/60 rounded-lg py-1.5 px-3 text-sm font-bold text-white outline-none" />
                                            ) : (
                                                <span className="text-white font-black text-sm">{formatCurrency(expense.amount)}</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${expense.isActive ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--text-tertiary)]'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${expense.isActive ? 'text-[var(--success)]' : 'text-[var(--text-tertiary)]'}`}>
                                                    {expense.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            {editingId === expense.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleSaveEdit(expense)} disabled={updateExpense.isPending}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--success)] hover:border-[var(--success)]/40 transition-all" title="Save">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={cancelEdit}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/30 transition-all" title="Cancel">
                                                        <XIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => startEdit(expense)}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all" title="Edit">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => setConfirmDelete(expense)} disabled={deleteExpense.isPending}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/30 transition-all" title="Delete">
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

                {isAddingMode && (
                    <div className="mt-4 bg-[var(--surface-alt)] border border-[var(--primary)]/30 p-5 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">New Fixed Expense</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Expense Name *</label>
                                <input autoFocus type="text" value={newExpense.name} onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    placeholder="e.g. Rent, Electricity"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm font-bold text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Amount (PKR) *</label>
                                <input type="number" min="0" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    placeholder="0"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm font-bold text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Description</label>
                                <input type="text" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    placeholder="Optional"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="secondary" onClick={() => { setIsAddingMode(false); setNewExpense({ name: '', amount: '', description: '' }); }}>Cancel</Button>
                            <Button variant="primary" onClick={handleAdd} disabled={createExpense.isPending}>
                                {createExpense.isPending ? 'Saving…' : 'Save Expense'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {confirmDelete && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setConfirmDelete(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 w-full max-w-sm mx-4 shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white uppercase tracking-wider">Delete Expense</h3>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mb-6">
                                Are you sure you want to delete <span className="font-bold text-white">"{confirmDelete.name}"</span>?
                            </p>
                            <div className="flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                                <button onClick={handleDelete} disabled={deleteExpense.isPending}
                                    className="flex-1 h-11 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-wider hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-50">
                                    {deleteExpense.isPending ? 'Deleting…' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Variable Expenses Section ───────────────────────────────────────────────

function VariableExpensesSection() {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

    const { data: expenses, isLoading } = useVariableExpenses(selectedMonth, selectedYear);
    const createExpense = useCreateVariableExpense();
    const updateExpense = useUpdateVariableExpense();
    const deleteExpense = useDeleteVariableExpense();

    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newExpense, setNewExpense] = useState({ name: '', amount: '', description: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState({ name: '', amount: '', description: '' });
    const [confirmDelete, setConfirmDelete] = useState<VariableExpense | null>(null);

    const navigateMonth = (delta: number) => {
        let m = selectedMonth + delta;
        let y = selectedYear;
        if (m > 12) { m = 1; y++; }
        if (m < 1) { m = 12; y--; }
        setSelectedMonth(m);
        setSelectedYear(y);
        setEditingId(null);
        setIsAddingMode(false);
    };

    const handleAdd = () => {
        if (!newExpense.name.trim()) { toast.error('Expense name is required'); return; }
        const amount = parseFloat(newExpense.amount);
        if (isNaN(amount) || amount < 0) { toast.error('Enter a valid amount'); return; }
        createExpense.mutate(
            { name: newExpense.name.trim(), amount, description: newExpense.description.trim() || undefined, month: selectedMonth, year: selectedYear },
            { onSuccess: () => { setNewExpense({ name: '', amount: '', description: '' }); setIsAddingMode(false); } }
        );
    };

    const startEdit = (expense: VariableExpense) => {
        setEditingId(expense.id);
        setEditValues({ name: expense.name, amount: String(expense.amount), description: expense.description ?? '' });
    };

    const handleSaveEdit = (expense: VariableExpense) => {
        if (!editValues.name.trim()) { toast.error('Expense name is required'); return; }
        const amount = parseFloat(editValues.amount);
        if (isNaN(amount) || amount < 0) { toast.error('Enter a valid amount'); return; }
        updateExpense.mutate(
            { id: expense.id, data: { name: editValues.name.trim(), amount, description: editValues.description.trim() || undefined, month: selectedMonth, year: selectedYear } },
            { onSuccess: () => setEditingId(null) }
        );
    };

    const handleDelete = () => {
        if (!confirmDelete) return;
        deleteExpense.mutate({ id: confirmDelete.id, month: selectedMonth, year: selectedYear },
            { onSuccess: () => setConfirmDelete(null), onError: () => setConfirmDelete(null) });
    };

    const totalVariable = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

    return (
        <>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-[var(--warning)]" /> Variable Expenses
                        </h3>
                        <p className="text-[var(--text-tertiary)] text-xs font-bold mt-1">
                            One-time costs for a specific month
                        </p>
                    </div>
                </div>

                {/* Month Navigator */}
                <div className="flex items-center justify-between mb-6 bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl p-4">
                    <button onClick={() => navigateMonth(-1)}
                        className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-[var(--primary)]/40 transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                        <p className="text-lg font-black text-white">{MONTHS[selectedMonth - 1]}</p>
                        <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">{selectedYear}</p>
                    </div>
                    <button onClick={() => navigateMonth(1)}
                        className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-[var(--primary)]/40 transition-all">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                    {(expenses?.length ?? 0) > 0 && (
                        <div>
                            <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Month Total</p>
                            <p className="text-xl font-black text-[var(--warning)]">{formatCurrency(totalVariable)}</p>
                        </div>
                    )}
                    <div className="ml-auto">
                        {!isAddingMode && (
                            <Button variant="primary" onClick={() => setIsAddingMode(true)} className="h-11 px-6 text-xs">
                                <Plus className="w-4 h-4 mr-2" /> ADD
                            </Button>
                        )}
                    </div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[var(--surface-alt)]/50 border-b border-[var(--border)]">
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">#</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Expense Name</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Description</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-[var(--text-tertiary)] animate-pulse">Loading…</td></tr>
                            ) : expenses?.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-[var(--text-tertiary)] italic">No variable expenses for {MONTHS[selectedMonth - 1]} {selectedYear}.</td></tr>
                            ) : (
                                expenses?.map((expense, i) => (
                                    <motion.tr key={expense.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                        className="hover:bg-[var(--surface-alt)]/40 group transition-all">
                                        <td className="px-6 py-5"><span className="text-[var(--text-tertiary)] text-xs font-black">{i + 1}</span></td>

                                        <td className="px-6 py-5">
                                            {editingId === expense.id ? (
                                                <input autoFocus value={editValues.name} onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                                                    className="w-full bg-[var(--surface)] border border-[var(--primary)]/60 rounded-lg py-1.5 px-3 text-sm font-bold text-white outline-none" />
                                            ) : (
                                                <span className="text-white font-bold text-sm">{expense.name}</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-5">
                                            {editingId === expense.id ? (
                                                <input value={editValues.description} onChange={e => setEditValues(v => ({ ...v, description: e.target.value }))}
                                                    placeholder="Optional"
                                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-1.5 px-3 text-sm text-white outline-none focus:border-[var(--primary)]/60" />
                                            ) : (
                                                <span className="text-[var(--text-secondary)] text-sm">
                                                    {expense.description || <span className="italic text-[var(--text-tertiary)]">—</span>}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-5">
                                            {editingId === expense.id ? (
                                                <input type="number" min="0" value={editValues.amount} onChange={e => setEditValues(v => ({ ...v, amount: e.target.value }))}
                                                    className="w-32 bg-[var(--surface)] border border-[var(--primary)]/60 rounded-lg py-1.5 px-3 text-sm font-bold text-white outline-none" />
                                            ) : (
                                                <span className="text-white font-black text-sm">{formatCurrency(expense.amount)}</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            {editingId === expense.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleSaveEdit(expense)} disabled={updateExpense.isPending}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--success)] hover:border-[var(--success)]/40 transition-all">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/30 transition-all">
                                                        <XIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => startEdit(expense)}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => setConfirmDelete(expense)} disabled={deleteExpense.isPending}
                                                        className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/30 transition-all">
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

                {isAddingMode && (
                    <div className="mt-4 bg-[var(--surface-alt)] border border-[var(--primary)]/30 p-5 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">New Variable Expense — {MONTHS[selectedMonth - 1]} {selectedYear}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Expense Name *</label>
                                <input autoFocus type="text" value={newExpense.name} onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    placeholder="e.g. Equipment repair"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm font-bold text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Amount (PKR) *</label>
                                <input type="number" min="0" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    placeholder="0"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm font-bold text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Description</label>
                                <input type="text" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    placeholder="Optional"
                                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="secondary" onClick={() => { setIsAddingMode(false); setNewExpense({ name: '', amount: '', description: '' }); }}>Cancel</Button>
                            <Button variant="primary" onClick={handleAdd} disabled={createExpense.isPending}>
                                {createExpense.isPending ? 'Saving…' : 'Save Expense'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {confirmDelete && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setConfirmDelete(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 w-full max-w-sm mx-4 shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white uppercase tracking-wider">Delete Expense</h3>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mb-6">
                                Are you sure you want to delete <span className="font-bold text-white">"{confirmDelete.name}"</span>?
                            </p>
                            <div className="flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                                <button onClick={handleDelete} disabled={deleteExpense.isPending}
                                    className="flex-1 h-11 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-wider hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-50">
                                    {deleteExpense.isPending ? 'Deleting…' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function ExpensesSettings() {
    return (
        <div className="space-y-8 pb-10">
            <FixedExpensesSection />
            <VariableExpensesSection />
        </div>
    );
}
