import Level from "@/components/Level";
import ContactForm from "@/components/ContactForm";

const services = [
  ["Черновой ремонт", "Стяжка, выравнивание стен, электрика, сантехника. От 25 000 ₸/м²."],
  ["Чистовая отделка", "Покраска, плитка, полы, двери. От 40 000 ₸/м²."],
  ["Ремонт под ключ", "Дизайн-проект, закупка, отделка и уборка. От 70 000 ₸/м²."],
];
const steps = [
  ["Замер и смета", "Приезжаем бесплатно, через 2 дня отдаём смету с каждой позицией."],
  ["Договор", "Срок и цена фиксируются. Каждый день просрочки — 0,5% неустойки."],
  ["Работы", "Фотоотчёт каждый день, приёмка по этапам."],
  ["Сдача", "Проверяем уровнем и лазером. Гарантия 3 года."],
];
const faq = [
  ["Смета может вырасти?", "Нет. Если мы ошиблись в расчёте — доплачиваем сами. Изменения допускаются только по вашему письменному согласию."],
  ["Сколько длится ремонт?", "Двушка 55 м² под ключ — 70–90 дней. Точный срок пишем в договоре."],
  ["Можно жить в квартире во время работ?", "Для чернового этапа — нет, для чистовой отделки отдельных комнат — да."],
];

export default function Home() {
  return (
    <>
      <header className="top">
        <a href="#" className="logo">Отвес</a>
        <nav aria-label="Разделы">
          <a href="#services">Услуги</a><a href="#process">Как работаем</a><a href="#faq">Вопросы</a>
          <a href="#contact" className="btn-s">Оставить заявку</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Ремонт, который<br />сдаётся по уровню</h1>
          <p className="lead">Фиксированная смета и срок в договоре. Бесплатный замер за 2 дня.</p>
          <Level />
          <a href="#contact" className="btn">Рассчитать ремонт</a>
        </section>

        <section id="services" className="sec">
          <h2>Что делаем</h2>
          <ul className="rows">
            {services.map(([t, d]) => (<li key={t}><h3>{t}</h3><p>{d}</p></li>))}
          </ul>
        </section>

        <section id="process" className="sec dark">
          <h2>Как работаем</h2>
          <ol className="steps">
            {steps.map(([t, d]) => (<li key={t}><h3>{t}</h3><p>{d}</p></li>))}
          </ol>
        </section>

        <section className="sec facts">
          <div><b>412</b><span>квартир сдано с 2014 года</span></div>
          <div><b>3 года</b><span>гарантия на все работы</span></div>
          <div><b>0 ₸</b><span>за замер и смету</span></div>
        </section>

        <section id="faq" className="sec">
          <h2>Частые вопросы</h2>
          {faq.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
        </section>

        <section id="contact" className="sec contact">
          <div><h2>Узнайте стоимость за день</h2><p>Оставьте телефон — позвоним, уточним детали и договоримся о замере.</p></div>
          <ContactForm />
        </section>
      </main>

      <footer><span>© 2026 Отвес</span><span>Астана · пн–сб 9:00–20:00</span></footer>
    </>
  );
}
