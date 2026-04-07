import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/axios-instance';
import { ENDPOINTS } from '@/core/api/endpoints';

export interface WorkingHoursEntry {
    id: string;
    day: string;       // "Monday", "Tuesday", etc.
    openTime: string;  // "09:00"
    closeTime: string; // "22:00"
    isClosed: boolean;
}

export const useWorkingHours = () =>
    useQuery({
        queryKey: ['workingHours'],
        queryFn: async (): Promise<WorkingHoursEntry[]> => {
            const res = await api.get(ENDPOINTS.WORKING_HOURS);
            return res.data.data ?? [];
        },
    });
