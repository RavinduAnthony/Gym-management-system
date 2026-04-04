import { useState } from 'react';
import { X, User, Award, Clock, MapPin, Activity, Calendar, Dumbbell } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import type { Trainer } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    trainer: Trainer | null;
}

const DAYS_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseAvailability(value?: string) {
    if (!value) return { days: [] as string[], startTime: '', endTime: '' };
    const match = value.match(/^([^\s]+)(?:\s+(\d{2}:\d{2})-(\d{2}:\d{2}))?$/);
    if (!match) return { days: [] as string[], startTime: '', endTime: '' };
    const days = match[1].split(',').filter(d => DAYS_ORDER.includes(d));
    return { days, startTime: match[2] ?? '', endTime: match[3] ?? '' };
}

function formatTime(t: string) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function TrainerDetailsDialog({ isOpen, onClose, trainer }: Props) {
    const [activeTab, setActiveTab] = useState<'profile' | 'certifications'>('profile');
    const { data: branches } = useBranches();

    const branchName = branches?.find(b => b.id === trainer?.branchId)?.name ?? trainer?.branchId ?? '—';
    const dob = trainer?.dateOfBirth
        ? new Date(trainer.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    const availability = parseAvailability(trainer?.availability);
    const timeRange = availability.startTime && availability.endTime
        ? `${formatTime(availability.startTime)} – ${formatTime(availability.endTime)}`
        : '—';

    if (!isOpen || !trainer) return null;

    const statusColor =
        trainer.status === 'Active'
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            : trainer.status === 'On Leave'
            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            : 'bg-muted text-muted-foreground border-border';

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="bg-card w-full max-w-3xl max-h-[90vh] rounded-2xl border border-border flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5 border-b border-border bg-muted/10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl overflow-hidden shadow-sm shrink-0">
                            {trainer.photo ? (
                                <img src={trainer.photo} alt={trainer.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <span>{trainer.firstName.charAt(0)}{trainer.lastName.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {trainer.firstName} {trainer.lastName}
                            </h2>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusColor}`}>
                                    {trainer.status}
                                </span>
                                <span className="text-sm text-muted-foreground">{trainer.phone}</span>
                                {trainer.email && (
                                    <>
                                        <span className="text-muted-foreground/30">•</span>
                                        <span className="text-sm text-muted-foreground">{trainer.email}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 sm:mt-0 mt-4 self-end sm:self-auto text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sidebar + Content */}
                <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">

                    {/* Sidebar */}
                    <div className="w-full sm:w-52 border-r border-border bg-muted/5 p-4 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible shrink-0">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <User className="w-4 h-4" /> Profile Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('certifications')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'certifications' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                        >
                            <Award className="w-4 h-4" /> Certifications
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-background">

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Stat cards */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-4 border border-border rounded-xl bg-muted/20">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Specialization</p>
                                        <p className="text-sm font-bold text-foreground truncate">{trainer.specialization || '—'}</p>
                                    </div>
                                    <div className="p-4 border border-border rounded-xl bg-muted/20">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Experience</p>
                                        <p className="text-sm font-bold text-foreground">
                                            {trainer.experienceYears != null ? `${trainer.experienceYears} yr${trainer.experienceYears !== 1 ? 's' : ''}` : '—'}
                                        </p>
                                    </div>
                                    <div className="p-4 border border-border rounded-xl bg-muted/20">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Branch</p>
                                        <p className="text-sm font-bold text-foreground truncate">{branchName}</p>
                                    </div>
                                    {trainer.trainerTypeName && (
                                        <div className="p-4 border border-border rounded-xl bg-primary/5 border-primary/20">
                                            <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                                                <Dumbbell className="w-3 h-3" /> Trainer Type
                                            </p>
                                            <p className="text-sm font-bold text-primary truncate">{trainer.trainerTypeName}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Details grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Info */}
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                            <Activity className="w-4 h-4" /> Personal Info
                                        </h3>
                                        <div className="space-y-3 bg-card border border-border rounded-xl p-5 shadow-sm">
                                            <div className="flex justify-between border-b border-border/50 pb-2">
                                                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" /> Date of Birth
                                                </span>
                                                <span className="text-sm font-medium text-foreground">{dob}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-border/50 pb-2">
                                                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5" /> Branch
                                                </span>
                                                <span className="text-sm font-medium text-foreground">{branchName}</span>
                                            </div>
                                            {trainer.trainerTypeName && (
                                                <div className="flex justify-between border-b border-border/50 pb-2">
                                                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                        <Dumbbell className="w-3.5 h-3.5" /> Trainer Type
                                                    </span>
                                                    <span className="text-sm font-medium text-primary">{trainer.trainerTypeName}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Status</span>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                                                    {trainer.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Availability */}
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Availability
                                        </h3>
                                        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                                            {/* Day pills */}
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-2">Available Days</p>
                                                {availability.days.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {DAYS_ORDER.map(day => (
                                                            <span
                                                                key={day}
                                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                                                    availability.days.includes(day)
                                                                        ? 'bg-primary/10 text-primary border-primary/30'
                                                                        : 'bg-muted/30 text-muted-foreground/40 border-border/30'
                                                                }`}
                                                            >
                                                                {day}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">Not specified</p>
                                                )}
                                            </div>
                                            {/* Time range */}
                                            <div className="flex justify-between border-t border-border/50 pt-3">
                                                <span className="text-sm text-muted-foreground">Hours</span>
                                                <span className="text-sm font-bold text-foreground">{timeRange}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Certifications Tab */}
                        {activeTab === 'certifications' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-muted-foreground" /> Certifications & Qualifications
                                </h3>
                                {trainer.certifications?.length ? (
                                    <div className="space-y-2">
                                        {trainer.certifications.map((cert, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-muted/20 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Award className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="text-sm font-medium text-foreground">{cert}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <Award className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No certifications on record.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
