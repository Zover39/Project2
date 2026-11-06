import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Plane, Heart, ShoppingBag, Settings, Search, 
  ShieldCheck, CheckCircle, ArrowRight, Star, 
  X, Check, QrCode, Compass, Umbrella, RotateCcw, Sparkles
} from 'lucide-react';

const COUNTRIES_CONFIG = [
  { name: "ОАЭ", city: "Дубай / Абу-Даби", imgBase: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80" },
  { name: "Турция", city: "Анталья / Стамбул", imgBase: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80" },
  { name: "Таиланд", city: "Пхукет / Паттайя", imgBase: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80" },
  { name: "Египет", city: "Шарм-эль-Шейх / Хургада", imgBase: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80" },
  { name: "Мальдивы", city: "Атолы Мальдив", imgBase: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80" },
  { name: "Вьетнам", city: "Нячанг / Фукуок", imgBase: "https://images.unsplash.com/photo-1509564132473-195977d46816?auto=format&fit=crop&w=800&q=80" },
  { name: "Индонезия", city: "Бали / Убуд", imgBase: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80" }
];

const PREFIXES = ["Grand", "Royal", "Palace", "Luxury", "Resort & Spa", "Sunset", "Beach Club", "Marina", "Empire", "Oasis", "Panorama", "Coral", "Paradise", "Imperial", "Sapphire"];
const MEALS = ["Ultra All Inclusive", "All Inclusive", "Full Board", "Half Board", "Breakfast"];
const BEACHES = ["Песчаный пляж (1-я линия)", "Коралловый риф", "Собственный песчаный пляж", "Пляж в шаговой доступности"];

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

const HOTELS_DATA = generateHotels();

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedMeal, setSelectedMeal] = useState('all');
  const [selectedStars, setSelectedStars] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [activeHotel, setActiveHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [flightClass, setFlightClass] = useState(1.0);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [nights, setNights] = useState(7);
  const [departureDate, setDepartureDate] = useState('2026-06-01');

  const [checkoutModal, setCheckoutModal] = useState(false);
  const [voucherModal, setVoucherModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    setMounted(true);
    const savedFavs = localStorage.getItem('astana_favs');
    const savedBookings = localStorage.getItem('astana_bookings');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    if (savedBookings) setBookings(JSON.parse(savedBookings));
  }, []);

  const formatPrice = (num) => {
    if (!mounted) return num.toString();
    return num.toLocaleString('ru-RU');
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleFavorite = (id) => {
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(item => item !== id);
      showToast('Удалено из избранного');
    } else {
      updated = [...favorites, id];
      showToast('Добавлено в избранное ❤️');
    }
    setFavorites(updated);
    localStorage.setItem('astana_favs', JSON.stringify(updated));
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.setItem('astana_favs', JSON.stringify([]));
    showToast('Избранное очищено');
  };

  const filteredHotels = HOTELS_DATA.filter(h => {
    const matchCountry = selectedCountry === 'all' || h.country === selectedCountry;
    const matchMeal = selectedMeal === 'all' || h.meal.includes(selectedMeal);
    const matchStars = selectedStars === 'all' || (selectedStars === 'sandy' ? h.beach.includes('Песчаный') : h.stars.toString() === selectedStars);
    const matchQuery = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.city.toLowerCase().includes(searchQuery.toLowerCase()) || h.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCountry && matchMeal && matchStars && matchQuery;
  });

  const calculateFinalPrice = () => {
    if (!activeHotel || !selectedRoom) return 0;
    const base = activeHotel.price;
    const roomExtra = selectedRoom.priceExtra;
    const nightsFactor = nights / 7;
    const paxFactor = (adults * 0.5) + (childrenCount * 0.35);
    return Math.round((base + roomExtra) * nightsFactor * paxFactor * flightClass);
  };

  const handlePay = () => {
    const total = calculateFinalPrice();
    const newBooking = {
      id: 'AST-' + Math.floor(100000 + Math.random() * 900000),
      hotelName: activeHotel.name,
      country: activeHotel.country,
      city: activeHotel.city,
      image: activeHotel.image,
      roomName: selectedRoom.name,
      date: departureDate,
      nights: nights,
      passengers: `${adults} взр. ${childrenCount > 0 ? '+ ' + childrenCount + ' дет.' : ''}`,
      totalStr: formatPrice(total) + ' ₸',
      flightRoute: activeHotel.flightRoute,
      createdAt: new Date().toLocaleDateString('ru-RU')
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    localStorage.setItem('astana_bookings', JSON.stringify(updated));
    setCheckoutModal(false);
    setActiveHotel(null);
    showToast('Оплата прошла успешно! Билет выпущен.');
    setActiveTab('bookings');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      <Head>
        <title>Astana Travel — Премиум Туры из Астаны (NQZ)</title>
      </Head>

      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white text-xs sm:text-sm py-2 px-4 text-center font-semibold flex items-center justify-center gap-2 shadow-sm">
        <Plane className="w-4 h-4" />
        <span>Прямые рейсы из Международного аэропорта Астаны (NQZ) в 7+ стран | Рассрочка Kaspi Red 0-0-12</span>
      </div>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-500/30">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-indigo-600">ASTANA TRAVEL</h1>
              <p className="text-xs text-slate-500 font-semibold">Туроператор №1 в Астане (NQZ)</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <button onClick={() => setActiveTab('catalog')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'catalog' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              Каталог туров
            </button>
            <button onClick={() => setActiveTab('favorites')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 relative ${activeTab === 'favorites' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Избранное</span>
              {favorites.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${activeTab === 'bookings' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
              <span>Мои билеты ({bookings.length})</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white p-6 sm:p-12 shadow-2xl">
              <div className="relative z-10 max-w-3xl space-y-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-semibold border border-indigo-400/20">
                  <Sparkles className="w-3.5 h-3.5" /> Прямой вылет из аэропорта Астаны (NQZ)
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Лучшие курорты мира с вылетом из Астаны
                </h2>
                <p className="text-slate-300 text-sm sm:text-base">
                  105 эксклюзивных отелей, настраиваемый конструктор дат и класса перелета, рассрочка и билеты прямо в смартфоне.
                </p>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-200 mb-1">Поиск</label>
                    <input type="text" placeholder="Отель или город..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-200 mb-1">Страна</label>
                    <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none">
                      <option value="all">Все страны (105 туров)</option>
                      <option value="ОАЭ">ОАЭ</option>
                      <option value="Турция">Турция</option>
                      <option value="Таиланд">Таиланд</option>
                      <option value="Египет">Египет</option>
                      <option value="Мальдивы">Мальдивы</option>
                      <option value="Вьетнам">Вьетнам</option>
                      <option value="Индонезия">Индонезия</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-200 mb-1">Тип питания</label>
                    <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)} className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none">
                      <option value="all">Любое питание</option>
                      <option value="Ultra All Inclusive">Ultra All Inclusive</option>
                      <option value="All Inclusive">All Inclusive</option>
                      <option value="Full Board">Full Board</option>
                      <option value="Half Board">Half Board</option>
                      <option value="Breakfast">Завтраки (BB)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => { setSelectedCountry('all'); setSelectedMeal('all'); setSelectedStars('all'); setSearchQuery(''); }} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" /> Сбросить
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {['all', 'ОАЭ', 'Турция', 'Таиланд', 'Египет', 'Мальдивы', 'Вьетнам', 'Индонезия'].map(c => (
                <button key={c} onClick={() => setSelectedCountry(c)} className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition border ${selectedCountry === c ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-500'}`}>
                  {c === 'all' ? '🌍 Все направления' : c}
                </button>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Каталог туров и отелей</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-600 font-bold">{filteredHotels.length} отелей</span>
                </h3>
                <span className="text-xs text-slate-500">Цены в тенге (₸) с перелетом из Астаны</span>
              </div>

              {filteredHotels.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
                  <Plane className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-800">Отели не найдены</h4>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHotels.map(h => {
                    const isFav = favorites.includes(h.id);
                    return (
                      <div key={h.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between group">
                        <div>
                          <div className="relative h-56 overflow-hidden">
                            <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm">
                              {h.country}, {h.city}
                            </div>
                            <button onClick={() => toggleFavorite(h.id)} className="absolute top-3 right-3 w-10 h-10 rounded-xl bg-white/90 text-rose-500 flex items-center justify-center shadow hover:scale-110 transition">
                              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
                            </button>
                            <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
                              <Star className="w-3.5 h-3.5 fill-slate-950" /> {h.rating} ({h.reviewsCount})
                            </div>
                          </div>

                          <div className="p-6 space-y-3">
                            <div className="flex items-center justify-between text-xs text-indigo-600 font-bold">
                              <span>{h.meal}</span>
                              <span>{'★'.repeat(h.stars)}</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 line-clamp-1">{h.name}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Umbrella className="w-3.5 h-3.5 text-amber-500" /> {h.beach}
                            </p>
                          </div>
                        </div>

                        <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                          <div>
                            <span className="block text-[10px] text-slate-400 font-semibold uppercase">От (2 чел)</span>
                            <span className="text-xl font-black text-slate-900">{formatPrice(h.price)} ₸</span>
                          </div>
                          <button onClick={() => { setActiveHotel(h); setSelectedRoom(h.rooms[0]); }} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5">
                            <span>Выбрать тур</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold">Избранные отели ({favorites.length})</h2>
              {favorites.length > 0 && (
                <button onClick={clearFavorites} className="text-xs text-rose-500 font-bold hover:underline">Очистить всё</button>
              )}
            </div>
            {favorites.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white rounded-3xl border">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-lg font-bold text-slate-800">В избранном пока пусто</h4>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {HOTELS_DATA.filter(h => favorites.includes(h.id)).map(h => (
                  <div key={h.id} className="bg-white rounded-3xl p-5 border shadow-sm space-y-3">
                    <div className="relative h-44 rounded-2xl overflow-hidden">
                      <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                      <button onClick={() => toggleFavorite(h.id)} className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white text-rose-500 flex items-center justify-center shadow">
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-600">{h.country}, {h.city}</span>
                      <h4 className="font-bold text-slate-900 text-base">{h.name}</h4>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-black text-slate-900">{formatPrice(h.price)} ₸</span>
                      <button onClick={() => { setActiveHotel(h); setSelectedRoom(h.rooms[0]); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Забронировать</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Мои бронирования и билеты ({bookings.length})</h2>
            {bookings.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white rounded-3xl border">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-lg font-bold text-slate-800">У вас пока нет оформленных туров</h4>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-3xl border p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <img src={b.image} alt={b.hotelName} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Оплачено • Бронь #{b.id}</span>
                        <h4 className="text-lg font-bold text-slate-900">{b.hotelName}</h4>
                        <p className="text-xs text-slate-500">{b.country} • {b.roomName} ({b.passengers})</p>
                        <p className="text-xs text-slate-600">Даты: <b>{b.date}</b> ({b.nights} ночей)</p>
                      </div>
                    </div>
                    <div className="text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                      <span className="text-xl font-black text-slate-900 block">{b.totalStr}</span>
                      <button onClick={() => setVoucherModal(b)} className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 w-full md:w-auto">
                        <QrCode className="w-4 h-4" /> Электронный билет
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {activeHotel && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border p-6 sm:p-8 space-y-6 relative">
            <button onClick={() => setActiveHotel(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <img src={activeHotel.image} alt={activeHotel.name} className="w-full md:w-72 h-48 rounded-2xl object-cover" />
              <div className="space-y-2">
                <span className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-md font-bold">{activeHotel.country} • {activeHotel.city}</span>
                <h3 className="text-2xl font-black text-slate-900">{activeHotel.name}</h3>
                <p className="text-xs text-slate-500">Питание: <b>{activeHotel.meal}</b> | Пляж: {activeHotel.beach}</p>
                <p className="text-xs text-indigo-600 font-medium">{activeHotel.flightRoute}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-2xl space-y-2 border border-indigo-100">
                  <h4 className="font-bold text-xs text-indigo-600 uppercase tracking-wider">Что входит в стоимость:</h4>
                  <ul className="text-xs space-y-1 text-slate-700 list-disc list-inside">
                    {activeHotel.tourIncludes.map((inc, i) => <li key={i}>{inc}</li>)}
                  </ul>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-sm text-slate-900">Конструктор поездки из Астаны</h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Категория номера:</label>
                  <select onChange={(e) => setSelectedRoom(activeHotel.rooms[e.target.value])} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold">
                    {activeHotel.rooms.map((r, idx) => (
                      <option key={idx} value={idx}>{r.name} (+{formatPrice(r.priceExtra)} ₸)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Класс перелета:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setFlightClass(1.0)} className={`py-2 text-xs font-bold rounded-xl border ${flightClass === 1.0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-300'}`}>Эконом</button>
                    <button onClick={() => setFlightClass(1.6)} className={`py-2 text-xs font-bold rounded-xl border ${flightClass === 1.6 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-300'}`}>Бизнес</button>
                    <button onClick={() => setFlightClass(2.5)} className={`py-2 text-xs font-bold rounded-xl border ${flightClass === 2.5 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-300'}`}>Первый</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Взрослые:</label>
                    <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs">
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n} взр.</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Дети:</label>
                    <select value={childrenCount} onChange={(e) => setChildrenCount(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs">
                      {[0,1,2].map(n => <option key={n} value={n}>{n} дет.</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Дата вылета из NQZ:</label>
                    <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ночей: {nights}</label>
                    <input type="range" min="3" max="21" value={nights} onChange={(e) => setNights(Number(e.target.value))} className="w-full accent-indigo-600" />
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Итого к оплате</span>
                    <span className="text-2xl font-black text-slate-900">{formatPrice(calculateFinalPrice())} ₸</span>
                  </div>
                  <button onClick={() => setCheckoutModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-emerald-600/30">
                    Оплатить тур
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {checkoutModal && activeHotel && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center relative">
            <div className="w-16 h-16 bg-red-600 text-white rounded-2xl mx-auto flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-red-600/30">K</div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Kaspi Pay / Банковский эквайринг</h3>
              <p className="text-xs text-slate-500">Оплата тура в {activeHotel.name}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Направление:</span><span className="font-bold">{activeHotel.country}, {activeHotel.city}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Номер:</span><span className="font-bold">{selectedRoom.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Дата вылета из NQZ:</span><span className="font-bold">{departureDate} ({nights} ночей)</span></div>
              <div className="flex justify-between pt-2 border-t font-bold text-slate-900">
                <span>К списанию:</span>
                <span className="text-red-600 text-sm">{formatPrice(calculateFinalPrice())} ₸</span>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={handlePay} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Подтвердить оплату через Kaspi QR
              </button>
              <button onClick={() => setCheckoutModal(false)} className="w-full bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-xl text-xs">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {voucherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
            <button onClick={() => setVoucherModal(null)} className="absolute top-5 right-5 text-slate-400">
              <X className="w-6 h-6" />
            </button>
            <div className="space-y-1 border-b pb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Astana Travel Electronic Ticket</span>
              <h3 className="text-xl font-black text-slate-900">Посадочный ваучер #{voucherModal.id}</h3>
            </div>
            <div className="space-y-2 text-xs text-left">
              <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Отель:</span><span className="font-bold">{voucherModal.hotelNode || voucherModal.hotelName}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Номер:</span><span className="font-bold">{voucherModal.roomName}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Маршрут:</span><span className="font-bold">{voucherModal.flightRoute}</span></div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-center gap-4 border">
              <QrCode className="w-20 h-20 text-slate-900" />
              <div className="text-left space-y-1">
                <span className="text-xs font-bold text-slate-900 block">QR-код посадочного талона</span>
                <p className="text-[11px] text-slate-500">Предъявите в аэропорту Астаны (NQZ).</p>
              </div>
            </div>
            <button onClick={() => setVoucherModal(null)} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm">Закрыть</button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}