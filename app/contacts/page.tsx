import ContactForm from "@/components/ContactForm";
export const metadata = { title: "Контакты — Отвес" };
export default function Page() {
  return (
    <section className="sec contact">
      <div>
        <h1>Контакты</h1>
        <p>Астана, пн–сб 9:00–20:00</p>
        <p>+7 701 000-00-00</p>
        <p>info@otves.kz</p>
      </div>
      <ContactForm />
    </section>
  );
}
