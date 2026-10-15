import { useState } from 'react';
import { cn } from '@/lib/cn';
import { FALLBACK_PRODUCT_IMAGE } from '@/lib/constants';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function ProductImage({
  src,
  alt,
  className,
  loading = 'lazy',
}: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? FALLBACK_PRODUCT_IMAGE : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      onError={() => setErrored(true)}
      loading={loading}
      className={cn('object-cover bg-slate-100', className)}
    />
  );
}