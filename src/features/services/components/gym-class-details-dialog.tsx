import { X, CalendarRange, Users, Clock, CreditCard, MapPin, User, Phone, Mail, Award } from 'lucide-react';
import type { GymClass } from '../schemas/class-service-schema';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    gymClass: GymClass | null;
}

const LABEL = 'text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest block mb-1';
const VALUE = 'text-sm text-foreground font-medium';

export function GymClassDetailsDialog({ isOpen, onClose, gymClass }: Props) {
    if (!isOpen || !gymClass) return null;

    const days = (gymClass.daysOfWeek ?? '').split(',').filter(Boolean);
    const dur = gymClass.durationMinutes ?? 0;
    const durLabel = dur > 0
        ? `${Math.floor(dur / 60) > 0 ? `${Math.floor(dur / 60)}h ` : ''}${dur % 60 > 0 ? `${dur % 60}m` : ''}`
        : '—';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-alt)]/40 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
                            <CalendarRange className="w-4 h-4 text-[var(--primary)]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Class Details</h2>
                            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{gymClass.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-foreground hover:border-foreground/20 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Status badge */}
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                            gymClass.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                            {gymClass.status}
                        </span>
                        {gymClass.category && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                                {gymClass.category}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {gymClass.description && (
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{gymClass.description}</p>
                    )}

                    {/* Instructor */}
                    {(gymClass.instructorName || gymClass.instructorId) && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/40 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <User className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                <span className={LABEL} style={{ marginBottom: 0 }}>Instructor</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {gymClass.instructorPhoto ? (
                                    <img
                                        src={gymClass.instructorPhoto}
                                        alt={gymClass.instructorName ?? ''}
                                        className="w-11 h-11 rounded-full object-cover border border-[var(--border)]"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-black text-sm">
                                        {gymClass.instructorName?.split(' ').map(n => n[0]).join('') ?? '?'}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-bold text-foreground">{gymClass.instructorName ?? '—'}</p>
                                    {gymClass.instructorSpecialization && (
                                        <p className="text-xs text-[var(--text-tertiary)]">{gymClass.instructorSpecialization}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                {gymClass.instructorPhone && (
                                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                                        <Phone className="w-3 h-3" />
                                        {gymClass.instructorPhone}
                                    </div>
                                )}
                                {gymClass.instructorEmail && (
                                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] truncate">
                                        <Mail className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{gymClass.instructorEmail}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Schedule */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/40 p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                            <CalendarRange className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                            <span className={LABEL} style={{ marginBottom: 0 }}>Schedule</span>
                        </div>

                        {days.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {days.map((d) => (
                                    <span
                                        key={d}
                                        className="px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-xs font-bold"
                                    >
                                        {d}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <span className={LABEL}>Start Time</span>
                                <p className={VALUE}>{gymClass.startTime || '—'}</p>
                            </div>
                            <div>
                                <span className={LABEL}>End Time</span>
                                <p className={VALUE}>{gymClass.endTime || '—'}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    <Clock className="w-3 h-3 text-[var(--text-tertiary)]" />
                                    <span className={LABEL} style={{ marginBottom: 0 }}>Duration</span>
                                </div>
                                <p className={VALUE}>{durLabel}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[var(--border)]">
                            <div>
                                <span className={LABEL}>Batch Start</span>
                                <p className={VALUE}>
                                    {gymClass.batchStartDate ? new Date(gymClass.batchStartDate).toLocaleDateString() : '—'}
                                </p>
                            </div>
                            <div>
                                <span className={LABEL}>Batch End</span>
                                <p className={VALUE}>
                                    {gymClass.batchEndDate ? new Date(gymClass.batchEndDate).toLocaleDateString() : '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Capacity & Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/40 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                <span className={LABEL} style={{ marginBottom: 0 }}>Max Capacity</span>
                            </div>
                            <p className="text-2xl font-black text-foreground">{gymClass.maxCapacity ?? '—'}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">students</p>
                        </div>
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/40 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                <span className={LABEL} style={{ marginBottom: 0 }}>Session Fee</span>
                            </div>
                            <p className="text-2xl font-black text-foreground">
                                {gymClass.defaultAmount != null ? gymClass.defaultAmount.toLocaleString() : '—'}
                            </p>
                            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">LKR</p>
                        </div>
                    </div>

                    {/* Location */}
                    {gymClass.branchName && (
                        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/40 p-4">
                            <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
                            <div>
                                <span className={LABEL}>Branch</span>
                                <p className={VALUE}>{gymClass.branchName}</p>
                            </div>
                        </div>
                    )}

                    {/* Certifications (from instructor) */}
                    {gymClass.instructorCertifications && gymClass.instructorCertifications.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                <span className={LABEL} style={{ marginBottom: 0 }}>Instructor Certifications</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {gymClass.instructorCertifications.map((cert, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold border border-[var(--primary)]/20"
                                    >
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-alt)]/20 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] hover:text-foreground hover:border-foreground/20 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
