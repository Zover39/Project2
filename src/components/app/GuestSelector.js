import { Minus, Plus, Users } from 'lucide-react';

const guestLabel = count => {
  const remainder = count % 100;
  const lastDigit = count % 10;
  if (remainder < 11 || remainder > 14) {
    if (lastDigit === 1) return 'гость';
    if (lastDigit >= 2 && lastDigit <= 4) return 'гостя';
  }
  return 'гостей';
};

export default function GuestSelector({ adults, children, onChange, className = '' }) {
  const total = adults + children;
  const updateAdults = nextAdults => onChange(nextAdults, children);
  const updateChildren = nextChildren => onChange(adults, nextChildren);

  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${className}`} aria-label="Количество гостей">
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
        <span className="font-semibold">Взрослые</span>
        <button
          type="button"
          aria-label="Уменьшить взрослых"
          disabled={adults <= 1}
          onClick={() => updateAdults(Math.max(1, adults - 1))}
          className="rounded-full border border-slate-200 p-1 disabled:opacity-40 dark:border-slate-700"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-4 text-center font-bold" aria-live="polite">{adults}</span>
        <button
          type="button"
          aria-label="Добавить взрослого"
          disabled={total >= 5}
          onClick={() => updateAdults(adults + 1)}
          className="rounded-full border border-slate-200 p-1 disabled:opacity-40 dark:border-slate-700"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">Дети</span>
        <button
          type="button"
          aria-label="Уменьшить детей"
          disabled={children <= 0}
          onClick={() => updateChildren(children - 1)}
          className="rounded-full border border-slate-200 p-1 disabled:opacity-40 dark:border-slate-700"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-4 text-center font-bold" aria-live="polite">{children}</span>
        <button
          type="button"
          aria-label="Добавить ребёнка"
          disabled={total >= 5}
          onClick={() => updateChildren(children + 1)}
          className="rounded-full border border-slate-200 p-1 disabled:opacity-40 dark:border-slate-700"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <span className="text-xs text-slate-500">Всего: {total} {guestLabel(total)}</span>
    </div>
  );
}
