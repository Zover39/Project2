"use client";
import { useState } from "react";

const TYPES = [["Черновой", 25000], ["Чистовая", 40000], ["Под ключ", 70000]] as const;
const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₸";

export default function Calculator() {
  const [type, setType] = useState(2);
  const [area, setArea] = useState(55);
  const [old, setOld] = useState(false);
  const [design, setDesign] = useState(false);
  const [phone, setPhone] = useState("");
  const [st, setSt] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  const perM = TYPES[type][1] * (old ? 1.15 : 1) + (design ? 3000 : 0);
  const total = Math.round((perM * area) / 1000) * 1000;

  function send() {
    if (phone.replace(/\D/g, "").length < 10) { setSt("err"); setMsg("Введите телефон полностью."); return; }
    setSt("ok"); // пока без сервера: заявка никуда не отправляется
  }

  return (
    <div className="calc">
      <div className="form">
        <p className="lbl">Вид ремонта</p>
        <div className="tabs" role="tablist">
          {TYPES.map(([n], k) => (
            <button key={n} role="tab" aria-selected={type === k} className="tab" onClick={() => setType(k)}>{n}</button>
          ))}
        </div>
        <label>Площадь: {area} м²
          <input type="range" min={20} max={200} value={area} onChange={(e) => setArea(+e.target.value)} />
        </label>
        <label className="chk"><input type="checkbox" checked={old} onChange={(e) => setOld(e.target.checked)} /> Вторичное жильё (+15%)</label>
        <label className="chk"><input type="checkbox" checked={design} onChange={(e) => setDesign(e.target.checked)} /> Дизайн-проект (+3 000 ₸/м²)</label>
      </div>
      <div className="result">
        <p className="muted">Ориентировочная стоимость</p>
        <p className="big">{fmt(total)}</p>
        <p className="muted">≈ {fmt(Math.round(perM))} за м². Точную смету даём после замера.</p>
        {st === "ok" ? <p className="sent">Расчёт отправлен. Перезвоним в течение часа.</p> : (
          <div className="form">
            <label>Телефон<input type="tel" inputMode="tel" placeholder="+7 701 123-45-67" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
            <p className="err" role="alert">{st === "err" ? msg : ""}</p>
            <button onClick={send}>Получить точную смету</button>
          </div>
        )}
      </div>
    </div>
  );
}
