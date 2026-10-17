import { api } from '../client';
import type { ApiResponse } from '../types';

export type EmailEventType = 'order_admin' | 'order_client';
export type EmailEventStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export interface EmailEvent {
  id: string;
  orderId: string | null;
  type: EmailEventType;
  toEmail: string;
  subject: string;
  status: EmailEventStatus;
  error: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface ResendResult {
  sent: number;
  failed: number;
  skipped: number;
  total: number;
}

export async function adminListOrderEmails(
  orderId: string,
): Promise<EmailEvent[]> {
  const { data } = await api.get<ApiResponse<EmailEvent[]>>(
    `/api/v1/emails/orders/${orderId}`,
  );
  return data.data;
}

export async function adminResendOrderEmails(
  orderId: string,
): Promise<ResendResult> {
  const { data } = await api.post<ApiResponse<ResendResult>>(
    `/api/v1/emails/orders/${orderId}/resend`,
    {},
  );
  return data.data;
}