import type { Metadata } from "next";
import { Onest, Unbounded } from "next/font/google";
import "./globals.css";

const body = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-body" });
const head = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-head", weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Отвес — ремонт квартир в Астане под ключ",
  description: "Ремонт квартир в Астане с фиксированной сметой и сроком в договоре. Замер и расчёт бесплатно.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${body.variable} ${head.variable}`}>
      <body>{children}</body>
    </html>
  );
}
