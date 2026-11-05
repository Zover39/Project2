"use client";
import { useState } from "react";
import Link from "next/link";

const data = [
  { name: "Черновой", price: "от 25 000 ₸/м²", term: "30–45 дней", items: ["Демонтаж и вывоз мусора", "Стяжка и выравнивание стен", "Электрика и разводка", "Сантехника и отопление"] },
  { name: "Чистовая", price: "от 40 000 ₸/м²", term: "35–50 дней", items: ["Шпаклёвка и покраска", "Плитка и керамогранит", "Полы: ламинат, паркет", "Установка дверей и плинтусов"] },
  { name: "Под ключ", price: "от 70 000 ₸/м²", term: "70–90 дней", items: ["Дизайн-проект", "Закупка и доставка материалов", "Полный цикл работ", "Клининг и сдача"] },
];

export default function ServicesTabs() {
  const [i, setI] = useState(0);
  const s = data[i];
  return (
    <>
      <div className="tabs" role="tablist">
        {data.map((d, n) => (
          <button key={d.name} role="tab" aria-selected={i === n} className="tab" onClick={() => setI(n)}>{d.name}</button>
        ))}
      </div>
      <div className="panel" role="tabpanel">
        <p className="big">{s.price}</p>
        <p className="muted">Срок: {s.term}</p>
        <ul className="ticks">{s.items.map((x) => <li key={x}>{x}</li>)}</ul>
        <Link href="/calculator" className="btn">Рассчитать стоимость</Link>
      </div>
    </>
  );
}
