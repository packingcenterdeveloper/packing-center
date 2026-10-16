import { api } from './client';
import type { ApiResponse, LoginResponse, MeResponse } from './types';

export interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>(
    '/api/v1/auth/login',
    input,
  );
  return data.data;
}

export async function me(): Promise<MeResponse> {
  const { data } = await api.get<ApiResponse<MeResponse>>('/api/v1/auth/me');
  return data.data;
}