# Astana Travel

Сайт турагентства из Астаны: Next.js 14 (Pages Router) + Tailwind CSS + lucide-react.

## Запуск
```bash
npm install
npm run dev      # http://localhost:3000
```
Нужен Node.js 18.17 или новее (`node -v`).

## Если не запускается
```bash
rmdir /s /q node_modules .next   # Windows cmd; в PowerShell: Remove-Item -Recurse -Force node_modules,.next
del package-lock.json
npm install
npm run dev
```

## Структура
- `src/data/countries.js` — страны, отели, номера, цены, курс `RATE`
- `src/context/AppContext.js` — состояние, расчёт цены, localStorage, переводы
- `src/components/` — интерфейс
- `src/pages/` — `index.js`, `_app.js`, `_document.js`
- `src/styles/globals.css` — Tailwind и тёмная тема

Демо: оплата и бронирование имитируются, отели и цены иллюстративные.
