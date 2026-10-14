import { env } from '../../config/env.js';

export type SettingKey =
  | 'MAIL_ADMIN_ENABLED'
  | 'MAIL_CLIENT_ENABLED'
  | 'MAIL_TO';

export type SettingType = 'boolean' | 'email';

export interface SettingDefinition {
  key: SettingKey;
  label: string;
  type: SettingType;
  fallback: string;
}

export const SETTINGS: SettingDefinition[] = [
  {
    key: 'MAIL_ADMIN_ENABLED',
    label: 'Enviar mail al correo del proyecto por cada compra',
    type: 'boolean',
    fallback: 'false',
  },
  {
    key: 'MAIL_CLIENT_ENABLED',
    label: 'Enviar mail de confirmación al cliente',
    type: 'boolean',
    fallback: 'false',
  },
  {
    key: 'MAIL_TO',
    label: 'Correo del proyecto (destino de notificaciones)',
    type: 'email',
    fallback: env.MAIL_TO ?? '',
  },
];

const SETTINGS_BY_KEY: Record<SettingKey, SettingDefinition> = Object.fromEntries(
  SETTINGS.map((s) => [s.key, s]),
) as Record<SettingKey, SettingDefinition>;

export function getDefinition(key: SettingKey): SettingDefinition {
  return SETTINGS_BY_KEY[key];
}

export function isSettingKey(value: string): value is SettingKey {
  return value in SETTINGS_BY_KEY;
}