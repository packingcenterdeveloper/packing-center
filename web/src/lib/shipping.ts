export interface ShippingOption {
  value: string;
  label: string;
  isFree: boolean;
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  // Ciudades gratis
  { value: 'progreso', label: 'Progreso', isFree: true },
  { value: '18-de-mayo', label: '18 de Mayo', isFree: true },
  { value: 'las-piedras', label: 'Las Piedras', isFree: true },
  { value: 'la-paz', label: 'La Paz', isFree: true },

  // Resto del país (se cobra al retirar por DAC)
  { value: 'artigas', label: 'Artigas', isFree: false },
  { value: 'canelones-otros', label: 'Canelones (otros)', isFree: false },
  { value: 'cerro-largo', label: 'Cerro Largo', isFree: false },
  { value: 'colonia', label: 'Colonia', isFree: false },
  { value: 'durazno', label: 'Durazno', isFree: false },
  { value: 'flores', label: 'Flores', isFree: false },
  { value: 'florida', label: 'Florida', isFree: false },
  { value: 'lavalleja', label: 'Lavalleja', isFree: false },
  { value: 'maldonado', label: 'Maldonado', isFree: false },
  { value: 'montevideo', label: 'Montevideo', isFree: false },
  { value: 'paysandu', label: 'Paysandú', isFree: false },
  { value: 'rio-negro', label: 'Río Negro', isFree: false },
  { value: 'rivera', label: 'Rivera', isFree: false },
  { value: 'rocha', label: 'Rocha', isFree: false },
  { value: 'salto', label: 'Salto', isFree: false },
  { value: 'san-jose', label: 'San José', isFree: false },
  { value: 'soriano', label: 'Soriano', isFree: false },
  { value: 'tacuarembo', label: 'Tacuarembó', isFree: false },
  { value: 'treinta-y-tres', label: 'Treinta y Tres', isFree: false },
];

export const SHIPPING_COST_LABEL = 'Se cobra al retirar por DAC';

export function findShippingOption(
  value: string | null | undefined,
): ShippingOption | null {
  if (!value) return null;
  return SHIPPING_OPTIONS.find((o) => o.value === value) ?? null;
}