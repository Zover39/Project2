"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ["/", "Главная"], ["/services", "Услуги"], ["/calculator", "Калькулятор"],
  ["/portfolio", "Проекты"], ["/contacts", "Контакты"],
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="top">
      <Link href="/" className="logo">Отвес</Link>
      <nav aria-label="Разделы сайта">
        {tabs.map(([href, label]) => (
          <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
