import type { Order, OrderItem } from '../../db/schema/index.js';

function formatCents(cents: number): string {
  return `$ ${(cents / 100).toFixed(2)} UYU`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderOrderAdminEmail(
  order: Order,
  items: OrderItem[],
): RenderedEmail {
  const rows = items
    .map((item) => {
      const lines: string[] = [];
      lines.push(
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${escapeHtml(item.productName)} · ${escapeHtml(item.presentationType)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${item.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${formatCents(item.unitPriceCents)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${formatCents(item.lineTotalCents)}</td>
        </tr>`,
      );
      return lines.join('');
    })
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:640px;margin:0 auto;">
      <h1 style="font-size:20px;">Nuevo pedido ${escapeHtml(order.orderNumber)}</h1>
      <p style="color:#666;">Pedido creado el ${order.createdAt.toLocaleString('es-UY')}</p>

      <h2 style="font-size:16px;margin-top:24px;">Cliente</h2>
      <p>
        <strong>${escapeHtml(order.customerName)}</strong><br/>
        Teléfono: ${escapeHtml(order.customerPhone)}<br/>
        ${order.customerEmail ? `Email: ${escapeHtml(order.customerEmail)}<br/>` : ''}
        ${order.customerAddress ? `Dirección: ${escapeHtml(order.customerAddress)}<br/>` : ''}
        ${order.customerCity ? `Ciudad: ${escapeHtml(order.customerCity)}<br/>` : ''}
        ${order.shippingDepartment ? `Departamento: ${escapeHtml(order.shippingDepartment)}<br/>` : ''}
      </p>

      ${order.customerNotes ? `<p><strong>Notas:</strong> ${escapeHtml(order.customerNotes)}</p>` : ''}

      <h2 style="font-size:16px;margin-top:24px;">Productos</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:6px 8px;text-align:left;">Producto</th>
            <th style="padding:6px 8px;text-align:right;">Cant.</th>
            <th style="padding:6px 8px;text-align:right;">Precio</th>
            <th style="padding:6px 8px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <h2 style="font-size:16px;margin-top:24px;">Totales</h2>
      <p>
        Subtotal: ${formatCents(order.subtotalCents)}<br/>
        Descuentos: -${formatCents(order.discountCents)}<br/>
        <strong>Total: ${formatCents(order.totalCents)}</strong>
      </p>

      <p style="margin-top:16px;">
        Método de pago: <strong>${escapeHtml(order.paymentMethod ?? 'no especificado')}</strong><br/>
        Estado: <strong>${escapeHtml(order.status)}</strong>
      </p>

      <p style="margin-top:24px;color:#666;font-size:12px;">
        Envío: ${escapeHtml(order.shippingCostLabel ?? '')}
      </p>
    </div>
  `;

  const text = [
    `Nuevo pedido ${order.orderNumber}`,
    `Cliente: ${order.customerName} (${order.customerPhone})`,
    `Total: ${formatCents(order.totalCents)}`,
    `Método de pago: ${order.paymentMethod ?? 'no especificado'}`,
  ].join('\n');

  return {
    subject: `[PackingCenter] Nuevo pedido ${order.orderNumber}`,
    html,
    text,
  };
}

export function renderOrderClientEmail(
  order: Order,
  items: OrderItem[],
): RenderedEmail {
  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${escapeHtml(item.productName)} · ${escapeHtml(item.presentationType)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${item.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${formatCents(item.lineTotalCents)}</td>
        </tr>`,
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:640px;margin:0 auto;">
      <h1 style="font-size:20px;">¡Gracias por tu compra!</h1>
      <p>Recibimos tu pedido <strong>${escapeHtml(order.orderNumber)}</strong> y lo estamos preparando.</p>

      <h2 style="font-size:16px;margin-top:24px;">Tu pedido</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:6px 8px;text-align:left;">Producto</th>
            <th style="padding:6px 8px;text-align:right;">Cant.</th>
            <th style="padding:6px 8px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p style="margin-top:16px;">
        <strong>Total: ${formatCents(order.totalCents)}</strong>
      </p>

      <p style="margin-top:16px;color:#666;">
        ${escapeHtml(order.shippingCostLabel ?? '')}
      </p>

      <p style="margin-top:24px;color:#666;font-size:12px;">
        Si tenés alguna duda, respondé este mail o contactanos.
      </p>
    </div>
  `;

  const text = [
    `¡Gracias por tu compra!`,
    `Pedido: ${order.orderNumber}`,
    `Total: ${formatCents(order.totalCents)}`,
  ].join('\n');

  return {
    subject: `[PackingCenter] Confirmación de pedido ${order.orderNumber}`,
    html,
    text,
  };
}
