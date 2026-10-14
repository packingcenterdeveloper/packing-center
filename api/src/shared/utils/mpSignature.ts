import { createHmac, timingSafeEqual } from 'node:crypto';

export interface VerifySignatureInput {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string;
  secret: string;
}

export interface VerifySignatureResult {
  valid: boolean;
  reason?: string;
}

/**
 * Valida el header `x-signature` de Mercado Pago (Webhooks v2).
 *
 * Formato del header: `ts=NNNNNNNN,v1=HEXSIGNATURE`.
 * Manifest firmado: `id:{dataId};request-id:{requestId};ts:{ts};`
 * Algoritmo: HMAC-SHA256 con el webhook secret del panel de MP.
 *
 * Si `requestId` viene null, MP omite el segmento `request-id` del manifest.
 */
export function verifyMpSignature(
  input: VerifySignatureInput,
  ): VerifySignatureResult {
  const { signatureHeader, requestId, dataId, secret } = input;

  if (!signatureHeader) {
    return { valid: false, reason: 'Missing x-signature header' };
  }

  const parts = Object.fromEntries(
    signatureHeader
    .split(',')
    .map((segment) => {
      const idx = segment.indexOf('=');
      if (idx === -1) return ['', ''] as const;
      return [
        segment.slice(0, idx).trim(),
        segment.slice(idx + 1).trim(),
      ] as const;
    })
    .filter(([k]) => k.length > 0),
    );

  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1) {
    return { valid: false, reason: 'Malformed x-signature header' };
  }

  // MP normaliza el data.id a minúsculas en el manifest.
  const normalizedId = dataId.toLowerCase();

  const manifest = requestId
  ? `id:${normalizedId};request-id:${requestId};ts:${ts};`
  : `id:${normalizedId};ts:${ts};`;

  const expected = createHmac('sha256', secret)
  .update(manifest)
  .digest('hex');

  // Comparación en tiempo constante para evitar timing attacks.
  const expectedBuf = Buffer.from(expected, 'hex');
  const receivedBuf = Buffer.from(v1, 'hex');

  if (expectedBuf.length !== receivedBuf.length) {
    return { valid: false, reason: 'Signature length mismatch' };
  }

  if (!timingSafeEqual(expectedBuf, receivedBuf)) {
    return { valid: false, reason: 'Signature mismatch' };
  }

  return { valid: true };
}