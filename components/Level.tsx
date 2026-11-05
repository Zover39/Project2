"use client";
import { useEffect, useRef, useState } from "react";

// Строительный уровень: пузырёк следует за курсором/пальцем. Главный «момент» страницы.
export default function Level() {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0); // -1..1

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const v = ((e.clientX - r.left) / r.width) * 2 - 1;
      setT(Math.max(-1, Math.min(1, v)));
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  const level = Math.abs(t) < 0.06;
  return (
    <div ref={ref} className="level" role="img" aria-label="Строительный уровень: пузырёк в центре — всё ровно">
      <div className="tube">
        <span className="mark" style={{ left: "42%" }} />
        <span className="mark" style={{ left: "58%" }} />
        <span className="bubble" data-ok={level} style={{ left: `${50 + t * 44}%` }} />
      </div>
      <p className="readout">{level ? "Ровно. Так и сдаём." : `Отклонение ${(t * 3).toFixed(1)} мм/м`}</p>
    </div>
  );
}
