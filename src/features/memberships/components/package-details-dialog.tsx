import { X, Package, Clock, Tag, CheckCircle2, BarChart3, Snowflake, Users, Percent } from 'lucide-react';
import type { MembershipPackage } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    pkg: MembershipPackage | null;
}

export function PackageDetailsDialog({ isOpen, onClose, pkg }: Props) {
    if (!isOpen || !pkg) return null;

    const isActive = pkg.status === 'Active';

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl border border-border flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-border bg-muted/10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Package className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">{pkg.name}</h2>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                    {pkg.status}
                                </span>
                                <span className="text-sm text-muted-foreground">{pkg.durationInMonths} month{pkg.durationInMonths !== 1 ? 's' : ''}</span>
                                <span className="text-muted-foreground/30">•</span>
                                <span className="text-sm font-bold text-foreground">Rs. {pkg.price.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-background space-y-6">

                    {/* Key metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-4 border border-border rounded-xl bg-muted/20">
                            <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" /> Price
                            </p>
                            <p className="text-lg font-bold text-foreground">Rs. {pkg.price.toLocaleString()}</p>
                        </div>
                        <div className="p-4 border border-border rounded-xl bg-muted/20">
                            <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> Duration
                            </p>
                            <p className="text-lg font-bold text-foreground">
                                {pkg.durationInMonths} month{pkg.durationInMonths !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="p-4 border border-border rounded-xl bg-muted/20">
                            <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
                                <BarChart3 className="w-3.5 h-3.5" /> Max Visits
                            </p>
                            <p className="text-lg font-bold text-foreground">
                                {pkg.maxVisits != null ? pkg.maxVisits : 'Unlimited'}
                            </p>
                        </div>
                    </div>

                    {/* Settings */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Package Settings</h3>
                        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Trainer Included
                                </span>
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${pkg.trainerIncluded ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                    {pkg.trainerIncluded ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Percent className="w-4 h-4" /> Discount Allowed
                                </span>
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${pkg.discountAllowed ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                    {pkg.discountAllowed ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Snowflake className="w-4 h-4" /> Freeze Days
                                </span>
                                <span className="text-sm font-bold text-foreground">
                                    {pkg.freezeDays != null ? `${pkg.freezeDays} days` : 'Not allowed'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Benefits</h3>
                        {pkg.benefits?.length ? (
                            <div className="space-y-2">
                                {pkg.benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="text-sm font-medium text-foreground">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No benefits listed for this package.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
