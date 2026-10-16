import { cn } from '@/lib/cn';

interface SubcategoryChipsProps {
  subcategories: string[];
  active: string | null;
  onChange: (subcategory: string | null) => void;
}

export function SubcategoryChips({
  subcategories,
  active,
  onChange,
}: SubcategoryChipsProps) {
  if (subcategories.length === 0) return null;

  const chips = [null, ...subcategories];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 py-1">
      {chips.map((sub) => {
        const isActive = active === sub;
        const key = sub ?? '__all__';
        const label = sub ? capitalize(sub) : 'Todos';

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(sub)}
            className={cn(
              'shrink-0 h-8 px-4 rounded-full text-xs font-semibold transition-colors border',
              isActive
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function capitalize(input: string): string {
  if (!input) return input;
  return input.charAt(0).toUpperCase() + input.slice(1);
}