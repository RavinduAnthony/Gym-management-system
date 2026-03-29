import { useQuery } from '@tanstack/react-query';
import { trainersApi } from '@/features/trainers/api/trainers-api';

export const useTrainers = () => {
    return useQuery({
        queryKey: ['trainers'],
        queryFn: trainersApi.getTrainers,
    });
};
