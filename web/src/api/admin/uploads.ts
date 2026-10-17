import imageCompression from 'browser-image-compression';
import { api } from '../client';
import type { ApiResponse, UploadConfig } from '../types';

export async function getUploadConfig(): Promise<UploadConfig> {
  const { data } = await api.get<ApiResponse<UploadConfig>>(
    '/api/v1/uploads/config',
  );
  return data.data;
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

/**
 * Comprime una imagen antes de subirla. Convierte a WebP, limita a 1 MB
 * y a 1600px de lado más largo. Usa worker para no bloquear la UI.
 */
export async function compressImage(file: File): Promise<File> {
  // No recomprimimos si ya es muy chica, para no perder calidad sin motivo.
  if (file.size < 200 * 1024 && file.type === 'image/webp') {
    return file;
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  });

  // browser-image-compression devuelve un File con el mismo nombre
  // pero sin extensión .webp si el fileType cambió. Lo normalizamos.
  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([compressed], `${baseName}.webp`, {
    type: 'image/webp',
  });
}

/**
 * Sube un archivo ya comprimido a Cloudinary usando el preset unsigned.
 */
export async function uploadToCloudinary(
  file: File,
  config: UploadConfig,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  formData.append('folder', config.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const data = (await response.json()) as CloudinaryResponse;

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
}