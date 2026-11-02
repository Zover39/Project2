"use client";
import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const phone = String(d.get("phone") || "").replace(/\D/g, "");
    if (phone.length < 10) return setErr("Введите телефон полностью, например +7 701 123-45-67.");
    setErr("");
    // TODO (этап 2): отправка на /api/lead → Telegram/CRM
    setSent(true);
  }

  if (sent) return <p className="sent">Заявка отправлена. Перезвоним в течение часа в рабочее время.</p>;

  return (
    <form onSubmit={submit} noValidate>
      <label>Имя<input name="name" autoComplete="name" required /></label>
      <label>Телефон<input name="phone" type="tel" autoComplete="tel" inputMode="tel" required aria-describedby="e" /></label>
      <label>Площадь квартиры, м²<input name="area" inputMode="numeric" /></label>
      <p id="e" className="err" role="alert">{err}</p>
      <button type="submit">Заказать бесплатный замер</button>
    </form>
  );
}
