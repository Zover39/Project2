import { reviews } from "@/lib/data";
export const metadata = { title: "О нас — Горизонт" };
export default function Page() {
  return (
    <>
      <section className="sec">
        <h1>О нас</h1>
        <p className="muted">Турагентство «Горизонт» работает в Астане с 2017 года. Мы сами летали в большинство направлений каталога и знаем, чем они отличаются от картинки в рекламе.</p>
      </section>
      <section className="sec facts">
        <div><b>9 лет</b><span>на рынке</span></div>
        <div><b>6 400</b><span>туристов</span></div>
        <div><b>24/7</b><span>поддержка в поездке</span></div>
      </section>
      <section className="sec">
        <h2>Отзывы</h2>
        <ul className="reviews">{reviews.map((r) => <li key={r.name} className="rev"><p>{r.text}</p><p className="muted">{r.name}</p></li>)}</ul>
      </section>
    </>
  );
}
