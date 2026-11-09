import { COUNTRY_NAMES } from '../data/config';

export default function CountryTabs({ selectedCountry, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {['all', ...COUNTRY_NAMES].map(c => (
        <button key={c} onClick={() => onSelect(c)} className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition border ${selectedCountry === c ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-500'}`}>
          {c === 'all' ? '🌍 Все направления' : c}
        </button>
      ))}
    </div>
  );
}
