// src/features/settings/components/MembershipRulesSettings.tsx
import { Shield, ToggleRight, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button onClick={onToggle} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-[var(--primary)]' : 'bg-[var(--surface-alt)] border border-[var(--border)]'}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${enabled ? 'left-[26px]' : 'left-0.5'}`} />
        </button>
    );
}

export function MembershipRulesSettings() {
    const [autoRenew, setAutoRenew] = useState(true);
    const [gracePeriod, setGracePeriod] = useState(true);
    const [expiryNotify, setExpiryNotify] = useState(true);
    const [freezeAllow, setFreezeAllow] = useState(false);

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3 mb-1">
                    <Shield className="w-5 h-5 text-[var(--primary)]" /> Membership Rules
                </h3>
                <p className="text-[var(--text-tertiary)] text-xs font-bold">Configure how memberships behave across your facility</p>
            </div>

            {/* Rule Cards */}
            <div className="space-y-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between hover:border-[var(--border-strong)] transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center text-[var(--primary)]">
                            <RefreshCw className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Auto-Renewal</p>
                            <p className="text-[var(--text-tertiary)] text-xs font-bold mt-0.5">Memberships auto-renew at the end of their cycle</p>
                        </div>
                    </div>
                    <Toggle enabled={autoRenew} onToggle={() => setAutoRenew(!autoRenew)} />
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between hover:border-[var(--border-strong)] transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center text-[var(--warning)]">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Grace Period</p>
                            <p className="text-[var(--text-tertiary)] text-xs font-bold mt-0.5">Allow access for a configurable period after expiry</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {gracePeriod && (
                            <div className="flex items-center gap-2">
                                <input type="number" defaultValue={3} className="w-16 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg py-2 px-3 text-center text-sm font-bold text-white outline-none focus:border-[var(--primary)]" />
                                <span className="text-[var(--text-tertiary)] text-[10px] font-black uppercase tracking-widest">Days</span>
                            </div>
                        )}
                        <Toggle enabled={gracePeriod} onToggle={() => setGracePeriod(!gracePeriod)} />
                    </div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between hover:border-[var(--border-strong)] transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center text-[var(--secondary)]">
                            <ToggleRight className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Expiry Notifications</p>
                            <p className="text-[var(--text-tertiary)] text-xs font-bold mt-0.5">Send alerts before membership expires</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {expiryNotify && (
                            <div className="flex items-center gap-2">
                                <input type="number" defaultValue={7} className="w-16 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg py-2 px-3 text-center text-sm font-bold text-white outline-none focus:border-[var(--primary)]" />
                                <span className="text-[var(--text-tertiary)] text-[10px] font-black uppercase tracking-widest">Days Before</span>
                            </div>
                        )}
                        <Toggle enabled={expiryNotify} onToggle={() => setExpiryNotify(!expiryNotify)} />
                    </div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between hover:border-[var(--border-strong)] transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center text-[var(--info)]">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Membership Freeze</p>
                            <p className="text-[var(--text-tertiary)] text-xs font-bold mt-0.5">Allow members to pause their membership temporarily</p>
                        </div>
                    </div>
                    <Toggle enabled={freezeAllow} onToggle={() => setFreezeAllow(!freezeAllow)} />
                </div>
            </div>

            <div className="flex justify-end">
                <Button variant="primary" className="px-10 h-12">SAVE RULES</Button>
            </div>
        </div>
    );
}
