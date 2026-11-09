import { COUNTRIES_CONFIG, PREFIXES, MEALS, BEACHES } from './config';

const generateHotels = () => {
  let list = [];
  let idCounter = 1;
  COUNTRIES_CONFIG.forEach(c => {
    for (let i = 1; i <= 15; i++) {
      const stars = (i % 3 === 0) ? 4 : 5;
      const basePrice = 350000 + (i * 35000) + (c.name.length * 15000);
      const meal = MEALS[(i + c.name.length) % MEALS.length];
      const beach = BEACHES[i % BEACHES.length];

      list.push({
        id: `hotel-${idCounter++}`,
        country: c.name,
        city: c.name === "ОАЭ" ? (i % 2 === 0 ? "Дубай" : "Абу-Даби") : (c.name === "Турция" ? (i % 2 === 0 ? "Анталья" : "Стамбул") : c.city.split('/')[0].trim()),
        name: `${PREFIXES[(i - 1) % PREFIXES.length]} ${c.name} ${stars}★ #${i}`,
        stars: stars,
        image: c.imgBase,
        price: basePrice,
        rating: (4.4 + (i % 6) * 0.1).toFixed(2),
        reviewsCount: 120 + i * 14,
        meal: meal,
        beach: beach,
        flightRoute: `Прямой рейс Air Astana / FlyArystan из Астаны (NQZ) • ~${4 + (i % 3)}ч`,
        tourIncludes: [
          "Авиаперелет туда и обратно из Международного аэропорта Астаны (NQZ)",
          "Групповой трансфер (Аэропорт — Отель — Аэропорт)",
          "Медицинская страховка туриста на весь период",
          "Услуги профессионального русскоговорящего гида в отеле",
          `Проживание в выбранном номере с питанием (${meal})`
        ],
        amenities: {
          sports: "Фитнес-центр 24/7, теннисные корты, пляжный волейбол, йога на закате, водные виды спорта (дайвинг, гидроциклы).",
          restaurants: "Главный ресторан шведский стол, 3 а-ля карт ресторана (итальянская, азиатская и местная кухни), 4 бара у бассейнов.",
          kids: "Детский мини-клуб (4-12 лет), игровая площадка, отдельный бассейн с водными горками, детское меню.",
          wellness: "СПА-салон, сауна, турецкий хаммам, джакузи, массажные кабинеты и салон красоты."
        },
        rooms: [
          { id: 'std', name: 'Стандартный номер (Standard Room)', desc: 'Уютный номер с видом на сад или город, двуспальная кровать или 2 раздельные.', priceExtra: 0 },
          { id: 'dlx', name: 'Улучшенный с видом на море (Deluxe Sea View)', desc: 'Просторный номер на верхних этажах с панорамным видом на море и балконом.', priceExtra: 95000 },
          { id: 'fam', name: 'Семейный люкс (Family Suite, 2 комнаты)', desc: 'Две изолированные спальни, гостиная зона, 2 ванные комнаты для большой семьи.', priceExtra: 180000 },
          { id: 'vil', name: 'Президентская вилла (Presidential Villa)', desc: 'Эксклюзивная вилла с частным бассейном, террасой и персональным батлером.', priceExtra: 450000 }
        ]
      });
    }
  });
  return list;
};

export const HOTELS_DATA = generateHotels();
