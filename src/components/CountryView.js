import { useApp } from '../context/AppContext';
import { C, minPrice } from '../data/countries';
import HotelCard from './HotelCard';

export default function CountryView() {
  const { cid, go, stars, setStars, sort, setSort } = useApp();
  const c = C.find((x) => x.id === cid);
  let hs = c.h.filter((h) => h.stars >= stars);
  if (sort === 'asc') hs = [...hs].sort((a, b) => minPrice(a) - minPrice(b));
  if (sort === 'desc') hs = [...hs].sort((a, b) => minPrice(b) - minPrice(a));

  return (
    <>
      <button className="back" onClick={() => go('home')}>← Все направления</button>
      <section className="hero" style={{ gridTemplateColumns: '1fr' }}>
        <div>
          <h1>{c.n}</h1>
          <p>{c.d}</p>
          <span style={{ color: '#b9d3e0', fontSize: 13 }}>✈ Астана (NQZ) — {c.fl}</span>
        </div>
      </section>
      <div className="bar">
        <select aria-label="Звёзды" value={stars} onChange={(e) => setStars(+e.target.value)}>
          <option value={0}>Любые звёзды</option>
          <option value={5}>Только 5★</option>
          <option value={4}>4★ и выше</option>
        </select>
        <select aria-label="Сортировка" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="pop">По умолчанию</option>
          <option value="asc">Сначала дешевле</option>
          <option value="desc">Сначала дороже</option>
        </select>
      </div>
      {hs.length ? (
        <div className="grid">{hs.map((h) => <HotelCard key={h.id} h={h} />)}</div>
      ) : (
        <div className="empty">Нет отелей с таким фильтром. Сбросьте «Звёзды».</div>
      )}
    </>
  );
}
