import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { client, db } from '../config/turso.js';
import {
  categories,
  couponAssignments,
  coupons,
  presentations,
  products,
  quantityDiscounts,
  settings,
  type PresentationType,
} from './schema/index.js';

type CategoryRow = typeof categories.$inferSelect;
type ProductRow = typeof products.$inferSelect;
type PresentationRow = typeof presentations.$inferSelect;
type CouponRow = typeof coupons.$inferSelect;

let created = 0;
let skipped = 0;

function logCreated(label: string) {
  created++;
  console.log(`  + ${label}`);
}

function logSkipped(label: string) {
  skipped++;
  console.log(`  = ${label} (ya existe)`);
}

async function ensureCategory(data: {
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}): Promise<CategoryRow> {
  const existing = await db.query.categories.findFirst({
    where: eq(categories.slug, data.slug),
  });
  if (existing) {
    logSkipped(`category:${data.slug}`);
    return existing;
  }
  const [row] = await db
  .insert(categories)
  .values({
    name: data.name,
    slug: data.slug,
    description: data.description,
    sortOrder: data.sortOrder ?? 0,
  })
  .returning();
  logCreated(`category:${data.slug}`);
  return row!;
}

async function ensureProduct(data: {
  categoryId: number;
  name: string;
  slug: string;
  subcategory?: string;
  description?: string;
  measures?: string;
}): Promise<ProductRow> {
  const existing = await db.query.products.findFirst({
    where: eq(products.slug, data.slug),
  });
  if (existing) {
    logSkipped(`product:${data.slug}`);
    return existing;
  }
  const [row] = await db.insert(products).values(data).returning();
  logCreated(`product:${data.slug}`);
  return row!;
}

async function ensurePresentation(data: {
  productId: number;
  type: PresentationType;
  priceCents: number;
  stock: number;
  sku?: string;
}): Promise<PresentationRow> {
  const existing = await db.query.presentations.findFirst({
    where: and(
      eq(presentations.productId, data.productId),
      eq(presentations.type, data.type),
      ),
  });
  if (existing) {
    logSkipped(`presentation:${data.sku ?? `${data.productId}/${data.type}`}`);
    return existing;
  }
  const [row] = await db.insert(presentations).values(data).returning();
  logCreated(`presentation:${data.sku ?? `${data.productId}/${data.type}`}`);
  return row!;
}

async function ensureQuantityDiscount(data: {
  productId: number;
  presentationId: number;
  minQuantity: number;
  percent: number;
}) {
  const existing = await db.query.quantityDiscounts.findFirst({
    where: and(
      eq(quantityDiscounts.presentationId, data.presentationId),
      eq(quantityDiscounts.minQuantity, data.minQuantity),
      ),
  });
  if (existing) {
    logSkipped(
  `quantityDiscount:${data.presentationId}/${data.minQuantity}`,
  );
    return existing;
  }
  const [row] = await db.insert(quantityDiscounts).values(data).returning();
  logCreated(`quantityDiscount:${data.presentationId}/${data.minQuantity}`);
  return row!;
}

async function ensureCoupon(data: {
  code: string;
  description?: string;
  maxUses?: number;
}): Promise<CouponRow> {
  const existing = await db.query.coupons.findFirst({
    where: eq(coupons.code, data.code),
  });
  if (existing) {
    logSkipped(`coupon:${data.code}`);
    return existing;
  }
  const [row] = await db.insert(coupons).values(data).returning();
  logCreated(`coupon:${data.code}`);
  return row!;
}

async function ensureCouponAssignment(data: {
  couponId: number;
  productId: number;
  presentationId: number;
  percent: number;
}) {
  const existing = await db.query.couponAssignments.findFirst({
    where: and(
      eq(couponAssignments.couponId, data.couponId),
      eq(couponAssignments.presentationId, data.presentationId),
      ),
  });
  if (existing) {
    logSkipped(`couponAssignment:${data.couponId}/${data.presentationId}`);
    return existing;
  }
  const [row] = await db.insert(couponAssignments).values(data).returning();
  logCreated(`couponAssignment:${data.couponId}/${data.presentationId}`);
  return row!;
}

