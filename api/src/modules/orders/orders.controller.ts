import type { Request, Response } from 'express';
import * as service from './orders.service.js';
import {
  adminListOrdersQuerySchema,
  checkoutBodySchema,
  orderIdParamSchema,
  orderPhoneParamSchema,
  updateStatusBodySchema,
  verifyPhoneQuerySchema,
} from './orders.schemas.js';

export async function checkout(req: Request, res: Response): Promise<void> {
  const body = checkoutBodySchema.parse(req.body);
  const result = await service.checkout(body);
  res.status(201).json({
    data: {
      order: result.order,
      items: result.items,
      initPoint: result.initPoint,
      paymentId: result.paymentId,
    },
  });
}

export async function getOrderForCustomer(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = orderIdParamSchema.parse(req.params);
  const { phone } = verifyPhoneQuerySchema.parse(req.query);
  const data = await service.getByIdForCustomer(id, phone);
  res.json({ data });
}

export async function getOrdersByPhone(
  req: Request,
  res: Response,
): Promise<void> {
  const { phone } = orderPhoneParamSchema.parse(req.params);
  const data = await service.getByPhone(phone);
  res.json({ data });
}

export async function adminListOrders(
  req: Request,
  res: Response,
): Promise<void> {
  const query = adminListOrdersQuerySchema.parse(req.query);
  const result = await service.listForAdmin(query);
  res.json({ data: result.items, meta: result.meta });
}

export async function adminGetOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = orderIdParamSchema.parse(req.params);
  await service.markSeen(id);
  const data = await service.getByIdForAdmin(id);
  res.json({ data });
}

export async function adminUpdateStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = orderIdParamSchema.parse(req.params);
  const body = updateStatusBodySchema.parse(req.body);
  const data = await service.updateStatus(id, body);
  res.json({ data });
}

export async function adminMarkPaid(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = orderIdParamSchema.parse(req.params);
  const data = await service.markPaid(id, 'Pago marcado manualmente');
  res.json({ data });
}

export async function adminCancel(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = orderIdParamSchema.parse(req.params);
  const data = await service.cancel(id);
  res.json({ data });
}

export async function adminDelete(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = orderIdParamSchema.parse(req.params);
  await service.remove(id);
  res.status(204).end();
}

export async function adminDashboard(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await service.dashboardStats();
  res.json({ data });
}