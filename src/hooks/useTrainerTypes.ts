import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerTypesApi } from '@/features/settings/api/trainer-types-api';
import type { CreateTrainerTypeDto, UpdateTrainerTypeDto } from '@/features/settings/api/trainer-types-api';
import { toast } from 'sonner';

export const useTrainerTypes = () => {
    return useQuery({
        queryKey: ['trainerTypes'],
        queryFn: trainerTypesApi.getAll,
    });
};

export const useCreateTrainerType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTrainerTypeDto) => trainerTypesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trainerTypes'] });
            toast.success('Trainer type added successfully');
        },
        onError: () => toast.error('Failed to add trainer type'),
    });
};

export const useUpdateTrainerType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTrainerTypeDto }) => trainerTypesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trainerTypes'] });
            toast.success('Trainer type updated successfully');
        },
        onError: () => toast.error('Failed to update trainer type'),
    });
};

export const useDeleteTrainerType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => trainerTypesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trainerTypes'] });
            toast.success('Trainer type deleted successfully');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message ?? 'Failed to delete trainer type';
            toast.error(message);
        },
    });
};
