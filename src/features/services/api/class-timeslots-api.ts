import { api } from '@/core/api/axios-instance';
import { ENDPOINTS } from '@/core/api/endpoints';

export interface ClassTimeSlotDto {
    id: string;
    branchId: string;
    gymClassId: string;
    className: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}

export const classTimeSlotsApi = {
    getByBranch: async (branchId: string, excludeClassId?: string): Promise<ClassTimeSlotDto[]> => {
        const params = excludeClassId ? `?excludeClassId=${excludeClassId}` : '';
        const res = await api.get(`${ENDPOINTS.CLASS_TIME_SLOTS_BY_BRANCH(branchId)}${params}`);
        return res.data.data ?? [];
    },
};
