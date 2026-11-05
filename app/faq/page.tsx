import { faq } from "@/lib/data";
export const metadata = { title: "Вопросы — Горизонт" };
export default function Page() {
  return (
    <section className="sec">
      <h1>Частые вопросы</h1>
      {faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
      <h2 style={{ marginTop: 56 }}>Документы для поездки</h2>
      <ul className="ticks"><li>Загранпаспорт со сроком действия не менее 6 месяцев после поездки</li><li>Удостоверение личности и копия паспорта</li><li>Для детей: свидетельство о рождении и согласие второго родителя</li><li>Виза (если требуется), поможем оформить</li></ul>
    </section>
  );
}