async function ensureSetting(key: string, value: string) {
  const existing = await db.query.settings.findFirst({
    where: eq(settings.key, key),
  });
  if (existing) {
    logSkipped(`setting:${key}`);
    return existing;
  }
  const [row] = await db.insert(settings).values({ key, value }).returning();
  logCreated(`setting:${key}`);
  return row!;
}

async function main() {
  console.log('\n[seed] Iniciando seed de PackingCenter...\n');

  // ============================================================
  // 1. CATEGORÍAS
  // ============================================================
  const catBandejasEspuma = await ensureCategory({
    name: 'Bandejas de espuma',
    slug: 'bandejas-espuma',
    description: 'Bandejas descartables de espuma para alimentos.',
    sortOrder: 1,
  });
  const catBandejasPlastico = await ensureCategory({
    name: 'Bandejas plásticas',
    slug: 'bandejas-plasticas',
    description: 'Bandejas plásticas resistentes, reutilizables.',
    sortOrder: 2,
  });
  const catVasos = await ensureCategory({
    name: 'Vasos',
    slug: 'vasos',
    description: 'Vasos descartables en varios tamaños y materiales.',
    sortOrder: 3,
  });
  const catPotes = await ensureCategory({
    name: 'Potes y envases',
    slug: 'potes-envases',
    description: 'Potes y envases con y sin tapa para alimentos.',
    sortOrder: 4,
  });
  const catPvcFilm = await ensureCategory({
    name: 'PVC film',
    slug: 'pvc-film',
    description: 'Rollo de PVC film para envolver alimentos.',
    sortOrder: 5,
  });
  const catAluminio = await ensureCategory({
    name: 'Papel aluminio',
    slug: 'papel-aluminio',
    description: 'Rollo de aluminio para cocina y conservación.',
    sortOrder: 6,
  });
  const catPapelManteca = await ensureCategory({
    name: 'Papel manteca',
    slug: 'papel-manteca',
    description: 'Papel manteca en rollo y en hojas.',
    sortOrder: 7,
  });
  const catBolsas = await ensureCategory({
    name: 'Bolsas',
    slug: 'bolsas',
    description: 'Bolsas camiseta, residuos y de papel.',
    sortOrder: 8,
  });
  const catCubiertos = await ensureCategory({
    name: 'Cubiertos descartables',
    slug: 'cubiertos',
    description: 'Cubiertos descartables de plástico y madera.',
    sortOrder: 9,
  });
  const catServilletas = await ensureCategory({
    name: 'Servilletas y sorbetes',
    slug: 'servilletas-sorbetes',
    description: 'Servilletas de papel y sorbetes descartables.',
    sortOrder: 10,
  });
  
  await ensureCategory({
  name: 'Populares',
  slug: 'populares',
  description: 'Productos destacados que aparecen en la home.',
  sortOrder: 0,
});
  // ============================================================
  // 2. BANDEJAS DE ESPUMA
  // ============================================================
  console.log('\n[seed] Bandejas de espuma');

  const bE1 = await ensureProduct({
    categoryId: catBandejasEspuma.id,
    name: 'Bandeja de espuma N°1',
    slug: 'bandeja-espuma-n1',
    subcategory: 'espuma',
    description: 'Bandeja de espuma blanca, ideal para porciones pequeñas.',
    measures: 'N°1 · 12 x 9 x 1,5 cm',
  });
  const bE1Uni = await ensurePresentation({
    productId: bE1.id,
    type: 'unidad',
    priceCents: 300,
    stock: 5000,
    sku: 'BAND-ESP-N1-UNI',
  });
  const bE1Paq = await ensurePresentation({
    productId: bE1.id,
    type: 'paquete',
    priceCents: 13500,
    stock: 200,
    sku: 'BAND-ESP-N1-PAQ',
  });
  await ensurePresentation({
    productId: bE1.id,
    type: 'caja',
    priceCents: 120000,
    stock: 40,
    sku: 'BAND-ESP-N1-CAJ',
  });

  const bE4 = await ensureProduct({
    categoryId: catBandejasEspuma.id,
    name: 'Bandeja de espuma N°4',
    slug: 'bandeja-espuma-n4',
    subcategory: 'espuma',
    description: 'Bandeja de espuma para carnes, fiambres y comidas.',
    measures: 'N°4 · 20 x 14 x 2 cm',
  });
  const bE4Uni = await ensurePresentation({
    productId: bE4.id,
    type: 'unidad',
    priceCents: 500,
    stock: 3000,
    sku: 'BAND-ESP-N4-UNI',
  });
  const bE4Paq = await ensurePresentation({
    productId: bE4.id,
    type: 'paquete',
    priceCents: 22500,
    stock: 120,
    sku: 'BAND-ESP-N4-PAQ',
  });
  const bE4Caj = await ensurePresentation({
    productId: bE4.id,
    type: 'caja',
    priceCents: 200000,
    stock: 25,
    sku: 'BAND-ESP-N4-CAJ',
  });

  const bE8 = await ensureProduct({
    categoryId: catBandejasEspuma.id,
    name: 'Bandeja de espuma N°8',
    slug: 'bandeja-espuma-n8',
    subcategory: 'espuma',
    description: 'Bandeja grande de espuma, para asados y porciones grandes.',
    measures: 'N°8 · 27 x 20 x 3 cm',
  });
  const bE8Uni = await ensurePresentation({
    productId: bE8.id,
    type: 'unidad',
    priceCents: 900,
    stock: 1500,
    sku: 'BAND-ESP-N8-UNI',
  });
  const bE8Paq = await ensurePresentation({
    productId: bE8.id,
    type: 'paquete',
    priceCents: 40000,
    stock: 60,
    sku: 'BAND-ESP-N8-PAQ',
  });
  await ensurePresentation({
    productId: bE8.id,
    type: 'caja',
    priceCents: 360000,
    stock: 15,
    sku: 'BAND-ESP-N8-CAJ',
  });

  // ============================================================
  // 3. BANDEJAS PLÁSTICAS
  // ============================================================
  console.log('\n[seed] Bandejas plásticas');

  const bP1 = await ensureProduct({
    categoryId: catBandejasPlastico.id,
    name: 'Bandeja plástica rectangular',
    slug: 'bandeja-plastica-rectangular',
    subcategory: 'espuma',
    description: 'Bandeja plástica resistente, apta para microondas.',
    measures: '25 x 18 x 4 cm',
  });
  const bP1Uni = await ensurePresentation({
    productId: bP1.id,
    type: 'unidad',
    priceCents: 1500,
    stock: 800,
    sku: 'BAND-PLAST-RECT-UNI',
  });
  const bP1Paq = await ensurePresentation({
    productId: bP1.id,
    type: 'paquete',
    priceCents: 67500,
    stock: 30,
    sku: 'BAND-PLAST-RECT-PAQ',
  });
  await ensurePresentation({
    productId: bP1.id,
    type: 'caja',
    priceCents: 600000,
    stock: 8,
    sku: 'BAND-PLAST-RECT-CAJ',
  });

  // ============================================================
  // 4. VASOS
  // ============================================================
  console.log('\n[seed] Vasos');

  const v200 = await ensureProduct({
    categoryId: catVasos.id,
    name: 'Vaso plástico 200 ml',
    slug: 'vaso-plastico-200-ml',
    subcategory: 'espuma',
    description: 'Vaso descartable transparente, apto para bebidas frías.',
    measures: '200 ml · 7 cm alto · 7 cm diámetro',
  });
  const v200Uni = await ensurePresentation({
    productId: v200.id,
    type: 'unidad',
    priceCents: 300,
    stock: 10000,
    sku: 'VASO-200-UNI',
  });
  const v200Paq = await ensurePresentation({
    productId: v200.id,
    type: 'paquete',
    priceCents: 25000,
    stock: 100,
    sku: 'VASO-200-PAQ',
  });
  const v200Caj = await ensurePresentation({
    productId: v200.id,
    type: 'caja',
    priceCents: 220000,
    stock: 20,
    sku: 'VASO-200-CAJ',
  });

  const v300 = await ensureProduct({
    categoryId: catVasos.id,
    name: 'Vaso plástico 300 ml',
    slug: 'vaso-plastico-300-ml',
    subcategory: 'espuma',
    description: 'Vaso descartable transparente mediano.',
    measures: '300 ml · 9 cm alto · 8 cm diámetro',
  });
  const v300Uni = await ensurePresentation({
    productId: v300.id,
    type: 'unidad',
    priceCents: 400,
    stock: 8000,
    sku: 'VASO-300-UNI',
  });
  const v300Paq = await ensurePresentation({
    productId: v300.id,
    type: 'paquete',
    priceCents: 33000,
    stock: 80,
    sku: 'VASO-300-PAQ',
  });
  const v300Caj = await ensurePresentation({
    productId: v300.id,
    type: 'caja',
    priceCents: 290000,
    stock: 15,
    sku: 'VASO-300-CAJ',
  });

  const v500 = await ensureProduct({
    categoryId: catVasos.id,
    name: 'Vaso plástico 500 ml',
    slug: 'vaso-plastico-500-ml',
    subcategory: 'espuma',
    description: 'Vaso descartable grande, ideal para cerveza o refrescos.',
    measures: '500 ml · 12 cm alto · 9 cm diámetro',
  });
  const v500Uni = await ensurePresentation({
    productId: v500.id,
    type: 'unidad',
    priceCents: 600,
    stock: 5000,
    sku: 'VASO-500-UNI',
  });
  const v500Paq = await ensurePresentation({
    productId: v500.id,
    type: 'paquete',
    priceCents: 50000,
    stock: 50,
    sku: 'VASO-500-PAQ',
  });
  await ensurePresentation({
    productId: v500.id,
    type: 'caja',
    priceCents: 440000,
    stock: 10,
    sku: 'VASO-500-CAJ',
  });

  // ============================================================
  // 5. POTES Y ENVASES
  // ============================================================
  console.log('\n[seed] Potes y envases');

  const p250 = await ensureProduct({
    categoryId: catPotes.id,
    name: 'Pote 250 ml con tapa',
    slug: 'pote-250-ml-con-tapa',
    subcategory: 'espuma',
    description: 'Pote descartable con tapa, apto para alimentos fríos y calientes.',
    measures: '250 ml · 8 cm alto · 7 cm diámetro',
  });
  const p250Uni = await ensurePresentation({
    productId: p250.id,
    type: 'unidad',
    priceCents: 600,
    stock: 3000,
    sku: 'POTE-250-UNI',
  });
  const p250Paq = await ensurePresentation({
    productId: p250.id,
    type: 'paquete',
    priceCents: 27000,
    stock: 60,
    sku: 'POTE-250-PAQ',
  });
  await ensurePresentation({
    productId: p250.id,
    type: 'caja',
    priceCents: 230000,
    stock: 12,
    sku: 'POTE-250-CAJ',
  });

  const p500 = await ensureProduct({
    categoryId: catPotes.id,
    name: 'Pote 500 ml con tapa',
    slug: 'pote-500-ml-con-tapa',
    subcategory: 'espuma',
    description: 'Pote descartable con tapa para sopas y comidas.',
    measures: '500 ml · 10 cm alto · 9 cm diámetro',
  });
  const p500Uni = await ensurePresentation({
    productId: p500.id,
    type: 'unidad',
    priceCents: 800,
    stock: 2500,
    sku: 'POTE-500-UNI',
  });
  const p500Paq = await ensurePresentation({
    productId: p500.id,
    type: 'paquete',
    priceCents: 36000,
    stock: 50,
    sku: 'POTE-500-PAQ',
  });
  const p500Caj = await ensurePresentation({
    productId: p500.id,
    type: 'caja',
    priceCents: 310000,
    stock: 10,
    sku: 'POTE-500-CAJ',
  });

  const p1l = await ensureProduct({
    categoryId: catPotes.id,
    name: 'Pote 1 litro con tapa',
    slug: 'pote-1l-con-tapa',
    subcategory: 'espuma',
    description: 'Pote grande con tapa, ideal para ensaladas y comidas familiares.',
    measures: '1 L · 14 cm alto · 12 cm diámetro',
  });
  const p1lUni = await ensurePresentation({
    productId: p1l.id,
    type: 'unidad',
    priceCents: 1200,
    stock: 1500,
    sku: 'POTE-1L-UNI',
  });
  const p1lPaq = await ensurePresentation({
    productId: p1l.id,
    type: 'paquete',
    priceCents: 54000,
    stock: 30,
    sku: 'POTE-1L-PAQ',
  });
  await ensurePresentation({
    productId: p1l.id,
    type: 'caja',
    priceCents: 480000,
    stock: 6,
    sku: 'POTE-1L-CAJ',
  });

  // ============================================================
  // 6. PVC FILM
  // ============================================================
  console.log('\n[seed] PVC film');

  const pvc30 = await ensureProduct({
    categoryId: catPvcFilm.id,
    name: 'PVC film 30 cm x 30 m',
    slug: 'pvc-film-30cm-30m',
    subcategory: 'espuma',
    description: 'Rollo de PVC film transparente para conservar alimentos.',
    measures: '30 cm ancho · 30 m largo',
  });
  const pvc30Uni = await ensurePresentation({
    productId: pvc30.id,
    type: 'unidad',
    priceCents: 12000,
    stock: 500,
    sku: 'PVC-30-UNI',
  });
  const pvc30Paq = await ensurePresentation({
    productId: pvc30.id,
    type: 'paquete',
    priceCents: 540000,
    stock: 30,
    sku: 'PVC-30-PAQ',
  });
  await ensurePresentation({
    productId: pvc30.id,
    type: 'caja',
    priceCents: 4800000,
    stock: 6,
    sku: 'PVC-30-CAJ',
  });

  const pvc45 = await ensureProduct({
    categoryId: catPvcFilm.id,
    name: 'PVC film 45 cm x 30 m',
    slug: 'pvc-film-45cm-30m',
    subcategory: 'espuma',
    description: 'Rollo de PVC film ancho para gastronomía.',
    measures: '45 cm ancho · 30 m largo',
  });
  await ensurePresentation({
    productId: pvc45.id,
    type: 'unidad',
    priceCents: 17000,
    stock: 300,
    sku: 'PVC-45-UNI',
  });
  await ensurePresentation({
    productId: pvc45.id,
    type: 'paquete',
    priceCents: 765000,
    stock: 20,
    sku: 'PVC-45-PAQ',
  });

  // ============================================================
  // 7. PAPEL ALUMINIO
  // ============================================================
  console.log('\n[seed] Papel aluminio');

  const alu30 = await ensureProduct({
    categoryId: catAluminio.id,
    name: 'Papel aluminio 30 cm x 7,5 m',
    slug: 'papel-aluminio-30cm-7-5m',
    subcategory: 'espuma',
    description: 'Rollo de aluminio para conservación de alimentos.',
    measures: '30 cm ancho · 7,5 m largo',
  });
  await ensurePresentation({
    productId: alu30.id,
    type: 'unidad',
    priceCents: 8000,
    stock: 400,
    sku: 'ALU-30-UNI',
  });
  await ensurePresentation({
    productId: alu30.id,
    type: 'paquete',
    priceCents: 360000,
    stock: 20,
    sku: 'ALU-30-PAQ',
  });

  // ============================================================
  // 8. PAPEL MANTECA
  // ============================================================
  console.log('\n[seed] Papel manteca');

  const manteca = await ensureProduct({
    categoryId: catPapelManteca.id,
    name: 'Papel manteca 30 cm x 30 m',
    slug: 'papel-manteca-30cm-30m',
    subcategory: 'espuma',
    description: 'Rollo de papel manteca para cocina y repostería.',
    measures: '30 cm ancho · 30 m largo',
  });
  await ensurePresentation({
    productId: manteca.id,
    type: 'unidad',
    priceCents: 7000,
    stock: 300,
    sku: 'MANTECA-30-UNI',
  });
  await ensurePresentation({
    productId: manteca.id,
    type: 'paquete',
    priceCents: 315000,
    stock: 15,
    sku: 'MANTECA-30-PAQ',
  });

  // ============================================================
  // 9. BOLSAS
  // ============================================================
  console.log('\n[seed] Bolsas');

  const bolsaCamiseta = await ensureProduct({
    categoryId: catBolsas.id,
    name: 'Bolsa camiseta 30 x 40 cm',
    slug: 'bolsa-camiseta-30x40',
    subcategory: 'espuma',
    description: 'Bolsa camiseta de polietileno, alta resistencia.',
    measures: '30 x 40 cm',
  });
  const bolsaCamUni = await ensurePresentation({
    productId: bolsaCamiseta.id,
    type: 'unidad',
    priceCents: 200,
    stock: 20000,
    sku: 'BOLSA-CAM-3040-UNI',
  });
  const bolsaCamPaq = await ensurePresentation({
    productId: bolsaCamiseta.id,
    type: 'paquete',
    priceCents: 9000,
    stock: 300,
    sku: 'BOLSA-CAM-3040-PAQ',
  });
  const bolsaCamCaj = await ensurePresentation({
    productId: bolsaCamiseta.id,
    type: 'caja',
    priceCents: 80000,
    stock: 50,
    sku: 'BOLSA-CAM-3040-CAJ',
  });

  const bolsaResiduo = await ensureProduct({
    categoryId: catBolsas.id,
    name: 'Bolsa de residuos 60 x 80 cm',
    slug: 'bolsa-residuos-60x80',
    subcategory: 'espuma',
    description: 'Bolsa de residuos reforzada, color negro.',
    measures: '60 x 80 cm',
  });
  await ensurePresentation({
    productId: bolsaResiduo.id,
    type: 'unidad',
    priceCents: 500,
    stock: 8000,
    sku: 'BOLSA-RES-6080-UNI',
  });
  await ensurePresentation({
    productId: bolsaResiduo.id,
    type: 'paquete',
    priceCents: 22500,
    stock: 120,
    sku: 'BOLSA-RES-6080-PAQ',
  });

  // ============================================================
  // 10. CUBIERTOS
  // ============================================================
  console.log('\n[seed] Cubiertos descartables');

  const cubiertos = await ensureProduct({
    categoryId: catCubiertos.id,
    name: 'Cubiertos descartables (set tenedor, cuchillo, cuchara)',
    slug: 'cubiertos-descartables-set',
    subcategory: 'espuma',
    description: 'Set de cubiertos descartables de plástico, uso profesional.',
    measures: 'Set x 3 piezas',
  });
  await ensurePresentation({
    productId: cubiertos.id,
    type: 'unidad',
    priceCents: 300,
    stock: 10000,
    sku: 'CUB-SET-UNI',
  });
  await ensurePresentation({
    productId: cubiertos.id,
    type: 'paquete',
    priceCents: 13500,
    stock: 200,
    sku: 'CUB-SET-PAQ',
  });

  // ============================================================
  // 11. SERVILLETAS Y SORBETES
  // ============================================================
  console.log('\n[seed] Servilletas y sorbetes');

  const servilletas = await ensureProduct({
    categoryId: catServilletas.id,
    name: 'Servilletas de papel 24 x 24 cm',
    slug: 'servilletas-papel-24x24',
    subcategory: 'espuma',
    description: 'Servilletas de papel tissue, doble hoja.',
    measures: '24 x 24 cm · doble hoja',
  });
  await ensurePresentation({
    productId: servilletas.id,
    type: 'unidad',
    priceCents: 50,
    stock: 50000,
    sku: 'SERV-2424-UNI',
  });
  await ensurePresentation({
    productId: servilletas.id,
    type: 'paquete',
    priceCents: 2250,
    stock: 500,
    sku: 'SERV-2424-PAQ',
  });
  await ensurePresentation({
    productId: servilletas.id,
    type: 'caja',
    priceCents: 20000,
    stock: 80,
    sku: 'SERV-2424-CAJ',
  });

  const sorbetes = await ensureProduct({
    categoryId: catServilletas.id,
    name: 'Sorbetes descartables',
    slug: 'sorbetes-descartables',
    subcategory: 'espuma',
    description: 'Sorbetes de plástico, color surtido.',
    measures: '20 cm largo',
  });
  await ensurePresentation({
    productId: sorbetes.id,
    type: 'unidad',
    priceCents: 100,
    stock: 30000,
    sku: 'SORB-UNI',
  });
  await ensurePresentation({
    productId: sorbetes.id,
    type: 'paquete',
    priceCents: 4500,
    stock: 300,
    sku: 'SORB-PAQ',
  });

  // ============================================================
  // 12. DESCUENTOS POR CANTIDAD
  // ============================================================
  console.log('\n[seed] Descuentos por cantidad');

  // Bandejas espuma N°1
  await ensureQuantityDiscount({
    productId: bE1.id,
    presentationId: bE1Paq.id,
    minQuantity: 10,
    percent: 5,
  });

  // Bandejas espuma N°4
  await ensureQuantityDiscount({
    productId: bE4.id,
    presentationId: bE4Paq.id,
    minQuantity: 5,
    percent: 5,
  });
  await ensureQuantityDiscount({
    productId: bE4.id,
    presentationId: bE4Caj.id,
    minQuantity: 3,
    percent: 10,
  });

  // Bandejas espuma N°8
  await ensureQuantityDiscount({
    productId: bE8.id,
    presentationId: bE8Paq.id,
    minQuantity: 5,
    percent: 8,
  });

  // Bandeja plástica
  await ensureQuantityDiscount({
    productId: bP1.id,
    presentationId: bP1Paq.id,
    minQuantity: 4,
    percent: 8,
  });

  // Vasos 200
  await ensureQuantityDiscount({
    productId: v200.id,
    presentationId: v200Paq.id,
    minQuantity: 10,
    percent: 5,
  });
  await ensureQuantityDiscount({
    productId: v200.id,
    presentationId: v200Caj.id,
    minQuantity: 5,
    percent: 10,
  });

  // Vasos 300
  await ensureQuantityDiscount({
    productId: v300.id,
    presentationId: v300Paq.id,
    minQuantity: 10,
    percent: 5,
  });
  await ensureQuantityDiscount({
    productId: v300.id,
    presentationId: v300Caj.id,
    minQuantity: 5,
    percent: 10,
  });

  // Vasos 500
  await ensureQuantityDiscount({
    productId: v500.id,
    presentationId: v500Paq.id,
    minQuantity: 10,
    percent: 5,
  });

  // Pote 250
  await ensureQuantityDiscount({
    productId: p250.id,
    presentationId: p250Paq.id,
    minQuantity: 5,
    percent: 5,
  });

  // Pote 500
  await ensureQuantityDiscount({
    productId: p500.id,
    presentationId: p500Caj.id,
    minQuantity: 3,
    percent: 8,
  });

  // PVC film 30
  await ensureQuantityDiscount({
    productId: pvc30.id,
    presentationId: pvc30Uni.id,
    minQuantity: 10,
    percent: 10,
  });
  await ensureQuantityDiscount({
    productId: pvc30.id,
    presentationId: pvc30Paq.id,
    minQuantity: 5,
    percent: 5,
  });

  // Bolsas camiseta
  await ensureQuantityDiscount({
    productId: bolsaCamiseta.id,
    presentationId: bolsaCamUni.id,
    minQuantity: 500,
    percent: 10,
  });
  await ensureQuantityDiscount({
    productId: bolsaCamiseta.id,
    presentationId: bolsaCamPaq.id,
    minQuantity: 10,
    percent: 5,
  });
  await ensureQuantityDiscount({
    productId: bolsaCamiseta.id,
    presentationId: bolsaCamCaj.id,
    minQuantity: 5,
    percent: 10,
  });

  // ============================================================
  // 13. CUPONES
  // ============================================================
  console.log('\n[seed] Cupones');

  const cuponNavidad = await ensureCoupon({
    code: 'NAVIDAD',
    description: '15% off en unidades seleccionadas de bandejas y vasos.',
  });
  await ensureCouponAssignment({
    couponId: cuponNavidad.id,
    productId: bE4.id,
    presentationId: bE4Uni.id,
    percent: 15,
  });
  await ensureCouponAssignment({
    couponId: cuponNavidad.id,
    productId: v300.id,
    presentationId: v300Uni.id,
    percent: 15,
  });

  const cuponVerano = await ensureCoupon({
    code: 'VERANO',
    description: '10% off en vasos y potes unidad para consumo en eventos.',
    maxUses: 200,
  });
  await ensureCouponAssignment({
    couponId: cuponVerano.id,
    productId: v200.id,
    presentationId: v200Uni.id,
    percent: 10,
  });
  await ensureCouponAssignment({
    couponId: cuponVerano.id,
    productId: v500.id,
    presentationId: v500Uni.id,
    percent: 10,
  });
  await ensureCouponAssignment({
    couponId: cuponVerano.id,
    productId: p500.id,
    presentationId: p500Uni.id,
    percent: 10,
  });

  const cuponFiestas = await ensureCoupon({
    code: 'FIESTAS',
    description: '20% off en servilletas y sorbetes por unidad.',
  });
  await ensureCouponAssignment({
    couponId: cuponFiestas.id,
    productId: servilletas.id,
    presentationId: (await db.query.presentations.findFirst({
      where: and(
        eq(presentations.productId, servilletas.id),
        eq(presentations.type, 'unidad'),
        ),
    }))!.id,
    percent: 20,
  });
  await ensureCouponAssignment({
    couponId: cuponFiestas.id,
    productId: sorbetes.id,
    presentationId: (await db.query.presentations.findFirst({
      where: and(
        eq(presentations.productId, sorbetes.id),
        eq(presentations.type, 'unidad'),
        ),
    }))!.id,
    percent: 20,
  });

  // ============================================================
  // 14. SETTINGS
  // ============================================================
  console.log('\n[seed] Settings');
  await ensureSetting('MAIL_ADMIN_ENABLED', 'false');
  await ensureSetting('MAIL_CLIENT_ENABLED', 'false');
  await ensureSetting('MAIL_TO', 'pedidos.packingcenter@gmail.com');
  await ensureSetting('SEED_VERSION', '2');

  console.log(`\n[seed] Listo. created=${created} skipped=${skipped}\n`);
}

main()
.catch((err) => {
  console.error('\n[seed] Falló:', err);
  process.exitCode = 1;
})
.finally(() => {
  client.close();
});