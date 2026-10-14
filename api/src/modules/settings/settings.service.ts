import { env } from '../../config/env.js';
import {
  BadRequestError,
  UnprocessableEntityError,
} from '../../shared/errors/httpErrors.js';
import {
  SETTINGS,
  getDefinition,
  type SettingKey,
} from './settings.catalog.js';
import * as repo from './settings.repository.js';
import type { UpdateSettingsBody } from './settings.schemas.js';

export interface SettingView {
  key: SettingKey;
  label: string;
  type: 'boolean' | 'email';
  value: string;
}

async function resolveValue(key: SettingKey): Promise<string> {
  const row = await repo.findByKey(key);
  if (row) return row.value;
  return getDefinition(key).fallback;
}

export async function getAll(): Promise<SettingView[]> {
  return Promise.all(
    SETTINGS.map(async (def) => ({
      key: def.key,
      label: def.label,
      type: def.type,
      value: await resolveValue(def.key),
    })),
  );
}

export async function getString(key: SettingKey): Promise<string> {
  return resolveValue(key);
}

export async function getBoolean(key: SettingKey): Promise<boolean> {
  const raw = await resolveValue(key);
  return raw.trim().toLowerCase() === 'true';
}

export async function isMailAdminEnabled(): Promise<boolean> {
  return getBoolean('MAIL_ADMIN_ENABLED');
}

export async function isMailClientEnabled(): Promise<boolean> {
  return getBoolean('MAIL_CLIENT_ENABLED');
}

export async function getMailRecipient(): Promise<string> {
  return getString('MAIL_TO');
}

function ensureSmtpCredentials(): void {
  if (!env.MAIL_USER || !env.MAIL_PASS) {
    throw new UnprocessableEntityError(
      'No se puede activar ningún envío de mails: MAIL_USER y MAIL_PASS deben estar configurados en .env',
    );
  }
}

export async function update(
  input: UpdateSettingsBody,
): Promise<SettingView[]> {
  const entries = Object.entries(input) as Array<[SettingKey, unknown]>;
  if (entries.length === 0) {
    throw new BadRequestError('No settings provided');
  }

  // Validaciones cruzadas
  const wantsToEnableAnyMail =
    input.MAIL_ADMIN_ENABLED === true ||
    input.MAIL_CLIENT_ENABLED === true;

  if (wantsToEnableAnyMail) {
    ensureSmtpCredentials();
  }

  // Si el admin activa el correo a su casilla, necesita un MAIL_TO válido
  if (input.MAIL_ADMIN_ENABLED === true) {
    const existingTo = input.MAIL_TO ?? (await resolveValue('MAIL_TO'));
    if (!existingTo || existingTo.length === 0) {
      throw new UnprocessableEntityError(
        'No se puede activar MAIL_ADMIN_ENABLED sin un MAIL_TO configurado',
      );
    }
  }

  for (const [key, value] of entries) {
    let serialized: string;

    if (typeof value === 'boolean') {
      serialized = value ? 'true' : 'false';
    } else if (typeof value === 'string') {
      serialized = value;
    } else {
      throw new BadRequestError(`Invalid value for setting ${key}`);
    }

    await repo.upsert(key, serialized);
  }

  return getAll();
}