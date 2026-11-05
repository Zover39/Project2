import ToursCatalog from "@/components/ToursCatalog";
export const metadata = { title: "Туры — Горизонт" };
export default function Page() {
  return <section className="sec"><h1>Каталог туров</h1><p className="muted">Ищите по стране, выбирайте тип отдыха и задавайте бюджет.</p><ToursCatalog /></section>;
}
