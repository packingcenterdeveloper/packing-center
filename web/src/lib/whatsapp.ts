import { normalizePhone } from './format';

/**
 * Convierte un teléfono uruguayo al formato que wa.me espera.
 * Ejemplos:
 *   "099 123 456"  → "59899123456"
 *   "099123456"    → "59899123456"
 *   "24001234"     → "59824001234"   (fijo Montevideo)
 *   "+59899123456" → "59899123456"
 */
export function toWhatsAppNumber(rawPhone: string): string {
  let digits = normalizePhone(rawPhone);

  // Si ya arranca con 598, lo dejamos
  if (digits.startsWith('598')) {
    return digits;
  }

  // Si arranca con 0, lo sacamos (formato local UY)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return `598${digits}`;
}

interface BuildWhatsAppUrlOptions {
  phone: string;
  message?: string;
}

export function buildWhatsAppUrl({
  phone,
  message,
}: BuildWhatsAppUrlOptions): string {
  const number = toWhatsAppNumber(phone);
  const base = `https://wa.me/${number}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}