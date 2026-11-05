"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [["/", "Главная"], ["/tours", "Туры"], ["/about", "О нас"], ["/faq", "Вопросы"], ["/contacts", "Контакты"]];

export default function Header() {
  const path = usePathname();
  return (
    <header className="top">
      <Link href="/" className="logo">Горизонт</Link>
      <nav aria-label="Разделы сайта">
        {tabs.map(([href, label]) => (
          <Link key={href} href={href} aria-current={path === href || (href !== "/" && path.startsWith(href)) ? "page" : undefined}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
