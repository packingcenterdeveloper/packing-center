/**
 * Convierte centavos (entero) a string formateado en pesos uruguayos.
 * Sin decimales, con separador de miles "." (formato es-UY).
 * Ej: 59000 → "$ 590", 123400 → "$ 1.234"
 */
export function formatCents(cents: number): string {
  const pesos = Math.round(cents / 100);
  return `$ ${pesos.toLocaleString('es-UY')}`;
}

/**
 * Fecha corta en formato UY: "14/10/2026"
 */
export function formatDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Fecha y hora: "14/10/2026 - 16:32"
 */
export function formatDateTime(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const date = d.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('es-UY', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} - ${time}`;
}

/**
 * Normaliza un teléfono uruguayo quitando todo lo que no sea dígito.
 * Útil antes de mandarlo al back o comparar.
 */
export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

/**
 * Formatea un teléfono uruguayo para mostrar. Acepta 9 dígitos (móvil
 * 09x xxx xxx) o 8 dígitos (fijo xxx xxx). Si no matchea, devuelve el
 * input tal cual.
 */
export function formatPhoneUY(raw: string): string {
  const digits = normalizePhone(raw);
  if (digits.length === 9 && digits.startsWith('09')) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  return raw;
}

/**
 * Pluraliza una palabra según la cantidad.
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? singular : plural;
}