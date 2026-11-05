import Link from "next/link";
import DepartureBoard from "@/components/DepartureBoard";
import TourCard from "@/components/TourCard";
import ContactForm from "@/components/ContactForm";
import { tours } from "@/lib/data";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>Мир ближе,<br />чем кажется</h1>
        <p className="lead">Туры из Астаны с перелётом, отелем и визовой поддержкой. Подберём за час.</p>
        <DepartureBoard />
        <Link href="/tours" className="btn">Выбрать тур</Link>
      </section>

      <section className="sec">
        <h2>Горящие предложения</h2>
        <ul className="grid">{tours.slice(0, 3).map((t) => <TourCard key={t.id} t={t} />)}</ul>
        <p style={{ marginTop: 24 }}><Link href="/tours">Все туры →</Link></p>
      </section>

      <section className="sec dark">
        <h2>Как это работает</h2>
        <ol className="steps">
          <li><h3>Заявка</h3><p>Выберите тур или опишите пожелания.</p></li>
          <li><h3>Подбор</h3><p>Менеджер предложит 2–3 варианта за час.</p></li>
          <li><h3>Договор</h3><p>Предоплата 30%, остальное за 14 дней до вылета.</p></li>
          <li><h3>Вылет</h3><p>Документы в мессенджер, поддержка 24/7 в поездке.</p></li>
        </ol>
      </section>

      <section className="sec facts">
        <div><b>9 лет</b><span>на рынке Астаны</span></div>
        <div><b>6 400</b><span>довольных туристов</span></div>
        <div><b>40+</b><span>стран в каталоге</span></div>
      </section>

      <section className="sec contact">
        <div><h2>Не знаете, куда поехать?</h2><p>Оставьте телефон. Предложим направления под ваш бюджет и даты.</p></div>
        <ContactForm />
      </section>
    </main>
  );
}
