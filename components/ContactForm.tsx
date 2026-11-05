"use client";
import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const phone = String(new FormData(e.currentTarget).get("phone") || "");
    if (phone.replace(/\D/g, "").length < 10) return setErr("Введите телефон полностью, например +7 701 123-45-67.");
    setErr("");
    setSent(true); // пока без сервера: заявка никуда не отправляется
  }

  if (sent) return <p className="sent">Заявка отправлена. Перезвоним в течение часа в рабочее время.</p>;
  return (
    <form onSubmit={submit} noValidate>
      <label>Имя<input name="name" autoComplete="name" required /></label>
      <label>Телефон<input name="phone" type="tel" autoComplete="tel" inputMode="tel" required aria-describedby="e" /></label>
      <label>Куда хотите поехать?<input name="wish" placeholder="Например, море в январе" /></label>
      <p id="e" className="err" role="alert">{err}</p>
      <button type="submit">Получить подбор туров</button>
    </form>
  );
}
