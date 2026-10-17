import { toPng } from 'html-to-image';

export interface DownloadOptions {
  pixelRatio?: number;
  backgroundColor?: string;
}

/**
 * Captura un nodo del DOM y dispara la descarga como PNG.
 * El nodo tiene que estar visible en el documento (no display:none).
 */
export async function downloadNodeAsPng(
  node: HTMLElement,
  filename: string,
  options: DownloadOptions = {},
): Promise<void> {
  const dataUrl = await toPng(node, {
    pixelRatio: options.pixelRatio ?? 2,
    backgroundColor: options.backgroundColor ?? '#ffffff',
    cacheBust: true,
    // Evita problemas con fuentes externas que no terminan de cargar
    skipFonts: true,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Nombre de archivo estándar para un pedido.
 */
export function orderImageFilename(orderNumber: string): string {
  // PC-2026-000123 → pedido-PC-2026-000123.png
  const safe = orderNumber.replace(/[^a-zA-Z0-9-]/g, '_');
  return `pedido-${safe}.png`;
}