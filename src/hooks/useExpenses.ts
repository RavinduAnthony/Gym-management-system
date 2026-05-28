import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '@/features/settings/api/expenses-api';
import type { CreateFixedExpenseDto, UpdateFixedExpenseDto, CreateVariableExpenseDto, UpdateVariableExpenseDto } from '@/features/settings/api/expenses-api';
import { toast } from 'sonner';

// ─── Fixed Expense Hooks ─────────────────────────────────────────────────────

export const useFixedExpenses = () => {
    return useQuery({
        queryKey: ['fixedExpenses'],
        queryFn: expensesApi.getAllFixed,
    });
};

export const useCreateFixedExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateFixedExpenseDto) => expensesApi.createFixed(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fixedExpenses'] });
            toast.success('Fixed expense added successfully');
        },
        onError: () => toast.error('Failed to add fixed expense'),
    });
};

export const useUpdateFixedExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFixedExpenseDto }) =>
            expensesApi.updateFixed(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fixedExpenses'] });
            toast.success('Fixed expense updated successfully');
        },
        onError: () => toast.error('Failed to update fixed expense'),
    });
};

export const useDeleteFixedExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => expensesApi.deleteFixed(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fixedExpenses'] });
            toast.success('Fixed expense deleted successfully');
        },
        onError: () => toast.error('Failed to delete fixed expense'),
    });
};

// ─── Variable Expense Hooks ──────────────────────────────────────────────────

export const useVariableExpenses = (month: number, year: number) => {
    return useQuery({
        queryKey: ['variableExpenses', month, year],
        queryFn: () => expensesApi.getVariable(month, year),
    });
};

export const useCreateVariableExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateVariableExpenseDto) => expensesApi.createVariable(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['variableExpenses', variables.month, variables.year] });
            toast.success('Variable expense added successfully');
        },
        onError: () => toast.error('Failed to add variable expense'),
    });
};

export const useUpdateVariableExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateVariableExpenseDto }) =>
            expensesApi.updateVariable(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['variableExpenses', variables.data.month, variables.data.year] });
            toast.success('Variable expense updated successfully');
        },
        onError: () => toast.error('Failed to update variable expense'),
    });
};

export const useDeleteVariableExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, month, year }: { id: string; month: number; year: number }) =>
            expensesApi.deleteVariable(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['variableExpenses', variables.month, variables.year] });
            toast.success('Variable expense deleted successfully');
        },
        onError: () => toast.error('Failed to delete variable expense'),
    });
};
