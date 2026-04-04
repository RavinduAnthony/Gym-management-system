export interface PaymentSchedule {
    id: string;
    memberId: string;
    memberName: string;
    membershipId: string;
    packageName: string;
    dueDate: string;
    amount: number;
    status: 'Pending' | 'Paid' | 'Late';
    paymentTypeId: number;
    paymentTypeName: string;
    paidDate?: string;
    notes?: string;
    month: string; // "2026-03"
}

export interface PaymentHistory {
    id: string;
    memberId: string;
    memberName: string;
    date: string;
    amount: number;
    paymentTypeId: number;
    paymentTypeName: string;
    status: string;
    method: string;
    planName: string;
    notes?: string;
}

export interface PaymentDashboardSummary {
    totalRevenue: number;
    thisYearRevenue: number;
    thisMonthRevenue: number;
    pendingCount: number;
    pendingAmount: number;
    lateCount: number;
    lateAmount: number;
    paidThisMonth: number;
}

export interface RecordPaymentRequest {
    scheduleId: string;
    amount: number;
    method: string;
    paidDate?: string;
    notes?: string;
}

export interface PaymentType {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
}
