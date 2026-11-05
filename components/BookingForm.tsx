"use client";
import { useState } from "react";
import { fmt } from "@/lib/data";

export default function BookingForm({ price }: { price: number }) {
  const [people, setPeople] = useState(2);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (String(d.get("phone") || "").replace(/\D/g, "").length < 10) return setErr("Введите телефон полностью, например +7 701 123-45-67.");
    setErr("");
    setSent(true); // пока без сервера: заявка никуда не отправляется
  }

  if (sent) return <p className="sent">Заявка принята. Менеджер перезвонит в течение часа.</p>;
  return (
    <form onSubmit={submit} noValidate className="panel">
      <p className="big">{fmt(price * people)}</p>
      <p className="muted">за {people} чел. ({fmt(price)} с человека)</p>
      <label>Количество человек
        <input type="number" min={1} max={10} value={people} onChange={(e) => setPeople(Math.max(1, Math.min(10, +e.target.value || 1)))} />
      </label>
      <label>Дата вылета<input name="date" type="date" /></label>
      <label>Имя<input name="name" autoComplete="name" required /></label>
      <label>Телефон<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required aria-describedby="be" /></label>
      <p id="be" className="err" role="alert">{err}</p>
      <button type="submit">Забронировать</button>
    </form>
  );
}
