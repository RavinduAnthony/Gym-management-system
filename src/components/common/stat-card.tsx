import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        positive: boolean;
    };
    className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className = '' }: StatCardProps) {
    return (
        <div className={`bg-card text-card-foreground rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground font-medium">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                    {trend && (
                        <p className={`text-xs font-medium mt-2 ${trend.positive ? 'text-success' : 'text-destructive'}`}>
                            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            <span className="text-muted-foreground ml-1">vs last month</span>
                        </p>
                    )}
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
            </div>
        </div>
    );
}
