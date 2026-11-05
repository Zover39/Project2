import { useApp } from '../context/AppContext';
import { minPrice } from '../data/countries';
import Img from './Img';

export default function HotelCard({ h }) {
  const { go, fav, toggleFav, money } = useApp();
  const on = fav.includes(h.id);
  return (
    <article className="card click" onClick={() => go('home', h.cid, h.id)}>
      <div className="ph">
        <Img id={h.img} alt={h.name} />
        <span className="tag">{h.stars} ★</span>
        <button
          className={`fav ${on ? 'on' : ''}`}
          aria-label={on ? 'Убрать из избранного' : 'В избранное'}
          aria-pressed={on}
          onClick={(e) => { e.stopPropagation(); toggleFav(h.id); }}
        >
          {on ? '♥' : '♡'}
        </button>
      </div>
      <div className="body">
        <h3>{h.name}</h3>
        <p className="mute">📍 {h.beach}</p>
        <p className="mute">{h.desc}</p>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
          <div>
            <div className="mute">от</div>
            <div className="price">{money(minPrice(h))}</div>
          </div>
          <span className="mute">7 ночей, 1 чел.</span>
        </div>
      </div>
    </article>
  );
}
