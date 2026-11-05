import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import { tours, fmt } from "@/lib/data";

type P = { params: Promise<{ id: string }> };
export function generateStaticParams() { return tours.map((t) => ({ id: t.id })); }
export async function generateMetadata({ params }: P) {
  const t = tours.find((x) => x.id === (await params).id);
  return { title: t ? `${t.title} — Горизонт` : "Тур не найден" };
}

export default async function Page({ params }: P) {
  const t = tours.find((x) => x.id === (await params).id);
  if (!t) notFound();
  return (
    <section className="sec">
      <p><Link href="/tours">← Все туры</Link></p>
      <div className="tour-hero" style={{ background: `linear-gradient(135deg,hsl(${t.hue} 70% 60%),hsl(${t.hue + 30} 60% 32%))` }} aria-hidden />
      <div className="calc">
        <div>
          <span className="tag">{t.cat}</span>
          <h1>{t.title}</h1>
          <p className="muted">{t.country} · {t.days} дней · вылет {t.date} из Астаны · от {fmt(t.price)}</p>
          <p>{t.text}</p>
          <h3>Что входит</h3>
          <ul className="ticks">{t.includes.map((x) => <li key={x}>{x}</li>)}</ul>
          {t.left < 7 && <p className="low-note">Осталось мест: {t.left}</p>}
        </div>
        <BookingForm price={t.price} />
      </div>
    </section>
  );
}
