import { env } from '../../config/env.js';

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'limit';
}

function buildUrl(publicId: string, transform: string): string {
  return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${transform}/${publicId}`;
}

export function buildThumbUrl(
  publicId: string,
  opts: CloudinaryTransformOptions = {},
): string {
  const parts = ['q_auto', 'f_auto'];
  parts.push(`w_${opts.width ?? 400}`);
  if (opts.height) parts.push(`h_${opts.height}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  return buildUrl(publicId, parts.join(','));
}

export function buildFullUrl(
  publicId: string,
  opts: CloudinaryTransformOptions = {},
): string {
  const parts = ['q_auto', 'f_auto'];
  parts.push(`w_${opts.width ?? 1200}`);
  if (opts.height) parts.push(`h_${opts.height}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  return buildUrl(publicId, parts.join(','));
}