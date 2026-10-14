export interface ShippingDepartment {
  slug: string;
  name: string;
  isFree: boolean;
}

export const SHIPPING_COST_LABEL =
  'El envío por DAC se cobra al retirar.';

export const SHIPPING_DEPARTMENTS: ShippingDepartment[] = [
  { slug: 'artigas', name: 'Artigas', isFree: false },
  { slug: 'canelones', name: 'Canelones', isFree: true },
  { slug: 'cerro-largo', name: 'Cerro Largo', isFree: false },
  { slug: 'colonia', name: 'Colonia', isFree: false },
  { slug: 'durazno', name: 'Durazno', isFree: false },
  { slug: 'flores', name: 'Flores', isFree: false },
  { slug: 'florida', name: 'Florida', isFree: false },
  { slug: 'lavalleja', name: 'Lavalleja', isFree: false },
  { slug: 'maldonado', name: 'Maldonado', isFree: false },
  { slug: 'montevideo', name: 'Montevideo', isFree: true },
  { slug: 'paysandu', name: 'Paysandú', isFree: false },
  { slug: 'rio-negro', name: 'Río Negro', isFree: false },
  { slug: 'rivera', name: 'Rivera', isFree: false },
  { slug: 'rocha', name: 'Rocha', isFree: false },
  { slug: 'salto', name: 'Salto', isFree: false },
  { slug: 'san-jose', name: 'San José', isFree: false },
  { slug: 'soriano', name: 'Soriano', isFree: false },
  { slug: 'tacuarembo', name: 'Tacuarembó', isFree: false },
  { slug: 'treinta-y-tres', name: 'Treinta y Tres', isFree: false },
];

export function findDepartment(
  slug: string,
): ShippingDepartment | undefined {
  return SHIPPING_DEPARTMENTS.find((d) => d.slug === slug);
}