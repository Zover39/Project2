import { useApp } from '../context/AppContext';
import { C, HOTELS, minPrice } from '../data/countries';
import Img from './Img';
import HotelCard from './HotelCard';

const cheapest = (c) => Math.min(...c.h.map(minPrice));

function Hero() {
  const { q, setQ, go, money } = useApp();
  return (
    <section className="hero">
      <div>
        <h1>Туры из Астаны за пару минут</h1>
        <p>Выберите страну, отель и класс перелёта — цена пересчитается сразу. Оплата через Kaspi.</p>
        <div className="search" role="search">
          <input type="search" placeholder="Страна, город или отель" aria-label="Поиск" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="board">
        <h3>Вылеты из NQZ</h3>
        {C.map((c) => (
          <button key={c.id} className="row" onClick={() => go('home', c.id)}>
            <b>{c.n}</b>
            <span>{c.fl.split(',')[1]}</span>
            <em>{money(cheapest(c))}</em>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { q, go, money } = useApp();
  const query = q.trim().toLowerCase();

  if (query) {
    const hs = HOTELS.filter((h) =>
      (h.name + h.beach + C.find((c) => c.id === h.cid).n + C.find((c) => c.id === h.cid).sub).toLowerCase().includes(query)
    );
    return (
      <>
        <Hero />
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>Найдено: {hs.length}</h2>
        {hs.length ? (
          <div className="grid">{hs.map((h) => <HotelCard key={h.id} h={h} />)}</div>
        ) : (
          <div className="empty">Ничего не найдено по запросу «{q}». Попробуйте «Дубай», «Бали» или «Rixos».</div>
        )}
      </>
    );
  }

  return (
    <>
      <Hero />
      <h2 style={{ marginBottom: 16, fontSize: 20 }}>Направления из Астаны</h2>
      <div className="grid">
        {C.map((c) => (
          <article key={c.id} className="card click" onClick={() => go('home', c.id)}>
            <div className="ph">
              <Img id={c.img} alt={c.n} />
              <span className="tag">{c.h.length} отеля</span>
            </div>
            <div className="body">
              <h3>{c.n}</h3>
              <p className="mute">{c.sub}</p>
              <p className="mute">{c.d}</p>
              <p style={{ marginTop: 'auto' }} className="mute">✈ {c.fl}</p>
              <div className="price">от {money(cheapest(c))}</div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
