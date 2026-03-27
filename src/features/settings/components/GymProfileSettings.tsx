import { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Camera, Plus, Trash2, Map } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useBranches, useCreateBranch, useDeleteBranch } from '@/hooks/useBranches';
import { toast } from 'sonner';

export function GymProfileSettings() {
    const { data: branches, isLoading } = useBranches();
    const createBranch = useCreateBranch();
    const deleteBranch = useDeleteBranch();

    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newBranch, setNewBranch] = useState({ name: '', address: '', phone: '' });

    const handleAddBranch = () => {
        if (!newBranch.name.trim()) {
            toast.error('Branch name is required');
            return;
        }
        createBranch.mutate(newBranch, {
            onSuccess: () => {
                setNewBranch({ name: '', address: '', phone: '' });
                setIsAddingMode(false);
            }
        });
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Gym Logo & Name */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-[var(--primary)]" /> Gym Identity
                </h3>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group cursor-pointer">
                        <div className="w-28 h-28 rounded-2xl bg-[var(--surface-alt)] border-2 border-dashed border-[var(--border)] flex items-center justify-center group-hover:border-[var(--primary)]/50 transition-all">
                            <Camera className="w-8 h-8 text-[var(--text-tertiary)] group-hover:text-[var(--primary)] transition-colors" />
                        </div>
                        <span className="text-[9px] font-bold text-[var(--text-tertiary)] mt-2 block text-center uppercase tracking-widest">Upload Logo</span>
                    </div>
                    <div className="flex-1 space-y-5 w-full">
                        <div>
                            <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Gym Name</label>
                            <input type="text" defaultValue="IronCore Fitness" className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl py-3.5 px-5 text-sm font-bold text-white focus:border-[var(--primary)] outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Tagline</label>
                            <input type="text" defaultValue="Elite Facility Management" className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl py-3.5 px-5 text-sm font-bold text-white focus:border-[var(--primary)] outline-none transition-all" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Branch Management */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <Map className="w-5 h-5 text-[var(--primary)]" /> Gym Branches
                    </h3>
                    {!isAddingMode && (
                        <Button variant="secondary" onClick={() => setIsAddingMode(true)} className="gap-2">
                            <Plus className="w-4 h-4" /> Add Branch
                        </Button>
                    )}
                </div>

                {/* Branches List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-sm text-[var(--text-tertiary)] animate-pulse">Loading branches...</div>
                    ) : branches?.length === 0 && !isAddingMode ? (
                        <div className="text-sm text-[var(--text-tertiary)] italic">No branches found. Add one to get started.</div>
                    ) : (
                        branches?.map(branch => (
                            <div key={branch.id} className="flex items-center justify-between bg-[var(--surface-alt)] border border-[var(--border)] p-4 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-white">{branch.name}</h4>
                                    <div className="flex gap-4 mt-1">
                                        {branch.address && (
                                            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {branch.address}
                                            </span>
                                        )}
                                        {branch.phone && (
                                            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {branch.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteBranch.mutate(branch.id)}
                                    disabled={deleteBranch.isPending}
                                    className="p-2 text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}

                    {/* Add Branch Inline Form */}
                    {isAddingMode && (
                        <div className="bg-[var(--surface-alt)] border border-[var(--primary)]/30 p-5 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">New Branch Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Branch Name *</label>
                                    <input 
                                        type="text" 
                                        value={newBranch.name} 
                                        onChange={e => setNewBranch({...newBranch, name: e.target.value})}
                                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm font-bold text-white focus:border-[var(--primary)] outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Phone</label>
                                    <input 
                                        type="tel" 
                                        value={newBranch.phone} 
                                        onChange={e => setNewBranch({...newBranch, phone: e.target.value})}
                                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm font-bold text-white focus:border-[var(--primary)] outline-none" 
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Address</label>
                                    <input 
                                        type="text" 
                                        value={newBranch.address} 
                                        onChange={e => setNewBranch({...newBranch, address: e.target.value})}
                                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 px-3 text-sm font-bold text-white focus:border-[var(--primary)] outline-none" 
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="secondary" onClick={() => setIsAddingMode(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleAddBranch} disabled={createBranch.isPending}>
                                    {createBranch.isPending ? 'Saving...' : 'Save Branch'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[var(--secondary)]" /> Primary Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                            <input type="tel" defaultValue="+94 77 123 4567" className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl py-3.5 pl-12 pr-5 text-sm font-bold text-white focus:border-[var(--primary)] outline-none transition-all" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                            <input type="email" defaultValue="admin@ironcore.com" className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl py-3.5 pl-12 pr-5 text-sm font-bold text-white focus:border-[var(--primary)] outline-none transition-all" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Website</label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                            <input type="url" defaultValue="https://ironcore.com" className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl py-3.5 pl-12 pr-5 text-sm font-bold text-white focus:border-[var(--primary)] outline-none transition-all" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button variant="primary" className="px-10 h-12">SAVE CHANGES</Button>
            </div>
        </div>
    );
}
