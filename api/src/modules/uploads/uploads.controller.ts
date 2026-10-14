import type { Request, Response } from 'express';
import { env } from '../../config/env.js';

export async function getConfig(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json({
    data: {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: env.CLOUDINARY_UPLOAD_PRESET,
      folder: env.CLOUDINARY_UPLOAD_FOLDER,
      maxBytes: 5 * 1024 * 1024,
      acceptedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  });
}