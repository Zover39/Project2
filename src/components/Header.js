import { useApp } from '../context/AppContext';

export default function Header() {
  const { view, go, fav, bk } = useApp();
  const tabs = [
    ['home', 'Главная', null],
    ['favorites', 'Избранное', fav.length],
    ['bookings', 'Мои туры', bk.length],
    ['settings', 'Настройки', null],
  ];
  return (
    <header>
      <div className="wrap">
        <button className="logo" onClick={() => go('home')} aria-label="На главную">
          <i>✈</i>Astana Travel
        </button>
        <nav>
          {tabs.map(([k, label, n]) => (
            <button key={k} className={view === k ? 'on' : ''} onClick={() => go(k)}>
              {label}{n !== null ? ` (${n})` : ''}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
