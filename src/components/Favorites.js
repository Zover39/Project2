import { useApp } from '../context/AppContext';
import { HOTELS } from '../data/countries';
import HotelCard from './HotelCard';

export default function Favorites() {
  const { fav, go } = useApp();
  const hs = HOTELS.filter((h) => fav.includes(h.id));
  return (
    <>
      <h1 style={{ fontSize: 24, margin: '22px 0' }}>Избранное ({hs.length})</h1>
      {hs.length ? (
        <div className="grid">{hs.map((h) => <HotelCard key={h.id} h={h} />)}</div>
      ) : (
        <div className="empty">
          Пока пусто. Нажмите ♡ на карточке отеля, чтобы сохранить его.<br /><br />
          <button className="btn" onClick={() => go('home')}>Смотреть отели</button>
        </div>
      )}
    </>
  );
}
