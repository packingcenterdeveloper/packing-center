import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  couponAssignments,
  coupons,
  presentations,
  quantityDiscounts,
} from '../../db/schema/index.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../shared/errors/httpErrors.js';
import {
  SHIPPING_COST_LABEL,
  findDepartment,
} from '../shipping/shipping.data.js';
import type { PresentationType } from '../../db/schema/index.js';
import type { QuoteBody, QuoteItemInput } from './cart.schemas.js';

export interface QuoteItemResult {
  presentationId: number;
  productId: number;
  productName: string;
  productSlug: string;
  presentationType: PresentationType;
  unitPriceCents: number;
  quantity: number;
  lineSubtotalCents: number;
  quantityDiscountPercent: number | null;
  quantityDiscountCents: number;
  couponCode: string | null;
  couponPercent: number | null;
  couponDiscountCents: number;
  lineTotalCents: number;
}

export interface QuoteResult {
  items: QuoteItemResult[];
  subtotalCents: number;
  quantityDiscountCents: number;
  couponDiscountCents: number;
  totalCents: number;
  shipping: {
    department: string | null;
    departmentName: string | null;
    isFree: boolean;
    label: string;
  };
  warnings: string[];
}

interface AppliedCoupon {
  code: string;
  percent: number;
  couponId: number;
}

function isCouponCurrentlyValid(
  coupon: {
    isActive: boolean;
    validFrom: Date | null;
    validUntil: Date | null;
    maxUses: number | null;
    usedCount: number;
  },
  now: Date,
): { valid: boolean; reason?: string } {
  if (!coupon.isActive) return { valid: false, reason: 'no está activo' };
  if (coupon.validFrom && coupon.validFrom > now) {
    return { valid: false, reason: 'todavía no está vigente' };
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return { valid: false, reason: 'expiró' };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, reason: 'alcanzó su límite de usos' };
  }
  return { valid: true };
}

function pickQuantityDiscount(
  rules: Array<{ minQuantity: number; percent: number }>,
  quantity: number,
): { minQuantity: number; percent: number } | null {
  // Reglas ya vienen ordenadas por minQuantity descendente.
  const match = rules.find((r) => quantity >= r.minQuantity);
  return match ?? null;
}

function applyPercent(cents: number, percent: number): number {
  return Math.round((cents * percent) / 100);
}

