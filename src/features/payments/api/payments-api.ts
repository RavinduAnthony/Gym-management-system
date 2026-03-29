import { api } from '@/core/api/axios-instance';
import type {
    PaymentSchedule,
    PaymentHistory,
    PaymentDashboardSummary,
    RecordPaymentRequest,
    PaymentType,
} from '../types';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const paymentsApi = {
    getSchedules: async (): Promise<PaymentSchedule[]> => {
        const res = await api.get<ApiResponse<PaymentSchedule[]>>('/payments/schedules');
        return res.data.data ?? [];
    },

    getSchedulesByMember: async (memberId: string): Promise<PaymentSchedule[]> => {
        const res = await api.get<ApiResponse<PaymentSchedule[]>>(`/payments/schedules/member/${memberId}`);
        return res.data.data ?? [];
    },

    getHistory: async (): Promise<PaymentHistory[]> => {
        const res = await api.get<ApiResponse<PaymentHistory[]>>('/payments/history');
        return res.data.data ?? [];
    },

    getSummary: async (): Promise<PaymentDashboardSummary> => {
        const res = await api.get<ApiResponse<PaymentDashboardSummary>>('/payments/summary');
        return res.data.data;
    },

    recordPayment: async (dto: RecordPaymentRequest): Promise<PaymentSchedule> => {
        const res = await api.post<ApiResponse<PaymentSchedule>>('/payments/record', dto);
        return res.data.data;
    },

    refreshLate: async (): Promise<void> => {
        await api.post('/payments/refresh-late');
    },

    getPaymentTypes: async (): Promise<PaymentType[]> => {
        const res = await api.get<ApiResponse<PaymentType[]>>('/payments/types');
        return res.data.data ?? [];
    },
};