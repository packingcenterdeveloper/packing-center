const KEY = 'P4ckiNgC3nt3r.L4stOrd3r';

export interface LastOrderRef {
  id: string;
  phone: string;
}

export function setLastOrder(ref: LastOrderRef): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ref));
  } catch {
    // sessionStorage puede fallar en modo privado estricto; no es crítico.
  }
}

export function getLastOrder(): LastOrderRef | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastOrderRef;
    if (typeof parsed?.id !== 'string' || typeof parsed?.phone !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearLastOrder(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // noop
  }
}