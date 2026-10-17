import { useRef, useState } from 'react';
import {
  HiOutlineArrowUpTray,
  HiOutlinePhoto,
  HiOutlineTrash,
  HiXMark,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { compressImage, getUploadConfig, uploadToCloudinary } from '@/api/admin/uploads';
import { useCreateImage, useDeleteImage } from '@/hooks/mutations/useProductImageMutations';
import { ProductImage } from '@/components/common/ProductImage';
import { cn } from '@/lib/cn';
import type { ProductImage as ProductImageType } from '@/api/types';

interface ImageUploaderProps {
  productId: number;
  images: ProductImageType[];
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUploader({ productId, images }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ProductImageType | null>(
    null,
  );

  const createImage = useCreateImage(productId);
  const deleteImage = useDeleteImage(productId);

  const handleFiles = async (files: FileList | null) => {
  if (!files || files.length === 0) return;

  setUploading(true);
  const errors: string[] = [];

  try {
    const config = await getUploadConfig();

    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) {
        errors.push(`${file.name}: formato no soportado`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        errors.push(`${file.name}: supera los 5 MB`);
        continue;
      }

      try {
        const compressed = await compressImage(file);
        const uploaded = await uploadToCloudinary(compressed, config);
        await createImage.mutateAsync({
          url: uploaded.secureUrl,
          publicId: uploaded.publicId,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'error desconocido';
        errors.push(`${file.name}: ${msg}`);
      }
    }

    const uploadedCount = files.length - errors.length;

    if (uploadedCount > 0) {
      toast.success(
        uploadedCount === 1
          ? 'Imagen agregada'
          : `${uploadedCount} imágenes agregadas`,
      );
    }
    for (const e of errors) {
      toast.error(e);
    }
  } finally {
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }
};

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteImage.mutateAsync(confirmDelete.id);
      toast.success('Imagen eliminada');
      setConfirmDelete(null);
    } catch {
      toast.error('No se pudo eliminar');
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Fotos</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          La primera foto es la que se muestra en el listado.
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200"
            >
              <ProductImage
                src={img.urlThumb ?? img.url}
                alt={img.alt ?? ''}
                className="w-full h-full"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 text-[10px] font-bold rounded bg-brand text-white px-1.5 py-0.5">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(img)}
                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-sm active:bg-rose-100"
                aria-label="Eliminar imagen"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 flex flex-col items-center text-center">
          <HiOutlinePhoto className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-xs text-slate-500">
            Todavía no hay fotos cargadas.
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'w-full h-11 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 border-2 border-dashed transition-colors',
          uploading
            ? 'border-slate-200 text-slate-400 cursor-not-allowed'
            : 'border-brand-200 text-brand bg-brand-50/40 active:bg-brand-50',
        )}
      >
        <HiOutlineArrowUpTray className="w-4 h-4" />
        {uploading ? 'Subiendo...' : 'Agregar fotos'}
      </button>

      <p className="text-[11px] text-slate-400 text-center">
        JPG, PNG o WebP · máximo 5 MB por imagen
      </p>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5">
            <p className="text-sm font-bold text-slate-900">¿Eliminar foto?</p>
            <p className="text-xs text-slate-500 mt-1">
              Se elimina de Cloudinary y de este producto.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-10 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700"
              >
                No
              </button>
              <button
                type="button"
                disabled={deleteImage.isPending}
                onClick={handleDelete}
                className="flex-1 h-10 rounded-lg bg-rose-600 text-white text-sm font-semibold active:bg-rose-700 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                <HiOutlineTrash className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}