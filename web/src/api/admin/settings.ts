import { api } from '../client';
import type { ApiResponse, SettingView } from '../types';

export async function adminListSettings(): Promise<SettingView[]> {
  const { data } = await api.get<ApiResponse<SettingView[]>>(
    '/api/v1/admin/settings',
  );
  return data.data;
}

export interface UpdateSettingsInput {
  MAIL_ADMIN_ENABLED?: boolean;
  MAIL_CLIENT_ENABLED?: boolean;
  MAIL_TO?: string;
}

export async function adminUpdateSettings(
  input: UpdateSettingsInput,
): Promise<SettingView[]> {
  const { data } = await api.patch<ApiResponse<SettingView[]>>(
    '/api/v1/admin/settings',
    input,
  );
  return data.data;
}