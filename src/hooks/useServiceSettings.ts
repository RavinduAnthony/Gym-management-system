import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { serviceSettingsApi, type ServiceType, type UpdateServiceSettingDto } from '@/features/settings/api/service-settings-api';

export const useServiceSettings = () =>
    useQuery({
        queryKey: ['serviceSettings'],
        queryFn: serviceSettingsApi.getAll,
    });

export const useUpdateServiceSetting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ serviceType, data }: { serviceType: ServiceType; data: UpdateServiceSettingDto }) =>
            serviceSettingsApi.update(serviceType, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['serviceSettings'] });
            toast.success('Service setting saved');
        },
        onError: () => toast.error('Failed to save service setting'),
    });
};
