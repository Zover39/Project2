import Link from "next/link";
import { fmt } from "@/lib/data";

type T = { id: string; title: string; country: string; days: number; price: number; hue: number; cat: string };

export default function TourCard({ t }: { t: T }) {
  return (
    <li className="card">
      <Link href={`/tours/${t.id}`} className="cardlink">
        <div className="ph" style={{ background: `linear-gradient(135deg,hsl(${t.hue} 70% 60%),hsl(${t.hue + 30} 60% 32%))` }} aria-hidden />
        <span className="tag">{t.cat}</span>
        <h3>{t.title}</h3>
        <p className="muted">{t.country} · {t.days} дней · от {fmt(t.price)}</p>
      </Link>
    </li>
  );
}
