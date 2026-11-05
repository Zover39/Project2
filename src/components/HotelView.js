import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { C, HOTELS, FLIGHT } from '../data/countries';
import Img from './Img';
import CheckoutModal from './CheckoutModal';

export default function HotelView() {
  const { hid, go, fav, toggleFav, money, calc, trip, updateTrip, minDate } = useApp();
  const [room, setRoom] = useState(null);
  const h = HOTELS.find((x) => x.id === hid);
  const c = C.find((x) => x.id === h.cid);
  const on = fav.includes(h.id);

  return (
    <>
      <button className="back" onClick={() => go('home', c.id)}>← {c.n}</button>
      <div className="two">
        <div style={{ display: 'grid', gap: 18 }}>
          <div className="panel">
            <div className="ph" style={{ borderRadius: 14, marginBottom: 16, aspectRatio: '16/8' }}>
              <Img id={h.img} alt={h.name} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
              <div>
                <h1 style={{ fontSize: 24, marginBottom: 6 }}>{h.name}</h1>
                <p className="mute">📍 {h.beach} · {h.stars}★</p>
              </div>
              <button className="btn ghost" aria-pressed={on} onClick={() => toggleFav(h.id)}>
                {on ? '♥ В избранном' : '♡ В избранное'}
              </button>
            </div>
            <p style={{ marginTop: 12 }}>{h.desc}</p>
            <div className="info">
              <div><h4>Спорт</h4>{h.sport}</div>
              <div><h4>Рестораны</h4>{h.food}</div>
              <div><h4>Детям</h4>{h.kids}</div>
              <div><h4>В туре</h4>{h.inc.map((i) => <div key={i} style={{ padding: 0, background: 'none' }}>✓ {i}</div>)}</div>
            </div>
          </div>

          <div className="panel">
            <h2 style={{ fontSize: 18 }}>Номера</h2>
            {h.rooms.map((r) => (
              <div className="room" key={r.t}>
                <div>
                  <b>{r.t}</b>
                  <p className="mute">Перелёт, проживание, трансфер</p>
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mute">за тур</div>
                    <div className="price">{money(calc(r.p))}</div>
                  </div>
                  <button className="btn" onClick={() => setRoom(r)}>Забронировать</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="aside">
          <div className="panel f">
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>Параметры тура</h2>
            <label>
              Дата вылета
              <input type="date" min={minDate} value={trip.date}
                onChange={(e) => updateTrip({ date: e.target.value < minDate ? minDate : e.target.value })} />
            </label>
            <label style={{ marginTop: 12 }}>
              Ночей: <b>{trip.nights}</b>
              <input type="range" min="3" max="21" value={trip.nights} style={{ padding: 0 }}
                onChange={(e) => updateTrip({ nights: +e.target.value })} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              <label>
                Взрослые
                <select value={trip.ad} onChange={(e) => updateTrip({ ad: +e.target.value })}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
              <label>
                Дети
                <select value={trip.ch} onChange={(e) => updateTrip({ ch: +e.target.value })}>
                  {[0, 1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
            </div>
            <label style={{ marginTop: 12 }}>Класс перелёта</label>
            <div className="seg">
              {Object.entries(FLIGHT).map(([k, v]) => (
                <button key={k} className={trip.cls === k ? 'on' : ''} onClick={() => updateTrip({ cls: k })}>{v[0]}</button>
              ))}
            </div>
            <p className="mute" style={{ marginTop: 12 }}>Ребёнок считается как 0,7 взрослого. Цены ориентировочные.</p>
          </div>
        </aside>
      </div>
      {room && <CheckoutModal hotel={h} room={room} onClose={() => setRoom(null)} />}
    </>
  );
}
