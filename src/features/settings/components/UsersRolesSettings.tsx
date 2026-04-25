// src/features/settings/components/UsersRolesSettings.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Users, ShieldCheck, Crown, Plus, ArrowLeft, Edit2, Trash2, X,
    KeyRound, Loader2, Lock, ChevronRight,
    LayoutDashboard, Package, Dumbbell, CalendarRange,
    DollarSign, ClipboardCheck, BarChart2, Settings as SettingsIcon,
    CheckCircle2, RefreshCw, Mail, Phone, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Can, PERMISSIONS } from '@/core/permissions';
import { rolesApi, type RolePermissionDto } from '../api/roles-api';
import { usersApi, type CreateUserPayload } from '../api/users-api';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Types & Constants
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
type View = 'hub' | 'user-management' | 'role-list' | 'role-editor';
type AccessLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

interface LevelMeta {
    label: string;
    description: string;
    activeClass: string;
    textColor: string;
}

const LEVEL_META: Record<AccessLevel, LevelMeta> = {
    L1: { label: 'No Access',        description: 'Cannot see this section',             activeClass: 'bg-zinc-600/20 border-zinc-500/40 text-zinc-400',         textColor: 'text-zinc-400' },
    L2: { label: 'View Only',        description: 'Read-only access',                    activeClass: 'bg-blue-500/15 border-blue-500/40 text-blue-400',         textColor: 'text-blue-400' },
    L3: { label: 'Add / View',       description: 'View and create records',             activeClass: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400', textColor: 'text-emerald-400' },
    L4: { label: 'Add / Edit / View',description: 'View, create and edit records',       activeClass: 'bg-violet-500/15 border-violet-500/40 text-violet-400',   textColor: 'text-violet-400' },
    L5: { label: 'Full Access',      description: 'Complete control including delete',   activeClass: 'bg-[var(--primary)]/15 border-[var(--primary)]/40 text-[var(--primary)]', textColor: 'text-[var(--primary)]' },
};

interface SectionDef {
    id: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    levels: Record<AccessLevel, string[]>;
}

const SECTIONS: SectionDef[] = [
    {
        id: 'Dashboard', label: 'Dashboard', Icon: LayoutDashboard,
        levels: { L1: [], L2: ['dashboard.view'], L3: ['dashboard.view'], L4: ['dashboard.view'], L5: ['dashboard.view'] },
    },
    {
        id: 'Members', label: 'Members', Icon: Users,
        levels: { L1: [], L2: ['members.view'], L3: ['members.view', 'members.create'], L4: ['members.view', 'members.create', 'members.edit'], L5: ['members.view', 'members.create', 'members.edit', 'members.delete'] },
    },
    {
        id: 'Packages', label: 'Memberships / Packages', Icon: Package,
        levels: { L1: [], L2: ['packages.view'], L3: ['packages.view', 'packages.create'], L4: ['packages.view', 'packages.create', 'packages.edit'], L5: ['packages.view', 'packages.create', 'packages.edit', 'packages.delete'] },
    },
    {
        id: 'Trainers', label: 'Trainers', Icon: Dumbbell,
        levels: { L1: [], L2: ['trainers.view'], L3: ['trainers.view', 'trainers.create'], L4: ['trainers.view', 'trainers.create', 'trainers.edit'], L5: ['trainers.view', 'trainers.create', 'trainers.edit', 'trainers.delete'] },
    },
    {
        id: 'Services', label: 'Services', Icon: CalendarRange,
        levels: { L1: [], L2: ['services.view'], L3: ['services.view', 'services.manage'], L4: ['services.view', 'services.manage'], L5: ['services.view', 'services.manage'] },
    },
    {
        id: 'Payments', label: 'Payments', Icon: DollarSign,
        levels: { L1: [], L2: ['payments.view'], L3: ['payments.view', 'payments.create'], L4: ['payments.view', 'payments.create'], L5: ['payments.view', 'payments.create'] },
    },
    {
        id: 'Attendance', label: 'Attendance', Icon: ClipboardCheck,
        levels: { L1: [], L2: ['attendance.view'], L3: ['attendance.view', 'attendance.check_in'], L4: ['attendance.view', 'attendance.check_in'], L5: ['attendance.view', 'attendance.check_in'] },
    },
    {
        id: 'Reports', label: 'Reports', Icon: BarChart2,
        levels: { L1: [], L2: ['reports.view'], L3: ['reports.view'], L4: ['reports.view'], L5: ['reports.view'] },
    },
    {
        id: 'Settings', label: 'Settings', Icon: SettingsIcon,
        levels: { L1: [], L2: ['settings.view'], L3: ['settings.view', 'settings.users_manage'], L4: ['settings.view', 'settings.users_manage'], L5: ['settings.view', 'settings.users_manage'] },
    },
];

const inputCls = 'w-full h-11 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 text-sm text-white placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--primary)]/60 transition-colors';
const labelCls = 'text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block';

function getAllSectionKeys(section: SectionDef): string[] {
    return [...new Set(Object.values(section.levels).flat())];
}

function inferLevel(section: SectionDef, permSet: Set<string>): AccessLevel {
    let best: AccessLevel = 'L1';
    for (const lvl of ['L1', 'L2', 'L3', 'L4', 'L5'] as AccessLevel[]) {
        if (section.levels[lvl].every(k => permSet.has(k))) best = lvl;
    }
    return best;
}

function buildPermPayload(sectionLevels: Record<string, AccessLevel>): RolePermissionDto[] {
    const result: RolePermissionDto[] = [];
    for (const section of SECTIONS) {
        const level = sectionLevels[section.id] ?? 'L1';
        const grantedKeys = section.levels[level];
        for (const key of getAllSectionKeys(section)) {
            result.push({ permissionKey: key, isAllowed: grantedKeys.includes(key) });
        }
    }
    return result;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// User Management View
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const inputCls2 = inputCls;
const labelCls2 = labelCls;

function generateOtp(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

interface CreateUserForm {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    customRole: string;
    otp: string;
}

function UserManagementView({ onBack }: { onBack: () => void }) {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);

    const { data: users = [], isLoading: loadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getAll,
    });

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: rolesApi.getAll,
    });

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateUserForm>();
    const otpValue = watch('otp');

    // Auto-generate OTP when form opens
    useEffect(() => {
        if (showForm) setValue('otp', generateOtp());
    }, [showForm, setValue]);

    const createMutation = useMutation({
        mutationFn: (data: CreateUserForm) => {
            const payload: CreateUserPayload = {
                firstName:    data.firstName,
                lastName:     data.lastName,
                mobileNumber: data.mobileNumber,
                email:        data.email,
                dateOfBirth:  data.dateOfBirth || undefined,
                gender:       data.gender || undefined,
                customRole:   data.customRole,
            };
            return usersApi.create(payload);
        },
        onSuccess: (result) => {
            qc.invalidateQueries({ queryKey: ['users'] });
            if (result.emailSent) {
                toast.success(`User created! Credentials emailed to ${result.email}`);
            } else {
                toast.warning(`User created but email failed: ${result.emailError ?? 'Unknown error'}`);
            }
            reset();
            setShowForm(false);
        },
        onError: () => toast.error('Failed to create user'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => usersApi.remove(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted'); },
        onError: () => toast.error('Failed to delete user'),
    });

    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const customRoles = roles.filter(r => !r.isSystem);
    const systemRoles = roles.filter(r => r.isSystem);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider">User Management</h3>
                        <p className="text-[var(--text-tertiary)] text-xs font-bold mt-0.5">Register staff accounts â€” OTP is auto-generated and emailed</p>
                    </div>
                </div>
                <Can permission={PERMISSIONS.SETTINGS_USERS_MANAGE}>
                    <Button variant="primary" className="h-11 px-6 text-xs" onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" /> ADD USER
                    </Button>
                </Can>
            </div>

            {/* Users table */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                {loadingUsers ? (
                    <div className="flex items-center justify-center h-32 text-[var(--text-tertiary)] text-sm animate-pulse">Loading usersâ€¦</div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-[var(--text-tertiary)]">
                        <Users className="w-10 h-10 mb-3 opacity-30" />
                        <p className="text-sm font-bold">No users yet</p>
                        <p className="text-xs mt-1">Click ADD USER to register the first staff account</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--surface-alt)]/40">
                                    {['Name', 'Mobile', 'Email', 'Role', 'Status', ''].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, i) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                        className="border-b border-[var(--border)]/50 last:border-0 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 flex items-center justify-center shrink-0">
                                                    <span className="text-[var(--secondary)] text-xs font-black">{user.firstName[0]}{user.lastName[0]}</span>
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-bold">{user.firstName} {user.lastName}</p>
                                                    {user.dateOfBirth && <p className="text-[var(--text-tertiary)] text-[10px]">{new Date(user.dateOfBirth).toLocaleDateString()}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">{user.mobileNumber || 'â€”'}</td>
                                        <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">{user.email}</td>
                                        <td className="px-5 py-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[9px] font-black uppercase tracking-widest">
                                                {user.customRole || user.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${user.isActive ? 'bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]' : 'bg-zinc-700/30 border-zinc-600/30 text-zinc-400'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <Can permission={PERMISSIONS.SETTINGS_USERS_MANAGE}>
                                                <button
                                                    onClick={() => setConfirmDeleteId(user.id)}
                                                    className="w-9 h-9 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400/30 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </Can>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create User Dialog */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-2xl shadow-2xl my-8"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Dialog header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)] bg-[var(--surface-alt)]/40 rounded-t-2xl">
                                <div>
                                    <h2 className="text-base font-black text-white uppercase tracking-wider">Register New User</h2>
                                    <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">OTP is auto-generated and sent via email on save</p>
                                </div>
                                <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="p-8 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelCls2}>First Name *</label>
                                        <input {...register('firstName', { required: true })} className={inputCls2} placeholder="John" />
                                        {errors.firstName && <p className="text-red-400 text-[10px] mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls2}>Last Name *</label>
                                        <input {...register('lastName', { required: true })} className={inputCls2} placeholder="Smith" />
                                        {errors.lastName && <p className="text-red-400 text-[10px] mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls2}><Phone className="w-3 h-3 inline mr-1" />Mobile Number *</label>
                                        <input {...register('mobileNumber', { required: true })} className={inputCls2} placeholder="+1 234 567 8900" />
                                        {errors.mobileNumber && <p className="text-red-400 text-[10px] mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls2}><Mail className="w-3 h-3 inline mr-1" />Email Address *</label>
                                        <input {...register('email', { required: true })} type="email" className={inputCls2} placeholder="john@example.com" />
                                        {errors.email && <p className="text-red-400 text-[10px] mt-1">Required</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls2}><Calendar className="w-3 h-3 inline mr-1" />Date of Birth</label>
                                        <input {...register('dateOfBirth')} type="date" className={inputCls2} />
                                    </div>
                                    <div>
                                        <label className={labelCls2}>Gender</label>
                                        <select {...register('gender')} className={`${inputCls2} cursor-pointer`}>
                                            <option value="">â€” Select â€”</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls2}>Assigned Role *</label>
                                    <select {...register('customRole', { required: true })} className={`${inputCls2} cursor-pointer`}>
                                        <option value="">â€” Select a role â€”</option>
                                        {customRoles.length > 0 && (
                                            <optgroup label="Custom Roles">
                                                {customRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                            </optgroup>
                                        )}
                                        {systemRoles.length > 0 && (
                                            <optgroup label="System Roles">
                                                {systemRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                            </optgroup>
                                        )}
                                    </select>
                                    {errors.customRole && <p className="text-red-400 text-[10px] mt-1">Required</p>}
                                </div>

                                <div>
                                    <label className={labelCls2}>One-Time Password (auto-generated, read-only)</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={otpValue ?? ''}
                                            readOnly
                                            className={`${inputCls2} font-mono tracking-widest bg-[var(--surface-alt)]/60 cursor-not-allowed`}
                                            {...register('otp')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setValue('otp', generateOtp())}
                                            className="w-11 h-11 shrink-0 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-all"
                                            title="Regenerate"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">This password will be emailed to the user on registration</p>
                                </div>

                                <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
                                    <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button variant="primary" type="submit" disabled={createMutation.isPending} className="px-8 gap-2">
                                        {createMutation.isPending
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Registeringâ€¦</>
                                            : <><Mail className="w-4 h-4" /> Register &amp; Send Email</>
                                        }
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete confirmation */}
            <AnimatePresence>
                {confirmDeleteId && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setConfirmDeleteId(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm shadow-2xl p-8"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">Delete User</h3>
                            <p className="text-sm text-[var(--text-tertiary)] mb-6 leading-relaxed">
                                This will permanently remove the user account. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                                <button
                                    onClick={() => { deleteMutation.mutate(confirmDeleteId); setConfirmDeleteId(null); }}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Hub View â€” two-card dashboard
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function HubView({ onGoToRoles, onGoToUsers }: { onGoToRoles: () => void; onGoToUsers: () => void }) {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                    <KeyRound className="w-5 h-5 text-[var(--secondary)]" /> Users & Access Control
                </h3>
                <p className="text-[var(--text-tertiary)] text-xs font-bold mt-1">
                    Manage staff accounts and role-based UI access across the application
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Management card â€” active */}
                <motion.button
                    onClick={onGoToUsers}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 overflow-hidden text-left group hover:border-[var(--secondary)]/50 transition-all cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <span className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-[9px] font-black uppercase tracking-widest">
                        Active
                    </span>
                    <div className="w-16 h-16 rounded-2xl bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 flex items-center justify-center mb-6">
                        <Users className="w-8 h-8 text-[var(--secondary)]" />
                    </div>
                    <h4 className="text-base font-black text-white uppercase tracking-wider mb-2">User Management</h4>
                    <p className="text-[var(--text-tertiary)] text-sm mb-6 leading-relaxed">
                        Create staff accounts and assign roles to control access levels.
                    </p>
                    <div className="space-y-2 mb-6">
                        {['Create staff logins', 'Assign roles to users', 'OTP sent via email'].map(f => (
                            <div key={f} className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[var(--success)]" /> {f}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--secondary)] text-xs font-black uppercase tracking-widest">
                        Manage Users <ChevronRight className="w-4 h-4" />
                    </div>
                </motion.button>

                {/* Role Management card â€” active */}
                <motion.button
                    onClick={onGoToRoles}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 overflow-hidden text-left group hover:border-[var(--primary)]/50 transition-all cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <span className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-[9px] font-black uppercase tracking-widest">
                        Active
                    </span>
                    <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center mb-6">
                        <ShieldCheck className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                    <h4 className="text-base font-black text-white uppercase tracking-wider mb-2">Role Management</h4>
                    <p className="text-[var(--text-tertiary)] text-sm mb-6 leading-relaxed">
                        Define roles and set L1â€“L5 access levels for every section of the app.
                    </p>
                    <div className="space-y-2 mb-6">
                        {[
                            ['text-[var(--success)]', 'Create custom roles'],
                            ['text-[var(--success)]', 'Set L1â€“L5 access per section'],
                            ['text-[var(--success)]', 'Instant permission updates'],
                        ].map(([cls, label]) => (
                            <div key={label} className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${cls}`} /> {label}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--primary)] text-xs font-black uppercase tracking-widest">
                        Configure Roles <ChevronRight className="w-4 h-4" />
                    </div>
                </motion.button>
            </div>

            {/* Access level legend */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
                <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-4">Access Level Reference</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {(['L1', 'L2', 'L3', 'L4', 'L5'] as AccessLevel[]).map(lvl => {
                        const m = LEVEL_META[lvl];
                        return (
                            <div key={lvl} className={`p-4 rounded-xl border ${m.activeClass}`}>
                                <div className="text-base font-black mb-1">{lvl}</div>
                                <div className="text-[9px] font-black uppercase tracking-widest mb-1">{m.label}</div>
                                <div className="text-[9px] opacity-60 leading-tight">{m.description}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Create Role Dialog
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
interface CreateRoleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (roleName: string) => void;
}

function CreateRoleDialog({ isOpen, onClose, onCreated }: CreateRoleDialogProps) {
    const qc = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string; color: string }>();

    const mutation = useMutation({
        mutationFn: (data: { name: string; color: string }) =>
            rolesApi.create({ name: data.name, color: data.color || undefined }),
        onSuccess: (role) => {
            qc.invalidateQueries({ queryKey: ['roles'] });
            toast.success(`Role "${role.name}" created`);
            reset();
            onCreated(role.name);
            onClose();
        },
        onError: () => toast.error('Failed to create role'),
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)] bg-[var(--surface-alt)]/40">
                            <div>
                                <h2 className="text-base font-black text-white uppercase tracking-wider">Create New Role</h2>
                                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Define a custom permission profile</p>
                            </div>
                            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="p-8 space-y-5">
                            <div>
                                <label className={labelCls}>Role Name *</label>
                                <input {...register('name', { required: true })} className={inputCls} placeholder="e.g. Front Desk, Senior Trainer" />
                                {errors.name && <p className="text-red-400 text-[10px] mt-1">Required</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Role Color</label>
                                <input type="color" {...register('color')} defaultValue="#6366F1" className="w-full h-11 rounded-xl border border-[var(--border)] bg-transparent cursor-pointer" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
                                <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                                <Button variant="primary" type="submit" disabled={mutation.isPending} className="px-8">
                                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Role'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Role List View
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
interface RoleListViewProps {
    onBack: () => void;
    onEditRole: (roleName: string) => void;
}

function RoleListView({ onBack, onEditRole }: RoleListViewProps) {
    const qc = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const { data: roles = [], isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: rolesApi.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: (name: string) => rolesApi.remove(name),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Role deleted'); },
        onError: () => toast.error('Cannot delete system roles'),
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider">Role Management</h3>
                        <p className="text-[var(--text-tertiary)] text-xs font-bold mt-0.5">Define access profiles for your team</p>
                    </div>
                </div>
                <Can permission={PERMISSIONS.SETTINGS_USERS_MANAGE}>
                    <Button variant="primary" className="h-11 px-6 text-xs" onClick={() => setShowCreate(true)}>
                        <Plus className="w-4 h-4 mr-2" /> NEW ROLE
                    </Button>
                </Can>
            </div>

            {/* Level legend strip */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-widest mr-1">Access Levels:</span>
                {(['L1', 'L2', 'L3', 'L4', 'L5'] as AccessLevel[]).map(lvl => (
                    <span key={lvl} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${LEVEL_META[lvl].activeClass}`}>
                        {lvl} â€” {LEVEL_META[lvl].label}
                    </span>
                ))}
            </div>

            {/* Roles list */}
            {isLoading ? (
                <div className="flex items-center justify-center h-32 text-[var(--text-tertiary)] text-sm animate-pulse">Loading rolesâ€¦</div>
            ) : (
                <div className="space-y-3">
                    {roles.map((role, i) => {
                        const rc = role.name === 'Owner' ? '#F59E0B' : (role.color ?? '#6B7280');
                        const isOwner = role.name === 'Owner';
                        return (
                            <motion.div
                                key={role.id}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-6 py-5 flex items-center justify-between group hover:border-white/10 transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border shrink-0"
                                        style={{ background: `color-mix(in srgb, ${rc} 15%, transparent)`, borderColor: `color-mix(in srgb, ${rc} 30%, transparent)`, color: rc }}>
                                        {isOwner ? <Crown className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2.5 mb-1">
                                            <span className="text-white font-black text-sm uppercase tracking-wider">{role.name}</span>
                                            {role.isSystem
                                                ? <span className="px-1.5 py-0.5 rounded bg-zinc-700/50 border border-zinc-600/30 text-zinc-400 text-[9px] font-black uppercase">System</span>
                                                : <span className="px-1.5 py-0.5 rounded bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] text-[9px] font-black uppercase">Custom</span>
                                            }
                                        </div>
                                        {isOwner && (
                                            <p className="text-[10px] text-amber-400/70 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> Full Access â€” Locked</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="secondary" className="h-10 px-4 text-xs gap-2" onClick={() => onEditRole(role.name)}>
                                        <Edit2 className="w-3.5 h-3.5" />
                                        {isOwner ? 'View' : 'Edit'} Permissions
                                    </Button>
                                    {!role.isSystem && (
                                        <Can permission={PERMISSIONS.SETTINGS_USERS_MANAGE}>
                                            <button
                                                onClick={() => setConfirmDelete(role.name)}
                                                className="w-10 h-10 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400/30 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </Can>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <CreateRoleDialog isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={onEditRole} />

            {/* Delete confirmation dialog */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setConfirmDelete(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm shadow-2xl p-8"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">Delete Role</h3>
                            <p className="text-sm text-[var(--text-tertiary)] mb-6 leading-relaxed">
                                Are you sure you want to delete <span className="text-white font-bold">&ldquo;{confirmDelete}&rdquo;</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                                <button
                                    onClick={() => { deleteMutation.mutate(confirmDelete); setConfirmDelete(null); }}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Role Permission Editor â€” L1-L5 per section
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
interface RolePermEditorProps {
    roleName: string;
    onBack: () => void;
}

function RolePermEditor({ roleName, onBack }: RolePermEditorProps) {
    const qc = useQueryClient();
    const isOwner = roleName === 'Owner';
    const [sectionLevels, setSectionLevels] = useState<Record<string, AccessLevel>>({});
    const [dirty, setDirty] = useState(false);

    const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.getAll });
    const currentRole = roles.find(r => r.name === roleName);

    const { data: permData, isLoading } = useQuery({
        queryKey: ['role-permissions', roleName],
        queryFn: () => rolesApi.getPermissions(roleName),
        enabled: !isOwner,
    });

    // Initialise from loaded permissions (or lock Owner at L5)
    useEffect(() => {
        if (isOwner) {
            const all: Record<string, AccessLevel> = {};
            SECTIONS.forEach(s => { all[s.id] = 'L5'; });
            setSectionLevels(all);
            return;
        }
        if (permData) {
            const permSet = new Set(
                permData.filter((p: RolePermissionDto) => p.isAllowed).map((p: RolePermissionDto) => p.permissionKey)
            );
            const levels: Record<string, AccessLevel> = {};
            SECTIONS.forEach(s => { levels[s.id] = inferLevel(s, permSet); });
            setSectionLevels(levels);
            setDirty(false);
        }
    }, [permData, isOwner]);

    const saveMutation = useMutation({
        mutationFn: () => rolesApi.updatePermissions(roleName, buildPermPayload(sectionLevels)),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['role-permissions', roleName] });
            qc.invalidateQueries({ queryKey: ['my-permissions'] });
            toast.success(`Permissions saved for ${roleName}`);
            setDirty(false);
            onBack();
        },
        onError: () => toast.error('Failed to save permissions'),
    });

    const handleLevelChange = (sectionId: string, level: AccessLevel) => {
        setSectionLevels(prev => ({ ...prev, [sectionId]: level }));
        setDirty(true);
    };

    const rc = roleName === 'Owner' ? '#F59E0B' : (currentRole?.color ?? '#6B7280');

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                            style={{ background: `color-mix(in srgb, ${rc} 15%, transparent)`, borderColor: `color-mix(in srgb, ${rc} 30%, transparent)`, color: rc }}>
                            {isOwner ? <Crown className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">{roleName}</h3>
                                {isOwner && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase">
                                        <Lock className="w-3 h-3" /> Locked
                                    </span>
                                )}
                            </div>
                            <p className="text-[var(--text-tertiary)] text-xs font-bold mt-0.5">
                                {isOwner ? 'Full access to all sections â€” cannot be restricted' : 'Click a level button to change access for each section'}
                            </p>
                        </div>
                    </div>
                </div>
                {!isOwner && dirty && (
                    <Button variant="primary" className="h-11 px-6 text-xs" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Save Changes
                    </Button>
                )}
            </div>

            {/* Compact level reference */}
            <div className="flex items-center gap-2 flex-wrap px-1">
                <span className="text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-widest mr-1">Levels:</span>
                {(['L1', 'L2', 'L3', 'L4', 'L5'] as AccessLevel[]).map(lvl => (
                    <span key={lvl} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${LEVEL_META[lvl].activeClass}`}>
                        {lvl} â€” {LEVEL_META[lvl].label}
                    </span>
                ))}
            </div>

            {/* Permission matrix */}
            {!isOwner && isLoading ? (
                <div className="flex items-center justify-center h-32 text-[var(--text-tertiary)] text-sm animate-pulse">Loading permissionsâ€¦</div>
            ) : (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    {/* Column headers */}
                    <div className="flex items-center px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-alt)]/50">
                        <div className="flex-1 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Section</div>
                        <div className="flex gap-2">
                            {(['L1', 'L2', 'L3', 'L4', 'L5'] as AccessLevel[]).map(lvl => (
                                <div key={lvl} className={`w-16 text-center text-[9px] font-black uppercase tracking-widest ${LEVEL_META[lvl].textColor}`}>
                                    {lvl}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section rows */}
                    <div className="divide-y divide-[var(--border)]">
                        {SECTIONS.map((section, i) => {
                            const current = sectionLevels[section.id] ?? 'L1';
                            return (
                                <motion.div
                                    key={section.id}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                    className="flex items-center px-6 py-4 hover:bg-[var(--surface-alt)]/30 transition-colors"
                                >
                                    {/* Section label */}
                                    <div className="flex-1 flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center shrink-0">
                                            <section.Icon className="w-4 h-4 text-[var(--text-secondary)]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-bold text-sm truncate">{section.label}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${LEVEL_META[current].textColor}`}>
                                                {LEVEL_META[current].label}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Level buttons */}
                                    <div className="flex gap-2 shrink-0">
                                        {(['L1', 'L2', 'L3', 'L4', 'L5'] as AccessLevel[]).map(lvl => {
                                            const isSelected = current === lvl;
                                            const m = LEVEL_META[lvl];
                                            return (
                                                <button
                                                    key={lvl}
                                                    disabled={isOwner}
                                                    onClick={() => handleLevelChange(section.id, lvl)}
                                                    title={m.label}
                                                    className={`w-16 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        isSelected
                                                            ? m.activeClass
                                                            : 'bg-transparent border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]'
                                                    } ${isOwner ? 'cursor-default' : 'cursor-pointer'}`}
                                                >
                                                    {lvl}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    {!isOwner && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-alt)]/20">
                            <p className="text-[10px] font-bold text-[var(--text-tertiary)]">
                                {dirty ? 'â— Unsaved changes' : 'âœ“ All changes saved'}
                            </p>
                            <Button
                                variant="primary"
                                className="h-10 px-6 text-xs"
                                onClick={() => saveMutation.mutate()}
                                disabled={saveMutation.isPending || !dirty}
                            >
                                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {dirty ? 'Save Changes' : 'Saved âœ“'}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Main Component â€” manages internal navigation
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export function UsersRolesSettings() {
    const [view, setView] = useState<View>('hub');
    const [editingRole, setEditingRole] = useState<string>('');

    return (
        <AnimatePresence mode="wait">
            {view === 'hub' && (
                <motion.div key="hub" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <HubView onGoToRoles={() => setView('role-list')} onGoToUsers={() => setView('user-management')} />
                </motion.div>
            )}
            {view === 'user-management' && (
                <motion.div key="user-management" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                    <UserManagementView onBack={() => setView('hub')} />
                </motion.div>
            )}
            {view === 'role-list' && (
                <motion.div key="role-list" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                    <RoleListView
                        onBack={() => setView('hub')}
                        onEditRole={(name) => { setEditingRole(name); setView('role-editor'); }}
                    />
                </motion.div>
            )}
            {view === 'role-editor' && (
                <motion.div key="role-editor" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                    <RolePermEditor roleName={editingRole} onBack={() => setView('role-list')} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
