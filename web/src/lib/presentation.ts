import { PRESENTATION_TYPE_LABELS } from './constants';

export function getPresentationLabel(p: {
  type: string;
  unitCount?: number | null;
}): string {
  const base = PRESENTATION_TYPE_LABELS[p.type] ?? p.type;
  
  if (p.unitCount && p.unitCount > 0) {
    return `${base} x ${p.unitCount}`;
  }
  return base;
}