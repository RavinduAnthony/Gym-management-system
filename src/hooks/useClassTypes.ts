import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { classTypesApi, type CreateClassTypeDto, type UpdateClassTypeDto } from '@/features/settings/api/class-types-api';

export const useClassTypes = () =>
    useQuery({
        queryKey: ['classTypes'],
        queryFn: classTypesApi.getAll,
    });

export const useCreateClassType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateClassTypeDto) => classTypesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classTypes'] });
            toast.success('Class type added successfully');
        },
        onError: () => toast.error('Failed to add class type'),
    });
};

export const useUpdateClassType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateClassTypeDto }) =>
            classTypesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classTypes'] });
            toast.success('Class type updated successfully');
        },
        onError: () => toast.error('Failed to update class type'),
    });
};

export const useDeleteClassType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => classTypesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classTypes'] });
            toast.success('Class type deleted successfully');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message ?? 'Failed to delete class type';
            toast.error(message);
        },
    });
};
