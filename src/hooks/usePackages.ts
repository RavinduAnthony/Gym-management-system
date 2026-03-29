import { useQuery } from '@tanstack/react-query';
import { membershipsApi } from '@/features/memberships/api/memberships-api';

export const usePackages = () => {
    return useQuery({
        queryKey: ['memberships'],
        queryFn: membershipsApi.getPackages,
    });
};
