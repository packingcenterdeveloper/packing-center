import type { Request, Response } from 'express';
import { logger } from '../../config/logger.js';
import * as service from './payments.service.js';

/**
 * Endpoint público del webhook de Mercado Pago.
 *
 * MP hace un POST con un body tipo:
 *   { id, live_mode, type, action, data: { id } }
 *
 * El header `x-signature` y `x-request-id` vienen en los headers.
 * El `data.id` también puede venir en `?data.id=` como query param.
 *
 * Siempre respondemos 200 OK (aunque falle internamente) para evitar
 * que MP reintente indefinidamente. Los errores se loggean.
 */
export async function webhook(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.processWebhook({
      signatureHeader:
        (req.headers['x-signature'] as string | undefined) ?? null,
      requestId:
        (req.headers['x-request-id'] as string | undefined) ?? null,
      body: req.body ?? {},
      queryDataId:
        typeof req.query['data.id'] === 'string'
          ? (req.query['data.id'] as string)
          : undefined,
    });

    logger.info(
      { result, type: req.body?.type, action: req.body?.action },
      'MP webhook processed',
    );

    res.status(200).json({ received: true });
  } catch (err) {
    logger.error({ err }, 'Error processing MP webhook');
    res.status(200).json({ received: true, error: 'logged' });
  }
}