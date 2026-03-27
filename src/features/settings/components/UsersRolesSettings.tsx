// src/features/settings/components/UsersRolesSettings.tsx
import { Users, ShieldCheck, Plus, Edit2, Trash2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

const MOCK_USERS = [
    { id: 1, name: 'Admin User', email: 'admin@ironcore.com', role: 'Owner', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@ironcore.com', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Mark Johnson', email: 'mark@ironcore.com', role: 'Staff', status: 'Active' },
    { id: 4, name: 'Sarah Lee', email: 'sarah@ironcore.com', role: 'Trainer', status: 'Inactive' },
];

const ROLE_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
    Owner:   { color: 'var(--primary)', icon: <Crown className="w-3.5 h-3.5" /> },
    Manager: { color: 'var(--secondary)', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    Staff:   { color: 'var(--success)', icon: <Users className="w-3.5 h-3.5" /> },
    Trainer: { color: 'var(--warning)', icon: <Users className="w-3.5 h-3.5" /> },
};

export function UsersRolesSettings() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <Users className="w-5 h-5 text-[var(--secondary)]" /> System Users
                    </h3>
                    <p className="text-[var(--text-tertiary)] text-xs font-bold mt-1">Manage staff accounts and access permissions</p>
                </div>
                <Button variant="primary" className="h-11 px-6 text-xs">
                    <Plus className="w-4 h-4 mr-2" /> ADD USER
                </Button>
            </div>

            {/* Users Table */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[var(--surface-alt)]/50 border-b border-[var(--border)]">
                            <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">User</th>
                            <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Role</th>
                            <th className="px-6 py-5 text-left text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Status</th>
                            <th className="px-6 py-5 text-right text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {MOCK_USERS.map((user, i) => {
                            const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.Staff;
                            const isActive = user.status === 'Active';
                            return (
                                <motion.tr 
                                    key={user.id} 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-[var(--surface-alt)]/40 group transition-all"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center text-white font-black text-sm border border-[var(--border)]">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">{user.name}</p>
                                                <p className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span 
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                                            style={{ color: roleConf.color, borderColor: `color-mix(in srgb, ${roleConf.color} 30%, transparent)`, backgroundColor: `color-mix(in srgb, ${roleConf.color} 8%, transparent)` }}
                                        >
                                            {roleConf.icon} {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--text-tertiary)]'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-[var(--success)]' : 'text-[var(--text-tertiary)]'}`}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/30 transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
