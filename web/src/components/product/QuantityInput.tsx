import { HiMinus, HiPlus } from 'react-icons/hi2';
import { cn } from '@/lib/cn';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 9999,
  className,
}: QuantityInputProps) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const decrement = () => onChange(clamp(value - 1));
  const increment = () => onChange(clamp(value + 1));

  const handleInput = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      onChange(min);
      return;
    }
    onChange(clamp(parsed));
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-slate-200 bg-white',
        className,
      )}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        aria-label="Restar"
        className={cn(
          'w-10 h-10 flex items-center justify-center text-slate-600 rounded-l-lg transition-colors',
          value <= min
            ? 'text-slate-300 cursor-not-allowed'
            : 'active:bg-slate-100',
        )}
      >
        <HiMinus className="w-4 h-4" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        className="w-12 h-10 text-center text-sm font-semibold text-slate-900 focus:outline-none bg-transparent"
      />

      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        aria-label="Sumar"
        className={cn(
          'w-10 h-10 flex items-center justify-center text-slate-600 rounded-r-lg transition-colors',
          value >= max
            ? 'text-slate-300 cursor-not-allowed'
            : 'active:bg-slate-100',
        )}
      >
        <HiPlus className="w-4 h-4" />
      </button>
    </div>
  );
}