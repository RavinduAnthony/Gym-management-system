import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi } from '@/features/settings/api/branches-api';
import type { CreateBranchDto, UpdateBranchDto } from '@/features/settings/api/branches-api';
import { toast } from 'sonner';

export const useBranches = () => {
    return useQuery({
        queryKey: ['branches'],
        queryFn: branchesApi.getAll,
    });
};

export const useCreateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateBranchDto) => branchesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast.success('Branch added successfully');
        },
        onError: () => toast.error('Failed to add branch'),
    });
};

export const useUpdateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBranchDto }) => branchesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast.success('Branch updated successfully');
        },
        onError: () => toast.error('Failed to update branch'),
    });
};

export const useDeleteBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => branchesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast.success('Branch deleted successfully');
        },
        onError: () => toast.error('Failed to delete branch'),
    });
};
