import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { C, FLIGHT } from '../data/countries';

export default function CheckoutModal({ hotel, room, onClose }) {
  const { trip, calc, money, addBooking, go } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errs, setErrs] = useState({});
  const [done, setDone] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const total = calc(room.p);

  const pay = () => {
    const e = {};
    if (name.trim().split(/\s+/).length < 2) e.name = 'Введите имя и фамилию';
    if (!/^[78]\d{10}$/.test(phone.replace(/\D/g, ''))) e.phone = 'Телефон: 11 цифр, например +7 701 123 45 67';
    setErrs(e);
    if (Object.keys(e).length) return;
    const b = {
      id: 'AST-' + Math.floor(100000 + Math.random() * 900000),
      country: C.find((c) => c.id === hotel.cid).n,
      hotel: hotel.name, room: room.t, date: trip.date, nights: trip.nights,
      pax: `${trip.ad} взр., ${trip.ch} дет.`, cls: FLIGHT[trip.cls][0], name: name.trim(), total,
    };
    addBooking(b);
    setDone(b);
  };

  if (done) {
    return (
      <div className="modal">
        <div role="dialog" aria-modal="true" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, color: 'var(--ok)' }}>✓</div>
          <h2 style={{ fontSize: 20, margin: '6px 0' }}>Тур оформлен</h2>
          <p className="mute">Номер брони <b>{done.id}</b>. Это демо-версия: билеты и ваучер не выпускаются.</p>
          <div className="sum" style={{ textAlign: 'left' }}>
            <p><span className="mute">Отель</span><b>{done.hotel}</b></p>
            <p><span className="mute">Сумма</span><b>{money(done.total)}</b></p>
          </div>
          <button className="btn block" onClick={() => { onClose(); go('bookings'); }}>Мои туры</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Оплата">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: '#f14635', color: '#fff', font: '700 22px Unbounded', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>K</div>
          <h2 style={{ fontSize: 19 }}>Оплата через Kaspi</h2>
          <p className="mute">Демо: деньги не списываются</p>
        </div>
        <div className="sum">
          <p><span className="mute">Отель</span><b>{hotel.name}</b></p>
          <p><span className="mute">Номер</span><b>{room.t}</b></p>
          <p><span className="mute">Вылет</span><b>{trip.date}, {trip.nights} ноч.</b></p>
          <p><span className="mute">Туристы</span><b>{trip.ad} взр., {trip.ch} дет. · {FLIGHT[trip.cls][0]}</b></p>
          <p style={{ borderTop: '1px solid var(--line)', paddingTop: 8, fontSize: 16 }}>
            <span>К оплате</span><b style={{ color: 'var(--sky-d)' }}>{money(total)}</b>
          </p>
        </div>
        <div className="f">
          <label>Имя и фамилия как в паспорте
            <input autoFocus autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="err">{errs.name}</div>
          <label>Телефон Kaspi
            <input type="tel" autoComplete="tel" placeholder="+7 7__ ___ __ __" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <div className="err">{errs.phone}</div>
        </div>
        <button className="btn gold block" onClick={pay}>Оплатить {money(total)}</button>
        <button className="btn ghost block" style={{ marginTop: 8 }} onClick={onClose}>Отмена</button>
      </div>
    </div>
  );
}
