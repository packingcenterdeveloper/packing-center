import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../config/turso.js';
import {
  inventoryMovements,
  presentations,
  type InventoryMovementType,
} from '../../db/schema/index.js';
import {
  ConflictError,
  NotFoundError,
} from '../../shared/errors/httpErrors.js';

interface MovementContext {
  presentationId: number;
  orderId: string | null;
  quantity: number;
  note?: string;
}

interface StockState {
  stock: number;
  stockReserved: number;
}

async function applyMovement(
  type: InventoryMovementType,
  ctx: MovementContext,
  compute: (current: StockState) => StockState,
): Promise<void> {
  const presentation = await db.query.presentations.findFirst({
    where: eq(presentations.id, ctx.presentationId),
    columns: { id: true, stock: true, stockReserved: true },
  });
  if (!presentation) {
    throw new NotFoundError(`Presentation ${ctx.presentationId} not found`);
  }

  const stockBefore = presentation.stock;
  const stockReservedBefore = presentation.stockReserved;
  const next = compute({
    stock: stockBefore,
    stockReserved: stockReservedBefore,
  });

  if (next.stock < 0 || next.stockReserved < 0) {
    throw new ConflictError(
      `Inventory operation would result in negative values for presentation ${ctx.presentationId}`,
    );
  }

  await db
    .update(presentations)
    .set({ stock: next.stock, stockReserved: next.stockReserved })
    .where(eq(presentations.id, ctx.presentationId));

  await db.insert(inventoryMovements).values({
    id: randomUUID(),
    presentationId: ctx.presentationId,
    orderId: ctx.orderId,
    type,
    quantity: ctx.quantity,
    stockBefore,
    stockAfter: next.stock,
    stockReservedBefore,
    stockReservedAfter: next.stockReserved,
    note: ctx.note,
  });
}

export async function reserve(ctx: MovementContext): Promise<void> {
  await applyMovement('reservation', ctx, ({ stock, stockReserved }) => {
    if (stock - stockReserved < ctx.quantity) {
      throw new ConflictError(
        `Insufficient stock for presentation ${ctx.presentationId}`,
      );
    }
    return { stock, stockReserved: stockReserved + ctx.quantity };
  });
}

export async function releaseReservation(
  ctx: MovementContext,
): Promise<void> {
  await applyMovement(
    'reservation_release',
    ctx,
    ({ stock, stockReserved }) => ({
      stock,
      stockReserved: Math.max(0, stockReserved - ctx.quantity),
    }),
  );
}

export async function consumeReservation(
  ctx: MovementContext,
): Promise<void> {
  await applyMovement('sale', ctx, ({ stock, stockReserved }) => ({
    stock: stock - ctx.quantity,
    stockReserved: Math.max(0, stockReserved - ctx.quantity),
  }));
}

export async function restoreAfterSaleReversal(
  ctx: MovementContext,
): Promise<void> {
  await applyMovement('sale_reversal', ctx, ({ stock, stockReserved }) => ({
    stock: stock + ctx.quantity,
    stockReserved,
  }));
}