import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiErrorBody } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// --- Request: inyecta el token admin si existe ---
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response: normaliza errores y maneja 401 en admin ---
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response) {
      const { status, data } = error.response;
      const body = data?.error;

      // 401 en rutas admin → limpiar sesión y redirigir a login
      if (status === 401) {
        const path = window.location.pathname;
        if (path.startsWith('/admin') && path !== '/admin/login') {
          useAuthStore.getState().logout();
          window.location.href = '/admin/login';
        }
      }

      throw new ApiError(
        status,
        body?.code ?? 'UNKNOWN_ERROR',
        body?.message ?? 'Ocurrió un error inesperado',
        body?.details,
      );
    }

    if (error.code === 'ECONNABORTED') {
      throw new ApiError(0, 'TIMEOUT', 'La operación tardó demasiado');
    }

    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'No se pudo conectar con el servidor',
    );
  },
);