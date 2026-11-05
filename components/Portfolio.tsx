"use client";
import { useState } from "react";
import { projects, types } from "@/lib/data";

export default function Portfolio() {
  const [f, setF] = useState("Все");
  const list = projects.filter((p) => f === "Все" || p.type === f);
  return (
    <>
      <div className="tabs" role="tablist">
        {types.map((t) => <button key={t} role="tab" aria-selected={f === t} className="tab" onClick={() => setF(t)}>{t}</button>)}
      </div>
      <ul className="grid">
        {list.map((p) => (
          <li key={p.id} className="card">
            <div className="ph" style={{ background: `linear-gradient(135deg,hsl(${p.hue} 45% 62%),hsl(${p.hue} 40% 38%))` }} aria-hidden />
            <h3>{p.title}</h3>
            <p className="muted">{p.type} · {p.area} м² · {p.price}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
