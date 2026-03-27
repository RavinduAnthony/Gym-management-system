// src/features/settings/components/PaymentSettings.tsx
import { CreditCard, Banknote, Receipt, Percent } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function PaymentSettings() {
    const [selectedMethod, setSelectedMethod] = useState('cash');

    const methods = [
        { id: 'cash', label: 'Cash', icon: <Banknote className="w-5 h-5" /> },
        { id: 'card', label: 'Card', icon: <CreditCard className="w-5 h-5" /> },
        { id: 'bank', label: 'Bank Transfer', icon: <Receipt className="w-5 h-5" /> },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3 mb-1">
                    <CreditCard className="w-5 h-5 text-[var(--success)]" /> Payment Configuration
                </h3>
                <p className="text-[var(--text-tertiary)] text-xs font-bold">Set up payment methods, tax rules, and invoicing</p>
            </div>

            {/* Payment Methods */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-5">Accepted Methods</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {methods.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedMethod(m.id)}
                            className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 ${
                                selectedMethod === m.id
                                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-white'
                                    : 'border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedMethod === m.id ? 'bg-[var(--primary)]/15 text-[var(--primary)]' : 'bg-[var(--surface)] text-[var(--text-tertiary)]'}`}>
                                {m.icon}
                            </div>
                            <span className="font-bold text-sm uppercase tracking-wider">{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tax & Currency */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-5">Tax & Currency</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Currency</label>
                        <select className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl py-3.5 px-5 text-sm font-bold text-white outline-none focus:border-[var(--primary)] appearance-none cursor-pointer">
                            <option value="LKR">LKR — Sri Lankan Rupee</option>
                            <option value="USD">USD — US Dollar</option>
                            <option value="EUR">EUR — Euro</option>
                            <option value="GBP">GBP — British Pound</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Tax Rate (%)</label>
                        <div className="relative">
                            <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                            <input type="number" defaultValue={0} className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl py-3.5 pl-12 pr-5 text-sm font-bold text-white outline-none focus:border-[var(--primary)] transition-all" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Prefix */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-5">Invoicing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Invoice Prefix</label>
                        <input type="text" defaultValue="IC-INV-" className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl py-3.5 px-5 text-sm font-bold text-white outline-none focus:border-[var(--primary)] transition-all" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Next Invoice #</label>
                        <input type="number" defaultValue={1001} className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl py-3.5 px-5 text-sm font-bold text-white outline-none focus:border-[var(--primary)] transition-all" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button variant="primary" className="px-10 h-12">SAVE PAYMENT CONFIG</Button>
            </div>
        </div>
    );
}
