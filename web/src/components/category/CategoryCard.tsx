import { Link } from 'react-router-dom';
import { getCategoryIcon } from '@/lib/categoryIcons';
import type { Category } from '@/api/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = getCategoryIcon(category.slug);

  return (
    <Link
      to={`/categorias/${category.slug}`}
      className="flex flex-col items-center gap-2 group"
    >
      <div className="w-full aspect-square rounded-xl bg-brand-50 flex items-center justify-center overflow-hidden transition-transform group-active:scale-95">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Icon className="w-8 h-8 text-brand" />
        )}
      </div>
      <span className="text-[11px] font-medium text-slate-700 text-center leading-tight line-clamp-2">
        {category.name}
      </span>
    </Link>
  );
}