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
    // Service payment totals
    serviceTotalRevenue: number;
    serviceThisYearRevenue: number;
    serviceThisMonthRevenue: number;
    servicePendingCount: number;
    servicePendingAmount: number;
    serviceLateCount: number;
    serviceLateAmount: number;
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

// ─── Service Payments (Classes + PT) ─────────────────────────────────────────

export type ServiceType = 'Class' | 'PT';

export interface ServicePaymentSchedule {
    id: string;
    serviceType: ServiceType;
    gymClassId?: string;
    ptRegistrationId?: string;
    serviceName: string;
    month: string; // "2026-04"
    dueDate: string;
    amount: number;
    status: 'Pending' | 'Paid' | 'Late';
    paidDate?: string;
    notes?: string;
}

export interface ServicePaymentHistory {
    id: string;
    serviceType: ServiceType;
    serviceName: string;
    month: string;
    date: string;
    amount: number;
    status: string;
    method: string;
    notes?: string;
}

export interface RecordServicePaymentRequest {
    scheduleId: string;
    amount: number;
    method: string;
    paidDate?: string;
    notes?: string;
}

