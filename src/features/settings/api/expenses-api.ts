import { api } from '@/core/api/axios-instance';

// ─── Fixed Expense ───────────────────────────────────────────────────────────

export interface FixedExpense {
    id: string;
    tenantId: string;
    name: string;
    amount: number;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateFixedExpenseDto {
    name: string;
    amount: number;
    description?: string;
}

export interface UpdateFixedExpenseDto {
    name: string;
    amount: number;
    description?: string;
    isActive: boolean;
}

// ─── Variable Expense ────────────────────────────────────────────────────────

export interface VariableExpense {
    id: string;
    tenantId: string;
    name: string;
    amount: number;
    description?: string;
    month: number;
    year: number;
    createdAt: string;
}

export interface CreateVariableExpenseDto {
    name: string;
    amount: number;
    description?: string;
    month: number;
    year: number;
}

export interface UpdateVariableExpenseDto {
    name: string;
    amount: number;
    description?: string;
    month: number;
    year: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const expensesApi = {
    // Fixed
    getAllFixed: async () => {
        const response = await api.get<{ data: FixedExpense[] }>('/expense/fixed');
        return response.data.data;
    },

    createFixed: async (data: CreateFixedExpenseDto) => {
        const response = await api.post<{ data: FixedExpense }>('/expense/fixed', data);
        return response.data.data;
    },

    updateFixed: async (id: string, data: UpdateFixedExpenseDto) => {
        const response = await api.put<{ data: FixedExpense }>(`/expense/fixed/${id}`, data);
        return response.data.data;
    },

    deleteFixed: async (id: string) => {
        const response = await api.delete(`/expense/fixed/${id}`);
        return response.data;
    },

    // Variable
    getVariable: async (month: number, year: number) => {
        const response = await api.get<{ data: VariableExpense[] }>(`/expense/variable?month=${month}&year=${year}`);
        return response.data.data;
    },

    createVariable: async (data: CreateVariableExpenseDto) => {
        const response = await api.post<{ data: VariableExpense }>('/expense/variable', data);
        return response.data.data;
    },

    updateVariable: async (id: string, data: UpdateVariableExpenseDto) => {
        const response = await api.put<{ data: VariableExpense }>(`/expense/variable/${id}`, data);
        return response.data.data;
    },

    deleteVariable: async (id: string) => {
        const response = await api.delete(`/expense/variable/${id}`);
        return response.data;
    },
};
