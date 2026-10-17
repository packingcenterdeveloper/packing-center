import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminUpdateSettings,
  type UpdateSettingsInput,
} from '@/api/admin/settings';
import { adminSettingsKeys } from '../queries/useAdminSettings';

export function useUpdateSettings() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => adminUpdateSettings(input),
    onSuccess: (data) => {
      qc.setQueryData(adminSettingsKeys.all, data);
    },
  });
}