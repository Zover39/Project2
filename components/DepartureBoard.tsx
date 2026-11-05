import { tours, fmt } from "@/lib/data";

// Табло вылетов из Астаны — фирменный элемент главной страницы
export default function DepartureBoard() {
  return (
    <div className="board" role="table" aria-label="Ближайшие вылеты из Астаны">
      <div className="row head" role="row"><span>Дата</span><span>Направление</span><span className="d">Дней</span><span>Цена</span></div>
      {tours.slice(0, 5).map((t) => (
        <div className="row" role="row" key={t.id}>
          <span>{t.date}</span>
          <span>{t.country.toUpperCase()}</span>
          <span className="d">{t.days}</span>
          <span className={t.left < 7 ? "low" : ""}>{fmt(t.price)}</span>
        </div>
      ))}
    </div>
  );
}
