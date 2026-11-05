"use client";
import { useState } from "react";
import { tours, cats, fmt } from "@/lib/data";
import TourCard from "./TourCard";

export default function ToursCatalog() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Все");
  const [max, setMax] = useState(900000);
  const [sort, setSort] = useState("price");

  const list = tours
    .filter((t) => (cat === "Все" || t.cat === cat) && t.price <= max && (t.title + t.country).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === "price" ? a.price - b.price : b.days - a.days));

  return (
    <>
      <div className="filters form">
        <label>Поиск<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Страна или название" /></label>
        <label>Бюджет до {fmt(max)}<input type="range" min={80000} max={900000} step={10000} value={max} onChange={(e) => setMax(+e.target.value)} /></label>
        <label>Сортировка
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="price">Сначала дешёвые</option>
            <option value="days">Сначала длинные</option>
          </select>
        </label>
      </div>
      <div className="tabs" role="tablist">
        {cats.map((c) => <button key={c} role="tab" aria-selected={cat === c} className="tab" onClick={() => setCat(c)}>{c}</button>)}
      </div>
      {list.length === 0 && <p className="muted">Ничего не найдено. Измените фильтры.</p>}
      <ul className="grid">{list.map((t) => <TourCard key={t.id} t={t} />)}</ul>
    </>
  );
}
