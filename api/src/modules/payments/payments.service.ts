import { verifyMpSignature } from '../../shared/utils/mpSignature.js';
import { randomUUID } from 'node:crypto';
import { Preference } from 'mercadopago';
import { env } from '../../config/env.js';
import { mpClient } from '../../config/mercadoPago.js';
import type { Order, OrderItem } from '../../db/schema/index.js';
import * as repo from './payments.repository.js';
import { Payment } from 'mercadopago';
import { logger } from '../../config/logger.js';
import type { OrderStatus } from '../../db/schema/index.js';
import * as ordersService from '../orders/orders.service.js';
import * as ordersRepo from '../orders/orders.repository.js';


export interface PreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: 'UYU';
}

export interface CreatePreferenceInput {
  order: Order;
  items: OrderItem[];
}

export interface PreferenceResult {
  paymentId: string;
  mpPreferenceId: string;
  initPoint: string;
  sandboxInitPoint: string | null;
}

export async function createPreferenceForOrder(
  input: CreatePreferenceInput,
  ): Promise<PreferenceResult> {
  const { order, items } = input;

  const mpItems: PreferenceItem[] = items.map((item) => ({
    id: item.id,
    title: `${item.productName} · ${item.presentationType}`,
    quantity: item.quantity,
    unit_price: item.lineTotalCents / 100,
    currency_id: 'UYU',
  }));

  const preference = new Preference(mpClient);

  const result = await preference.create({
    body: {
      items: mpItems,
      external_reference: order.id,
      back_urls: {
        success: env.MP_BACK_URL_SUCCESS,
        failure: env.MP_BACK_URL_FAILURE,
        pending: env.MP_BACK_URL_PENDING,
      },
      auto_return: 'approved',
      notification_url: `${env.API_URL}/api/v1/payments/webhook`,
      statement_descriptor: 'PACKINGCENTER',
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
      },
    },
  });

  const paymentId = randomUUID();

  await repo.create({
    id: paymentId,
    orderId: order.id,
    provider: 'mercadopago',
    mpPreferenceId: result.id ?? null,
    amountCents: order.totalCents,
  });

  return {
    paymentId,
    mpPreferenceId: result.id ?? '',
    initPoint: result.init_point ?? '',
    sandboxInitPoint: result.sandbox_init_point ?? null,
  };
}

export interface WebhookInput {
  signatureHeader: string | null;
  requestId: string | null;
  body: MpWebhookBody;
  queryDataId?: string;
}

export interface MpWebhookBody {
  id?: number | string;
  live_mode?: boolean;
  type?: string;
  date_created?: string;
  action?: string;
  data?: { id?: string | number };
}

function mapMpStatusToOrderStatus(
  mpStatus: string | null,
  ): 'paid' | 'pending' | 'cancelled' | null {
  if (!mpStatus) return null;
  if (mpStatus === 'approved') return 'paid';
  if (mpStatus === 'rejected' || mpStatus === 'cancelled') return 'cancelled';
  return 'pending';
}

export interface WebhookResult {
  handled: boolean;
  reason: string;
  orderId?: string;
  mpPaymentId?: string;
}

export async function processWebhook(
  input: WebhookInput,
  ): Promise<WebhookResult> {
  const dataId = String(
    input.queryDataId ?? input.body.data?.id ?? '',
    );
  if (!dataId) {
    return { handled: false, reason: 'No data.id in notification' };
  }

  const signature = verifyMpSignature({
    signatureHeader: input.signatureHeader,
    requestId: input.requestId,
    dataId,
    secret: env.MP_WEBHOOK_SECRET,
  });

  if (!signature.valid) {
    logger.warn({ dataId, reason: signature.reason }, 'MP webhook rejected');
    return { handled: false, reason: `Signature invalid: ${signature.reason}` };
  }

  // Idempotencia: si ya procesamos este mp_payment_id, no hacemos nada.
  const existing = await repo.findByMpPaymentId(dataId);
  if (existing) {
    return {
      handled: true,
      reason: 'Already processed',
      orderId: existing.orderId,
      mpPaymentId: dataId,
    };
  }

  // Consultar el pago real a MP.
  const paymentClient = new Payment(mpClient);
  let mpPayment;
  try {
    mpPayment = await paymentClient.get({ id: dataId });
  } catch (err) {
    logger.error({ err, dataId }, 'Failed to fetch MP payment');
    return { handled: false, reason: 'Could not fetch payment from MP' };
  }

  const externalReference = mpPayment.external_reference;
  if (!externalReference) {
    return { handled: false, reason: 'Payment has no external_reference' };
  }

  const order = await ordersRepo.findById(externalReference);
  if (!order) {
    return { handled: false, reason: `Order ${externalReference} not found` };
  }

  // Guardar datos del pago en la tabla payments.
  const paymentRecord = await repo.findByOrderId(order.id);
  if (paymentRecord) {
    await repo.update(paymentRecord.id, {
      mpPaymentId: dataId,
      mpStatus: mpPayment.status ?? null,
      mpStatusDetail: mpPayment.status_detail ?? null,
      rawPayload: mpPayment as unknown as Record<string, unknown>,
    });
  } else {
    await repo.create({
      id: randomUUID(),
      orderId: order.id,
      provider: 'mercadopago',
      mpPaymentId: dataId,
      mpStatus: mpPayment.status ?? null,
      mpStatusDetail: mpPayment.status_detail ?? null,
      amountCents: Math.round((mpPayment.transaction_amount ?? 0) * 100),
      rawPayload: mpPayment as unknown as Record<string, unknown>,
    });
  }

  // Actualizar estado del pedido según el pago.
  const nextStatus = mapMpStatusToOrderStatus(mpPayment.status ?? null);

  if (nextStatus === 'paid' && order.status === 'pending') {
    await ordersService.updateStatus(order.id, {
      status: 'paid',
      note: `Pago aprobado (MP ${dataId})`,
    });
  } else if (nextStatus === 'cancelled' && order.status === 'pending') {
    await ordersService.cancel(order.id, `Pago ${mpPayment.status} (MP ${dataId})`);
  } else if (nextStatus === 'pending') {
    // Sigue pendiente, no hacemos nada por ahora.
  }

  return {
    handled: true,
    reason: 'Processed',
    orderId: order.id,
    mpPaymentId: dataId,
  };
}