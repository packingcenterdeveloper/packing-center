import { useQuery } from '@tanstack/react-query';
import { adminListSettings } from '@/api/admin/settings';

export const adminSettingsKeys = {
  all: ['admin', 'settings'] as const,
};

export function useAdminSettings() {
  return useQuery({
    queryKey: adminSettingsKeys.all,
    queryFn: adminListSettings,
  });
}