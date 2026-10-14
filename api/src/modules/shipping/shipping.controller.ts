import type { Request, Response } from 'express';
import { SHIPPING_COST_LABEL, SHIPPING_DEPARTMENTS } from './shipping.data.js';

export async function listDepartments(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json({
    data: {
      departments: SHIPPING_DEPARTMENTS,
      costLabel: SHIPPING_COST_LABEL,
    },
  });
}