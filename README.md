# Astana Travel

Демо-сайт турагентства из Астаны на Next.js (Pages Router). Без Tailwind и сторонних UI-библиотек.

## Запуск
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Структура
- `src/data/countries.js` — страны, отели, номера, цены, курс `RATE`
- `src/context/AppContext.js` — состояние, расчёт цены, localStorage
- `src/components/` — интерфейс
- `src/pages/` — `index.js`, `_app.js`, `_document.js`
- `src/styles/globals.css` — стили и тёмная тема

Это демо: оплата и бронирование имитируются, отели и цены иллюстративные.
