import Calculator from "@/components/Calculator";
export const metadata = { title: "Калькулятор ремонта — Отвес" };
export default function Page() {
  return <section className="sec"><h1>Калькулятор стоимости</h1><p className="muted">Подвигайте ползунок и выберите параметры — цена пересчитывается сразу.</p><Calculator /></section>;
}
