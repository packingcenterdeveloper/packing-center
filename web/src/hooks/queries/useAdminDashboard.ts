import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { AdminDashboard, ApiResponse } from '@/api/types';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminDashboard>>(
        '/api/v1/admin/dashboard',
      );
      return data.data;
    },
    staleTime: 30 * 1000,
  });
}