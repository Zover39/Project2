import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Plane, Hotel, Calendar, Users, Heart, ShoppingBag, Settings, 
  Search, ShieldCheck, CheckCircle, ArrowRight, Star, MapPin, 
  Coffee, Wifi, Waves, Sparkles, X, ChevronRight, Check, AlertCircle 
} from 'lucide-react';

// База данных стран и реальных отелей с фотографиями, удобствами и ценами в ₸
const COUNTRIES_DATA = [
  {
    id: 'uae',
    name: 'ОАЭ (Дубай / Абу-Даби)',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80',
    description: 'Современные мегаполисы, небоскребы, роскошные пляжи и шопинг мирового уровня.',
    flightFrom: 'Астана (NQZ) — Прямой рейс (Air Astana / FlyArystan, ~4.5 часа)',
    hotels: [
      {
        id: 'uae-1',
        name: 'Burj Al Arab Jumeirah 5*',
        category: '5',
        beach: 'Первая линия, частный песчаный пляж',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        description: 'Легендарный отель-парус с роскошными люксами, вертолетной площадкой и непревзойденным сервисом.',
        amenities: {
          sport: 'Фитнес-центр, йога на пляже, теннисный корт, волейбол',
          restaurants: '7 ресторанов изысканной кухни (включая подводный), 4 бара',
          children: 'Детский клуб Sinbad’s, анимация, детское меню, бассейн с горками',
          tourIncludes: ['Авиаперелет Астана - Дубай - Астана', 'Индивидуальный VIP-трансфер на Rolls-Royce', 'Медицинская страховка 100 000$', 'Консьерж-сервис 24/7']
        },
        rooms: [
          { type: 'Deluxe Suite (1 спальня с видом на море)', priceBase: 450000 },
          { type: 'Panoramic View Suite (панорамные окна)', priceBase: 620000 },
          { type: 'Presidential Two-Bedroom Suite', priceBase: 950000 }
        ]
      },
      {
        id: 'uae-2',
        name: 'Atlantis, The Palm 5*',
        category: '5',
        beach: 'Первая линия, пляж Palm Island',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        description: 'Знаменитый курорт на искусственном острове Пальма Джумейра с аквапарком Aquaventure.',
        amenities: {
          sport: 'Дайвинг, аквапарк, тренажерный зал, водные виды спорта',
          restaurants: '29 ресторанов и баров мирового класса',
          children: 'Клуб Aquaventure, детская игровая площадка, бассейн, няня',
          tourIncludes: ['Прямой перелет из Астаны', 'Групповой трансфер аэропорт-отель-аэропорт', 'Страховка', 'Безлимитный вход в аквапарк Aquaventure']
        },
        rooms: [
          { type: 'Ocean King Room (вид на море)', priceBase: 280000 },
          { type: 'Palm Pool Club Room', priceBase: 340000 },
          { type: 'Two Bedroom Family Suite', priceBase: 580000 }
        ]
      },
      {
        id: 'uae-3',
        name: 'Rixos The Palm Dubai Hotel & Suites 5*',
        category: '5',
        beach: 'Первая линия, частный пляж',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        description: 'Премиальный отель, работающий по системе «Ультра Всё Включено» на восточной полусфере Пальмы.',
        amenities: {
          sport: 'Теннис, фитнес-центр Exclusive Sports Club, аквааэробика',
          restaurants: 'A la carte рестораны турецкой и итальянской кухни, пляжные бары',
          children: 'Rixy Kids Club, детская дискотека, мастер-классы',
          tourIncludes: ['Перелет из Астаны', 'Трансфер', 'Концепция UAI (Ультра всё включено)', 'Страховка']
        },
        rooms: [
          { type: 'Deluxe Room Garden View', priceBase: 310000 },
          { type: 'Deluxe Sea View Room', priceBase: 390000 },
          { type: 'Two Bedroom Family Suite', priceBase: 650000 }
        ]
      }
    ]
  },
  {
    id: 'turkey',
    name: 'Турция (Анталийское побережье / Кемер / Сиде)',
    image: 'https://images.unsplash.com/photo-1524231757913-215fce3a9b5a?auto=format&fit=crop&w=1000&q=80',
    description: 'Идеальный пляжный отдых, сосновые леса Таврских гор и развитая инфраструктура All Inclusive.',
    flightFrom: 'Астана (NQZ) — Прямой чартер / Регулярный рейс (Air Astana / SCAT, ~5 часов)',
    hotels: [
      {
        id: 'turkey-1',
        name: 'Maxx Royal Kemer Resort 5*',
        category: '5',
        beach: 'Первая линия, песчано-галечный пляж, пирс',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        description: 'Элитный курорт среди сосновых холмов Кемера с роскошными виллами и безупречным сервисом.',
        amenities: {
          sport: 'Профессиональный теннисный корт, футбол, водные лыжи, фитнес',
          restaurants: '5 основных и тематических ресторанов, кондитерская, 11 баров',
          children: 'Maxxi Land (детский клуб для всех возрастов), лунапарк, игры',
          tourIncludes: ['Перелет Астана - Анталья - Астана', 'Индивидуальный трансфер', 'Ultra All Inclusive', 'Страховка']
        },
        rooms: [
          { type: 'Suite Main Building (с видом на море)', priceBase: 260000 },
          { type: 'Terrace Suite (с джакузи на террасе)', priceBase: 350000 },
          { type: 'Laguna Duble Suite', priceBase: 490000 }
        ]
      },
      {
        id: 'turkey-2',
        name: 'Regnum Carya Belek 5*',
        category: '5',
        beach: 'Первая линия, собственный белый песчаный пляж',
        image: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=800&q=80',
        description: 'Один из лучших гольф-отелей Белека с аквапарком и площадками мирового уровня.',
        amenities: {
          sport: 'Гольф-поле Carya Golf Club, футбол, теннис, фитнес',
          restaurants: 'Шведский стол + 7 ресторанов A la carte',
          children: 'Dino Land (парк динозавров), детская академия спорта',
          tourIncludes: ['Прямой перелет из Астаны', 'Трансфер', 'Концепция Luxury AI', 'Страховка']
        },
        rooms: [
          { type: 'Luxury Room Golf View', priceBase: 220000 },
          { type: 'Luxury Room Sea View', priceBase: 290000 },
          { type: 'Family Roof Suite', priceBase: 420000 }
        ]
      },
      {
        id: 'turkey-3',
        name: 'Rixos Sungate Kemer 5*',
        category: '5',
        beach: 'Первая линия, протяженный галечный пляж',
        image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
        description: 'Огромный комплекс для активного семейного и молодежного отдыха в живописной бухте.',
        amenities: {
          sport: 'Боулинг, теннис, аквапарк, кроссфит, водные мотоциклы',
          restaurants: '10 ресторанов, снэк-бары, ночной клуб',
          children: 'Rixy Kids Club, бассейн с водными горками, батуты',
          tourIncludes: ['Прямой перелет из Астаны', 'Трансфер', 'UAI', 'Страховка']
        },
        rooms: [
          { type: 'Standard Room Garden View', priceBase: 150000 },
          { type: 'Family Room Sea View', priceBase: 210000 },
          { type: 'Grand Suite', priceBase: 340000 }
        ]
      }
    ]
  },
  {
    id: 'thailand',
    name: 'Таиланд (Пхукет / Паттайя / Самуи)',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    description: 'Тропический рай с бирюзовыми лагунами, буддийскими храмами и экзотической кухней.',
    flightFrom: 'Астана (NQZ) — Прямой рейс / С пересадкой в Алматы (Air Astana, ~7.5 часов)',
    hotels: [
      {
        id: 'thailand-1',
        name: 'Rosewood Phuket 5*',
        category: '5',
        beach: 'Первая линия, пляж Изумрудной бухты Патонг',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        description: 'Уединенный роскошный курорт на берегу Андаманского моря с тропическим садом и виллами.',
        amenities: {
          sport: 'Йога на закате, фитнес-центр, каякинг, снорклинг',
          restaurants: '4 тайских и европейских ресторана премиум-класса',
          children: 'Rosewood Explorers детский клуб, мастер-классы по ремеслам',
          tourIncludes: ['Перелет Астана - Пхукет - Астана', 'Индивидуальный трансфер', 'Завтраки (BB)', 'Страховка']
        },
        rooms: [
          { type: 'Ocean Pool Pavilion (вилла с бассейном)', priceBase: 320000 },
          { type: 'Beachfront Pool Villa', priceBase: 480000 },
          { type: 'Two Bedroom Sunset Villa', priceBase: 780000 }
        ]
      },
      {
        id: 'thailand-2',
        name: 'Centara Grand Beach Resort Phuket 5*',
        category: '5',
        beach: 'Первая линия, пляж Карон',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        description: 'Популярный курорт в колониальном стиле с аквапарком прямо на пляже Карон.',
        amenities: {
          sport: 'Водный парк с ленивой рекой, теннис, тренажерный зал',
          restaurants: '5 ресторанов и баров у бассейна',
          children: 'Camp Safari (детский клуб), игровая комната',
          tourIncludes: ['Перелет из Астаны', 'Трансфер', 'Завтраки', 'Страховка']
        },
        rooms: [
          { type: 'Deluxe Ocean View', priceBase: 180000 },
          { type: 'Luxury Ocean Suite', priceBase: 250000 },
          { type: 'Pool Suite Beachfront', priceBase: 380000 }
        ]
      },
      {
        id: 'thailand-3',
        name: 'Amari Phuket 4*',
        category: '4',
        beach: 'Первая линия, живописный южный мыс Патонга',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        description: 'Отель с панорамными видами на залив Патонг и собственным коралловым рифом.',
        amenities: {
          sport: 'Фитнес-центр FIT, открытые бассейны, дайвинг-центр',
          restaurants: 'Ресторан Rim Talay, тайская и итальянская кухни',
          children: 'Детский клуб, игровая зона',
          tourIncludes: ['Перелет из Астаны', 'Трансфер', 'Завтраки', 'Страховка']
        },
        rooms: [
          { type: 'Superior Ocean Facing Room', priceBase: 130000 },
          { type: 'Deluxe Ocean View', priceBase: 165000 },
          { type: 'One Bedroom Suite Club Access', priceBase: 240000 }
        ]
      }
    ]
  },
  {
    id: 'egypt',
    name: 'Египет (Шарм-эль-Шейх / Хургада)',
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1000&q=80',
    description: 'Красное море с богатейшим подводным миром, коралловыми рифами и круглогодичным солнцем.',
    flightFrom: 'Астана (NQZ) — Прямой чартерный рейс (~6 часов)',
    hotels: [
      {
        id: 'egypt-1',
        name: 'Rixos Sharm El Sheikh 5*',
        category: '5',
        beach: 'Первая линия, коралловый риф с понтоном',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        description: 'Премиальный отель только для взрослых с концепцией «Ультра Всё Включено» в бухте Набк.',
        amenities: {
          sport: 'Дайвинг, теннисные корты, пляжный волейбол, фитнес',
          restaurants: '7 ресторанов A la carte (итальянский, японский, индийский)',
          children: 'Отель работает для гостей старше 16 лет',
          tourIncludes: ['Перелет Астана - Шарм-эль-Шейх - Астана', 'Трансфер', 'Ultra All Inclusive', 'Страховка']
        },
        rooms: [
          { type: 'Superior Room Garden View', priceBase: 170000 },
          { type: 'Deluxe Sea View Room', priceBase: 220000 },
          { type: 'Junior Suite with Jacuzzi', priceBase: 310000 }
        ]
      },
      {
        id: 'egypt-2',
        name: 'Sunrise Arabian Beach Resort 5*',
        category: '5',
        beach: 'Первая линия, залив Шаркс-Бей',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        description: 'Роскошный курорт в стиле арабского дворца с великолепным рифом для снорклинга.',
        amenities: {
          sport: 'Дайвинг-центр, тренажерный зал, водное поло',
          restaurants: '6 ресторанов международной кухни',
          children: 'Kids Planet клуб, детская площадка и анимация',
          tourIncludes: ['Прямой перелет из Астаны', 'Трансфер', 'All Inclusive', 'Страховка']
        },
        rooms: [
          { type: 'Superior Room Partial Sea View', priceBase: 155000 },
          { type: 'Deluxe Swim-Up Room', priceBase: 210000 },
          { type: 'Royal Suite', priceBase: 350000 }
        ]
      },
      {
        id: 'egypt-3',
        name: 'Jaz Aquamarine Resort Hurghada 5*',
        category: '5',
        beach: 'Первая линия, песчаный пляж с лагуной',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        description: 'Семейный рай в Хургаде с 20 открытыми бассейнами и собственным аквапарком.',
        amenities: {
          sport: 'Аквапарк с 22 горками, теннис, виндсерфинг',
          restaurants: '6 ресторанов шведского стола и а-ля карт',
          children: 'Детский клуб, игровые площадки, мини-диско',
          tourIncludes: ['Перелет из Астаны', 'Трансфер', 'All Inclusive', 'Страховка']
        },
        rooms: [
          { type: 'Superior Room Garden View', priceBase: 130000 },
          { type: 'Family Room Pool View', priceBase: 175000 },
          { type: 'Deluxe Suite Sea View', priceBase: 240000 }
        ]
      }
    ]
  },
  {
    id: 'maldives',
    name: 'Мальдивы (Атолы Северный Мале, Ари, Баа)',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1000&q=80',
    description: 'Белоснежные песчаные косы, бирюзовые атолы, бунгало на воде и уединенный релакс.',
    flightFrom: 'Астана (NQZ) — С пересадкой в Дубае / Дохе (Air Astana / Qatar Airways, ~9 часов)',
    hotels: [
      {
        id: 'maldives-1',
        name: 'Soneva Fushi 5* Luxury',
        category: '5',
        beach: 'Частный остров-курорт, пляж премиум-класса',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        description: 'Экологический ультра-роскошный курорт на необитаемом острове с виллами в джунглях и над водой.',
        amenities: {
          sport: 'Дайвинг, обсерватория, снорклинг с биологами, теннис',
          restaurants: '9 ресторанов концепции «органик» и винотека',
          children: 'The Den (один из лучших детских клубов в мире), кинотеатр под открытым небом',
          tourIncludes: ['Перелет Астана - Мале - Астана', 'Трансфер на гидросамолете', 'Завтраки и ужины (HB)', 'Страховка']
        },
        rooms: [
          { type: 'Crusoé Villa with Pool (в джунглях)', priceBase: 750000 },
          { type: 'Water Reserve Villa with Slide', priceBase: 1100000 },
          { type: 'Two Bedroom Sunset Reserve', priceBase: 1650000 }
        ]
      },
      {
        id: 'maldives-2',
        name: 'Kurumba Maldives 5*',
        category: '5',
        beach: 'Первая линия, живописный домашний риф',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        description: 'Первый курорт на Мальдивах всего в 10 минутах на катере от столицы Мале.',
        amenities: {
          sport: 'Теннисные корты, тренажерный зал, каякинг, парусный спорт',
          restaurants: '8 ресторанов мировой кухни, живая музыка',
          children: 'Majaa Kids Club, детские развлекательные программы',
          tourIncludes: ['Перелет из Астаны', 'Трансфер на скоростном катере', 'Завтраки', 'Страховка']
        },
        rooms: [
          { type: 'Superior Beach Bungalow', priceBase: 340000 },
          { type: 'Deluxe Pool Villa', priceBase: 520000 },
          { type: 'Royal Kurumba Residence', priceBase: 890000 }
        ]
      },
      {
        id: 'maldives-3',
        name: 'Bandos Maldives 4*',
        category: '4',
        beach: 'Первая линия, лазурная лагуна',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        description: 'Уютный остров-курорт с пышной растительностью и отличными возможностями для дайвинга.',
        amenities: {
          sport: 'Дайвинг-центр PADI, фитнес, сквош, настольный теннис',
          restaurants: '4 ресторана, 3 бара',
          children: 'Kokko Club детский клуб, детская площадка',
          tourIncludes: ['Перелет из Астаны', 'Трансфер на катере', 'Завтраки', 'Страховка']
        },
        rooms: [
          { type: 'Standard Room', priceBase: 240000 },
          { type: 'Deluxe Beach Villa', priceBase: 380000 },
          { type: 'Jacuzzi Beach Villa', priceBase: 490000 }
        ]
      }
    ]
  },
  {
    id: 'vietnam',
    name: 'Вьетнам (Фукуок / Нячанг / Дананг)',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
    description: 'Живописные бухты, песчаные пляжи Южно-Китайского моря и богатая азиатская культура.',
    flightFrom: 'Астана (NQZ) — Регулярный рейс с пересадкой (~7.5 часов)',
    hotels: [
      {
        id: 'vietnam-1',
        name: 'InterContinental Phu Quoc Long Beach Resort 5*',
        category: '5',
        beach: 'Первая линия, золотой песчаный пляж Лонг-Бич',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        description: 'Роскошный курорт на жемчужном острове Фукуок с панорамными барами на крыше и SPA-центром.',
        amenities: {
          sport: 'Йога на пляже, фитнес 24/7, байдарки, бассейны',
          restaurants: '4 ресторана и бара (включая бар INK 360 на 19 этаже)',
          children: 'Planet Trekkers детский клуб, мастер-классы',
          tourIncludes: ['Перелет Астана - Фукуок - Астана', 'Трансфер', 'Завтраки', 'Страховка']
        },
        rooms: [
          { type: 'Classic Ocean View Room', priceBase: 160000 },
          { type: 'Resort Suite with Balcony', priceBase: 230000 },
          { type: 'Two Bedroom Villa with Pool', priceBase: 410000 }
        ]
      },
      {
        id: 'vietnam-2',
        name: 'JW Marriott Phu Quoc Emerald Bay Resort 5*',
        category: '5',
        beach: 'Первая линия, пляж Кхем',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        description: 'Уникальный отель, спроектированный архитектором Биллом Бенсли в стиле фантастического университета.',
        amenities: {
          sport: 'Водные виды спорта, фитнес, велосипедные прогулки',
          restaurants: '3 ресторана изысканной кухни и бары',
          children: 'Детский клуб, игровая зона',
          tourIncludes: ['Перелет из Астаны', 'Трансфер', 'Завтраки', 'Страховка']
        },
        rooms: [
          { type: 'Emerald Bay View Room', priceBase: 210000 },
          { type: 'Deluxe Turquoise Suite', priceBase: 310000 },
          { type: 'One Bedroom Villa', priceBase: 550000 }
        ]
      },
      {
        id: 'vietnam-3',
        name: 'Vinpearl Resort & Spa Nha Trang Bay 5*',
        category: '5',
        beach: 'Первая линия, остров Хон Че',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        description: 'Курорт с видом на один из красивейших заливных миров мира и доступом в парк VinWonders.',
        amenities: {
          sport: 'Тренажерный зал, аквапарк VinWonders рядом, теннис',
          restaurants: 'Рестораны шведского стола и гриль-бары',
          children: 'Kids Club, детский парк аттракционов',
          tourIncludes: ['Перелет из Астаны', 'Трансфер', 'Завтраки', 'Страховка']
        },
        rooms: [
          { type: 'Deluxe Ocean View', priceBase: 125000 },
          { type: 'Executive Suite', priceBase: 190000 },
          { type: 'Three Bedroom Villa', priceBase: 380000 }
        ]
      }
    ]
  },
  {
    id: 'bali',
    name: 'Индонезия (Бали / Убуд / Нуса-Дуа)',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    description: 'Остров богов: рисовые террасы, древние храмы, серфинг и роскошные виллы в джунглях.',
    flightFrom: 'Астана (NQZ) — Перелет с пересадкой (Emirates / Qatar / Air Astana, ~10 часов)',
    hotels: [
      {
        id: 'bali-1',
        name: 'The Mulia Bali 5*',
        category: '5',
        beach: 'Первая линия, белый пляж Нуса-Дуа',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        description: 'Великолепный курорт на побережье Нуса-Дуа с известными бассейнами с бирюзовой водой.',
        amenities: {
          sport: 'Фитнес-центр, йога, пилатес, аквааэробика',
          restaurants: '5 ресторанов и баров премиум-класса',
          children: 'Mulia Kidz Club, игровая площадка',
          tourIncludes: ['Перелет Астана - Денпасар - Астана', 'Индивидуальный трансфер', 'Завтраки', 'Страховка']
        },
        rooms: [
          { type: 'Mulia Grandeur Room', priceBase: 240000 },
          { type: 'Signature Ocean Court', priceBase: 320000 },
          { type: 'Mulia Villa with Private Pool', priceBase: 580000 }
        ]
      },
      {
        id: 'bali-2',
        name: 'Capella Ubud 5*',
        category: '5',
        beach: 'В самом сердце тропических джунглей Убуда',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        description: 'Уникальный палаточный лагерь класса люкс среди девственных дождевых лесов и рисовых террас.',
        amenities: {
          sport: 'Треккинг в джунглях, йога-павильон, открытый бассейн с соленой водой',
          restaurants: 'Mads Lange и Auriga Wellness рестораны',
          children: 'Программа для подростков и детей в стиле эко-исследователей',
          tourIncludes: ['Перелет из Астаны', 'Трансфер', 'Завтраки', 'Страховка']
        },
        rooms: [
          { type: 'Terrace Tent with Saltwater Pool', priceBase: 390000 },
          { type: 'Valley Tent with Jacuzzi', priceBase: 490000 },
          { type: 'Two Bedroom Camp', priceBase: 780000 }
        ]
      },
      {
        id: 'bali-3',
        name: 'AYANA Resort Bali 5*',
        category: '5',
        beach: 'Первая линия, утесы Джимбарана с видом на океан',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        description: 'Легендарный курорт с культовым баром Rock Bar на скале и множеством бассейнов.',
        amenities: {
          sport: 'Гольф-поле, 12 бассейнов, теннис, фитнес',
          restaurants: '19 ресторанов и баров (включая Rock Bar)',
          children: 'Kids Club, детский бассейн с горками',
          tourIncludes: ['Перелет из Астаны', 'Трансфер', 'Завтраки', 'Страховка']
        },
        rooms: [
          { type: 'Resort View Room', priceBase: 190000 },
          { type: 'Ocean View Room', priceBase: 260000 },
          { type: 'Cliff Villa with Pool', priceBase: 480000 }
        ]
      }
    ]
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Параметры тура
  const [searchQuery, setSearchQuery] = useState('');
  const [flightClass, setFlightClass] = useState('economy'); // economy, business, first
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [mealFilter, setMealFilter] = useState('all'); // all, uai, ai, fb, hb, bb
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [nights, setNights] = useState(7);
  const [departureDate, setDepartureDate] = useState('2026-06-01');

  // Настройки
  const [settings, setSettings] = useState({
    theme: 'light',
    currency: 'KZT',
    language: 'ru',
    notifications: true
  });

  // Модальные окна
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [successVoucher, setSuccessVoucher] = useState(null);

  // Расчет цены
  const calculatePrice = (basePrice) => {
    if (!basePrice) return 0;
    let multiplier = 1;
    if (flightClass === 'business') multiplier = 1.6;
    if (flightClass === 'first') multiplier = 2.4;

    const paxFactor = adults + (childrenCount * 0.7);
    const nightFactor = nights / 7;

    return Math.round(basePrice * multiplier * paxFactor * nightFactor);
  };

  const handleBookTour = (room) => {
    setSelectedRoom(room);
    setCheckoutModal(true);
  };

  const confirmPayment = () => {
    const newBooking = {
      id: 'AST-' + Math.floor(100000 + Math.random() * 900000),
      country: selectedCountry.name,
      hotel: selectedHotel.name,
      room: selectedRoom.type,
      dates: `${departureDate} (${nights} ночей)`,
      pax: `${adults} взр., ${childrenCount} дет.`,
      class: flightClass.toUpperCase(),
      total: calculatePrice(selectedRoom.priceBase),
      dateBooked: new Date().toLocaleDateString()
    };

    setBookings([newBooking, ...bookings]);
    setCheckoutModal(false);
    setSuccessVoucher(newBooking);
  };

  const toggleFavorite = (hotelId) => {
    if (favorites.includes(hotelId)) {
      setFavorites(favorites.filter(id => id !== hotelId));
    } else {
      setFavorites([...favorites, hotelId]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Head>
        <title>Astana Travel | Премиальное турагентство из Астаны</title>
        <meta name="description" content="Лучшие туры с вылетом из Астаны (NQZ) в 7 стран мира" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* Шапка сайта */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActiveTab('home'); setSelectedCountry(null); setSelectedHotel(null); }}>
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Plane className="w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block">Astana Travel</span>
              <span className="text-xs text-blue-600 font-semibold tracking-wider uppercase">Астана (NQZ)</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <button onClick={() => { setActiveTab('home'); setSelectedCountry(null); setSelectedHotel(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'home' && !selectedCountry ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              Главная
            </button>
            <button onClick={() => setActiveTab('favorites')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition ${activeTab === 'favorites' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Избранное ({favorites.length})</span>
            </button>
            <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span>Мои туры ({bookings.length})</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Настройки</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ВКЛАДКА: ГЛАВНАЯ / КАТАЛОГ СТРАН / ОТЕЛЕЙ */}
        {activeTab === 'home' && !selectedCountry && !selectedHotel && (
          <div>
            {/* Геро-блок */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 md:p-14 mb-12 shadow-2xl">
              <div className="absolute inset-0 opacity-45 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
              
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Вылеты напрямую из Международного аэропорта Астаны (NQZ)</span>
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                  Откройте мир с вылетом из столицы
                </h1>
                <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed">
                  Более 100 роскошных отелей в 7 лучших странах мира. Мгновенное бронирование, оплата через Kaspi Pay и официальные билеты прямо в приложении.
                </p>

                {/* Поиск */}
                <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center space-x-2">
                  <Search className="w-5 h-5 text-slate-400 ml-2" />
                  <input 
                    type="text" 
                    placeholder="Поиск по стране, городу или отелю..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm md:text-base focus:outline-none px-2"
                  />
                </div>
              </div>
            </div>

            {/* Сетка стран */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Популярные направления из Астаны</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {COUNTRIES_DATA.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((country) => (
                  <div 
                    key={country.id}
                    onClick={() => setSelectedCountry(country)}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img src={country.image} alt={country.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-bold mb-1">{country.name}</h3>
                        <p className="text-xs text-slate-200 line-clamp-1">{country.description}</p>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-slate-500 mb-4 flex items-center space-x-1.5">
                        <Plane className="w-3.5 h-3.5 text-blue-600" />
                        <span>{country.flightFrom}</span>
                      </p>
                      <button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center space-x-2">
                        <span>Смотреть отели ({country.hotels.length})</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА: СПИСОК ОТЕЛЕЙ В ВЫБРАННОЙ СТРАНЕ */}
        {activeTab === 'home' && selectedCountry && !selectedHotel && (
          <div>
            <button 
              onClick={() => setSelectedCountry(null)}
              className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6 transition"
            >
              <ArrowRight className="w-4 h-4 transform rotate-180" />
              <span>Назад к списку стран</span>
            </button>

            <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-8 text-white mb-10 shadow-lg">
              <h1 className="text-3xl font-bold mb-2">{selectedCountry.name}</h1>
              <p className="text-slate-300 text-sm max-w-2xl mb-4">{selectedCountry.description}</p>
              <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl text-xs text-blue-200 backdrop-blur-sm">
                <Plane className="w-4 h-4 text-blue-400" />
                <span>{selectedCountry.flightFrom}</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Лучшие отели направления</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {selectedCountry.hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                  <div>
                    <div className="relative h-48">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(hotel.id); }}
                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-700 shadow-md hover:bg-white transition"
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(hotel.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                      </button>
                      <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-semibold">
                        ★ {hotel.category} Звезды
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{hotel.name}</h3>
                      <p className="text-xs text-slate-500 mb-3 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{hotel.beach}</span>
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-4">{hotel.description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 block">Цена от</span>
                        <span className="text-lg font-extrabold text-blue-600">
                          {hotel.rooms[0].priceBase.toLocaleString()} ₸
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">за 7 ночей / чел.</span>
                    </div>
                    <button 
                      onClick={() => setSelectedHotel(hotel)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-500/20"
                    >
                      Выбрать тур и номера
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ВКЛАДКА: ДЕТАЛИ ОТЕЛЯ И КОНФИГУРАТОР ТУРА */}
        {activeTab === 'home' && selectedHotel && (
          <div>
            <button 
              onClick={() => setSelectedHotel(null)}
              className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6 transition"
            >
              <ArrowRight className="w-4 h-4 transform rotate-180" />
              <span>Назад к списку отелей</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Левая колонка: Информация об отеле */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <div className="relative h-72 rounded-2xl overflow-hidden mb-6">
                    <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 mb-1">{selectedHotel.name}</h1>
                      <p className="text-sm text-slate-500 flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{selectedHotel.beach}</span>
                      </p>
                    </div>
                    <span className="bg-blue-50 text-blue-600 text-sm font-bold px-3 py-1 rounded-xl">
                      ★ {selectedHotel.category} Звезды
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mb-6">{selectedHotel.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Спорт и активность</h4>
                      <p className="text-xs text-slate-700">{selectedHotel.amenities.sport}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Рестораны и бары</h4>
                      <p className="text-xs text-slate-700">{selectedHotel.amenities.restaurants}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Для детей</h4>
                      <p className="text-xs text-slate-700">{selectedHotel.amenities.children}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Что входит в тур</h4>
                      <ul className="space-y-1">
                        {selectedHotel.amenities.tourIncludes.map((inc, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-center space-x-1.5">
                            <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Выбор номера */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Выберите категорию номера</h3>
                  <div className="space-y-4">
                    {selectedHotel.rooms.map((room, idx) => {
                      const finalRoomPrice = calculatePrice(room.priceBase);
                      return (
                        <div key={idx} className="border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-blue-500 transition">
                          <div className="mb-4 md:mb-0">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{room.type}</h4>
                            <p className="text-xs text-slate-500">Включает проживание, питание и трансфер из аэропорта</p>
                          </div>
                          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                              <span className="text-xs text-slate-400 block">Итого за тур</span>
                              <span className="text-xl font-extrabold text-blue-600">{finalRoomPrice.toLocaleString()} ₸</span>
                            </div>
                            <button 
                              onClick={() => handleBookTour(room)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition"
                            >
                              Забронировать
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Правая колонка: Калькулятор тура и дат */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-28">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Настройка перелета и дат</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Дата вылета из Астаны (NQZ)</label>
                      <input 
                        type="date" 
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Количество ночей: {nights}</label>
                      <input 
                        type="range" 
                        min="3" 
                        max="21" 
                        value={nights}
                        onChange={(e) => setNights(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Взрослые</label>
                        <select 
                          value={adults} 
                          onChange={(e) => setAdults(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none"
                        >
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} взр.</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Дети</label>
                        <select 
                          value={childrenCount} 
                          onChange={(e) => setChildrenCount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none"
                        >
                          {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} дет.</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Класс перелета</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'economy', label: 'Эконом' },
                          { id: 'business', label: 'Бизнес' },
                          { id: 'first', label: 'Первый' }
                        ].map(c => (
                          <button
                            key={c.id}
                            onClick={() => setFlightClass(c.id)}
                            className={`py-2 text-xs font-semibold rounded-xl border transition ${flightClass === c.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА: ИЗБРАННОЕ */}
        {activeTab === 'favorites' && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Избранные отели ({favorites.length})</h1>
            {favorites.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">У вас пока нет сохраненных отелей</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COUNTRIES_DATA.flatMap(c => c.hotels).filter(h => favorites.includes(h.id)).map(hotel => (
                  <div key={hotel.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="relative h-48">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 mb-1">{hotel.name}</h3>
                      <p className="text-xs text-slate-500 mb-4">{hotel.beach}</p>
                      <button 
                        onClick={() => { setSelectedCountry(COUNTRIES_DATA.find(c => c.hotels.some(h => h.id === hotel.id))); setSelectedHotel(hotel); setActiveTab('home'); }}
                        className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-semibold"
                      >
                        Подробнее о туре
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ВКЛАДКА: МОИ ТУРЫ / ЗАКАЗЫ */}
        {activeTab === 'bookings' && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Мои забронированные туры ({bookings.length})</h1>
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">У вас пока нет оформленных туров</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{b.id}</span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">{b.hotel}</h3>
                      <p className="text-xs text-slate-500">{b.country} • {b.room}</p>
                      <p className="text-xs text-slate-600 mt-1">Даты: {b.dates} | Пассажиры: {b.pax} | Класс: {b.class}</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <span className="text-lg font-extrabold text-blue-600 block">{b.total.toLocaleString()} ₸</span>
                      <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg inline-block mt-1">Оплачено через Kaspi Pay</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ВКЛАДКА: НАСТРОЙКИ */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Настройки приложения</h1>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Валюта отображения</label>
                <select 
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                >
                  <option value="KZT">Казахстанский тенге (₸)</option>
                  <option value="USD">Доллар США ($)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Язык интерфейса</label>
                <select 
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                >
                  <option value="ru">Русский</option>
                  <option value="kz">Қазақша</option>
                </select>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* МОДАЛЬНОЕ ОКНО ОПЛАТЫ КАЗПИ / ЭКВАЙРИНГ */}
      {checkoutModal && selectedHotel && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setCheckoutModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg shadow-red-500/30">
                K
              </div>
              <h2 className="text-xl font-bold text-slate-900">Kaspi Pay / Оплата тура</h2>
              <p className="text-xs text-slate-500 mt-1">Безопасный банковский эквайринг (Астана)</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 mb-6 text-xs text-slate-700">
              <div className="flex justify-between"><span className="text-slate-500">Отель:</span><span className="font-bold">{selectedHotel.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Номер:</span><span className="font-bold">{selectedRoom.type}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Вылет:</span><span className="font-bold">Астана (NQZ) → {departureDate}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-blue-600">
                <span>К оплате:</span>
                <span>{calculatePrice(selectedRoom.priceBase).toLocaleString()} ₸</span>
              </div>
            </div>

            <button 
              onClick={confirmPayment}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-red-500/30 transition flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Оплатить через Kaspi / Рассрочка 0-0-12</span>
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО УСПЕШНОГО ВАУЧЕРА */}
      {successVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Тур успешно оформлен!</h2>
            <p className="text-xs text-slate-500 mb-6">Электронные авиабилеты и ваучер отеля отправлены в ваш личный кабинет.</p>

            <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-1.5 text-xs text-slate-700 mb-6">
              <p><b>Номер брони:</b> {successVoucher.id}</p>
              <p><b>Направление:</b> {successVoucher.country}</p>
              <p><b>Отель:</b> {successVoucher.hotel}</p>
              <p><b>Сумма:</b> {successVoucher.total.toLocaleString()} ₸</p>
            </div>

            <button 
              onClick={() => setSuccessVoucher(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-sm font-semibold transition"
            >
              Отлично, вернуться в приложение
            </button>
          </div>
        </div>
      )}

    </div>
  );
}