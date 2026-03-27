interface StatusBadgeProps {
    status: string;
    className?: string;
}

const STATUS_STYLES: Record<string, string> = {
    Active: 'bg-success/10 text-success border-success/20',
    Expired: 'bg-destructive/10 text-destructive border-destructive/20',
    Inactive: 'bg-muted text-muted-foreground border-border',
    Suspended: 'bg-warning/10 text-warning border-warning/20',
    Blacklisted: 'bg-destructive/10 text-destructive border-destructive/20',
    Paid: 'bg-success/10 text-success border-success/20',
    Pending: 'bg-warning/10 text-warning border-warning/20',
    'On Leave': 'bg-muted text-muted-foreground border-border',
    Trial: 'bg-primary/10 text-primary border-primary/20',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const style = STATUS_STYLES[status] || 'bg-muted text-muted-foreground border-border';

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
        >
            {status}
        </span>
    );
}
