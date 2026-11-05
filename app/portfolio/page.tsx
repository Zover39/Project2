import Portfolio from "@/components/Portfolio";
export const metadata = { title: "Проекты — Отвес" };
export default function Page() {
  return <section className="sec"><h1>Наши проекты</h1><p className="muted">Сданные квартиры в Астане. Фильтруйте по виду ремонта.</p><Portfolio /></section>;
}