export async function quote(input: QuoteBody): Promise<QuoteResult> {
  const ids = input.items.map((i) => i.presentationId);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    throw new BadRequestError(
      'Duplicate presentationId in items. Combine quantities instead.',
    );
  }

  const presentationRows = await db.query.presentations.findMany({
    where: inArray(presentations.id, ids),
    with: {
      product: {
        columns: { id: true, name: true, slug: true, isActive: true },
      },
      quantityDiscounts: {
        where: eq(quantityDiscounts.isActive, true),
        orderBy: [desc(quantityDiscounts.minQuantity)],
        columns: { id: true, minQuantity: true, percent: true },
      },
      couponAssignments: {
        where: eq(couponAssignments.isActive, true),
        columns: { id: true, couponId: true, percent: true },
      },
    },
  });

  const foundIds = new Set(presentationRows.map((p) => p.id));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    throw new NotFoundError(
      `Presentation(s) not found: ${missing.join(', ')}`,
    );
  }

  const presentationById = new Map(presentationRows.map((p) => [p.id, p]));

  // --- Cupones ---
  const warnings: string[] = [];
  const couponRows =
    input.coupons.length > 0
      ? await db.query.coupons.findMany({
          where: inArray(coupons.code, input.coupons),
          with: {
            assignments: {
              where: eq(couponAssignments.isActive, true),
              columns: {
                id: true,
                couponId: true,
                presentationId: true,
                percent: true,
              },
            },
          },
        })
      : [];

  const foundCodes = new Set(couponRows.map((c) => c.code));
  for (const code of input.coupons) {
    if (!foundCodes.has(code)) {
      warnings.push(`Cupón "${code}" no existe.`);
    }
  }

  const appliedByPresentation = new Map<number, AppliedCoupon>();
  const now = new Date();

  for (const coupon of couponRows) {
    const validity = isCouponCurrentlyValid(coupon, now);
    if (!validity.valid) {
      warnings.push(`Cupón "${coupon.code}" ignorado: ${validity.reason}.`);
      continue;
    }

    let matchedAny = false;
    for (const item of input.items) {
      const assignment = coupon.assignments.find(
        (a) => a.presentationId === item.presentationId,
      );
      if (!assignment) continue;

      const existing = appliedByPresentation.get(item.presentationId);
      if (existing) {
        if (assignment.percent > existing.percent) {
          appliedByPresentation.set(item.presentationId, {
            code: coupon.code,
            percent: assignment.percent,
            couponId: coupon.id,
          });
          warnings.push(
            `Se aplicó "${coupon.code}" en lugar de "${existing.code}" por mejor descuento.`,
          );
        } else {
          warnings.push(
            `Cupón "${coupon.code}" ignorado en un ítem: "${existing.code}" ya aplica con mejor descuento.`,
          );
        }
      } else {
        appliedByPresentation.set(item.presentationId, {
          code: coupon.code,
          percent: assignment.percent,
          couponId: coupon.id,
        });
      }
      matchedAny = true;
    }

    if (!matchedAny) {
      warnings.push(
        `Cupón "${coupon.code}" no aplica a ningún producto del carrito.`,
      );
    }
  }

  // --- Cálculo por ítem ---
  const resultItems: QuoteItemResult[] = [];
  let subtotalCents = 0;
  let totalQuantityDiscountCents = 0;
  let totalCouponDiscountCents = 0;

  for (const item of input.items) {
    const presentation = presentationById.get(item.presentationId)!;

    if (!presentation.isActive) {
      throw new ConflictError(
        `Presentation ${presentation.id} is not available`,
      );
    }
    if (!presentation.product.isActive) {
      throw new ConflictError(
        `Product "${presentation.product.name}" is not available`,
      );
    }

    const available = presentation.stock - presentation.stockReserved;
    if (available < item.quantity) {
      throw new ConflictError(
        `Stock insuficiente para "${presentation.product.name} · ${presentation.type}". Disponible: ${available}, pedido: ${item.quantity}.`,
      );
    }

    const unitPriceCents = presentation.priceCents;
    const lineSubtotalCents = unitPriceCents * item.quantity;

    const discount = pickQuantityDiscount(
      presentation.quantityDiscounts,
      item.quantity,
    );
    const quantityDiscountPercent = discount ? discount.percent : null;
    const quantityDiscountCents = discount
      ? applyPercent(lineSubtotalCents, discount.percent)
      : 0;

    const afterQuantity = lineSubtotalCents - quantityDiscountCents;

    const appliedCoupon = appliedByPresentation.get(item.presentationId);
    const couponPercent = appliedCoupon ? appliedCoupon.percent : null;
    const couponDiscountCents = appliedCoupon
      ? applyPercent(afterQuantity, appliedCoupon.percent)
      : 0;

    const lineTotalCents = afterQuantity - couponDiscountCents;

    subtotalCents += lineSubtotalCents;
    totalQuantityDiscountCents += quantityDiscountCents;
    totalCouponDiscountCents += couponDiscountCents;

    resultItems.push({
      presentationId: presentation.id,
      productId: presentation.product.id,
      productName: presentation.product.name,
      productSlug: presentation.product.slug,
      presentationType: presentation.type,
      unitPriceCents,
      quantity: item.quantity,
      lineSubtotalCents,
      quantityDiscountPercent,
      quantityDiscountCents,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      couponPercent,
      couponDiscountCents,
      lineTotalCents,
    });
  }

  const totalCents =
    subtotalCents - totalQuantityDiscountCents - totalCouponDiscountCents;

  // --- Envío ---
  let shipping: QuoteResult['shipping'] = {
    department: null,
    departmentName: null,
    isFree: false,
    label: SHIPPING_COST_LABEL,
  };
  if (input.shippingDepartment) {
    const dept = findDepartment(input.shippingDepartment);
    if (!dept) {
      warnings.push(
        `Departamento "${input.shippingDepartment}" no reconocido.`,
      );
    } else {
      shipping = {
        department: dept.slug,
        departmentName: dept.name,
        isFree: dept.isFree,
        label: SHIPPING_COST_LABEL,
      };
    }
  }

  return {
    items: resultItems,
    subtotalCents,
    quantityDiscountCents: totalQuantityDiscountCents,
    couponDiscountCents: totalCouponDiscountCents,
    totalCents,
    shipping,
    warnings,
  };
}