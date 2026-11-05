import { useApp } from '../context/AppContext';

export default function Bookings() {
  const { bk, go, money, cancelBooking } = useApp();
  return (
    <>
      <h1 style={{ fontSize: 24, margin: '22px 0' }}>Мои туры ({bk.length})</h1>
      {bk.length ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {bk.map((b) => (
            <div key={b.id} className="panel" style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <b style={{ color: 'var(--sky-d)' }}>{b.id}</b>
                <h3 style={{ fontSize: 17, margin: '4px 0' }}>{b.hotel}</h3>
                <p className="mute">{b.country} · {b.room}</p>
                <p className="mute">Вылет {b.date}, {b.nights} ноч. · {b.pax} · {b.cls} · {b.name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="price">{money(b.total)}</div>
                <span style={{ color: 'var(--ok)', fontWeight: 600, fontSize: 13 }}>Оплачено</span><br />
                <button className="btn ghost" style={{ marginTop: 8, padding: '6px 12px', fontSize: 13 }}
                  onClick={() => confirm('Отменить бронь ' + b.id + '?') && cancelBooking(b.id)}>
                  Отменить
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          У вас пока нет туров.<br /><br />
          <button className="btn" onClick={() => go('home')}>Подобрать тур</button>
        </div>
      )}
    </>
  );
}
