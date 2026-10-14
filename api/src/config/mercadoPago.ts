import { MercadoPagoConfig } from 'mercadopago';
import { env } from './env.js';

export const mpClient = new MercadoPagoConfig({
  accessToken: env.MP_ACCESS_TOKEN,
});