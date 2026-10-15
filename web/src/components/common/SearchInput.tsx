import { useState, type FormEvent } from 'react';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { cn } from '@/lib/cn';

interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  defaultValue = '',
  placeholder = 'Buscar productos...',
  onSubmit,
  className,
  autoFocus,
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('relative w-full', className)}
      role="search"
    >
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full h-11 pl-4 pr-12 rounded-lg border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center rounded-r-lg bg-brand text-white"
        aria-label="Buscar"
      >
        <HiOutlineMagnifyingGlass className="w-5 h-5" />
      </button>
    </form>
  );
}