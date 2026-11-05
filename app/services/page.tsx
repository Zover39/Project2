import ServicesTabs from "@/components/ServicesTabs";
export const metadata = { title: "Услуги — Отвес" };
export default function Page() {
  return <section className="sec"><h1>Услуги</h1><p className="muted">Выберите вид ремонта, чтобы увидеть состав работ, цену и сроки.</p><ServicesTabs /></section>;
}
