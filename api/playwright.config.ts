import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test', // Ajustado a la carpeta que creaste
  timeout: 10000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    // Solo el dominio, sin el /api/v1
    baseURL: process.env.API_URL || 'http://localhost:3001',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
});