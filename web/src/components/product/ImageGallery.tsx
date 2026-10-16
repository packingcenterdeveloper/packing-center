import { useRef, useState } from 'react';
import { ProductImage } from '@/components/common/ProductImage';
import { cn } from '@/lib/cn';
import type { ProductImage as ProductImageType } from '@/api/types';

interface ImageGalleryProps {
  images: ProductImageType[] | undefined;
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const list = images && images.length > 0 ? images : [null];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const goTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {list.map((img, i) => (
          <div
            key={img?.id ?? `ph-${i}`}
            className="snap-center shrink-0 w-full aspect-square bg-white"
          >
            <ProductImage
              src={img?.urlFull ?? img?.url}
              alt={alt}
              className="w-full h-full"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {list.length > 1 && (
        <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver imagen ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'h-1.5 rounded-full transition-all pointer-events-auto',
                i === activeIndex
                  ? 'w-5 bg-slate-900'
                  : 'w-1.5 bg-slate-900/30',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}