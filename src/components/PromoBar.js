import { Plane } from 'lucide-react';

export default function PromoBar() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white text-xs sm:text-sm py-2 px-4 text-center font-semibold flex items-center justify-center gap-2 shadow-sm">
      <Plane className="w-4 h-4" />
      <span>Прямые рейсы из Международного аэропорта Астаны (NQZ) в 7+ стран | Рассрочка Kaspi Red 0-0-12</span>
    </div>
  );
}
