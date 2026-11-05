import React, { useState } from 'react';
import Head from 'next/head';
import { 
  Plane, Heart, ShoppingBag, Settings, 
  Search, ShieldCheck, CheckCircle, ArrowRight, MapPin, 
  Sparkles, X, Check, SlidersHorizontal 
} from 'lucide-react';

const COUNTRIES_DATA = [
  {
    id: 'uae',
    name: 'ОАЭ (Дубай / Абу-Даби)',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80',
    description: 'Современные мегаполисы, небоскребы, роскошные пляжи и шопинг мирового уровня.',
    flightFrom: 'Астана (NQZ) — Прямой рейс (~4.5 часа)',
    hotels: [
      {
        id: 'uae-1',
        name: 'Burj Al Arab Jumeirah 5*',
        category: '5',
        beach: 'Первая линия, частный песчаный пляж',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        description: 'Легендарный отель-парус с роскошными люксами и непревзойденным сервисом.',
        amenities: {
          sport: 'Фитнес-центр, йога на пляже, теннисный корт',
          restaurants: '7 ресторанов изысканной кухни, 4 бара',
          children: 'Детский клуб Sinbad’s, анимация, бассейн с горками',
          tourIncludes: ['Авиаперелет Астана - Дубай - Астана', 'VIP-трансфер', 'Медицинская страховка']
        },
        rooms: [
          { type: 'Deluxe Suite (вид на море)', priceBase: 450000 },
          { type: 'Panoramic View Suite', priceBase: 620000 },
          { type: 'Presidential Suite', priceBase: 950000 }
        ]
      },
      {
        id: 'uae-2',
        name: 'Atlantis, The Palm 5*',
        category: '5',
        beach: 'Первая линия, Palm Island',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        description: 'Знаменитый курорт на искусственном острове с аквапарком Aquaventure.',
        amenities: {
          sport: 'Дайвинг, аквапарк, тренажерный зал',
          restaurants: '29 ресторанов и баров мирового класса',
          children: 'Клуб Aquaventure, детская игровая площадка',
          tourIncludes: ['Прямой перелет из Астаны', 'Трансфер', 'Вход в аквапарк']
        },
        rooms: [
          { type: 'Ocean King Room', priceBase: 280000 },
          { type: 'Palm Pool Club Room', priceBase: 340000 },
          { type: 'Family Suite', priceBase: 580000 }
        ]
      }
    ]
  },
  {
    id: 'turkey',
    name: 'Турция (Анталийское побережье)',
    image: 'https://images.unsplash.com/photo-1524231757913-215fce3a9b5a?auto=format&fit=crop&w=1000&q=80',
    description: 'Идеальный пляжный отдых, сосновые леса Таврских гор и система All Inclusive.',
    flightFrom: 'Астана (NQZ) — Прямой рейс (~5 часов)',
    hotels: [
      {
        id: 'turkey-1',
        name: 'Maxx Royal Kemer Resort 5*',
        category: '5',
        beach: 'Первая линия, песчано-галечный пляж',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        description: 'Элитный курорт среди сосновых холмов с виллами и безупречным сервисом.',
        amenities: {
          sport: 'Теннисный корт, футбол, водные лыжи',
          restaurants: '5 ресторанов, 11 баров',
          children: 'Maxxi Land клуб, лунапарк',
          tourIncludes: ['Перелет Астана - Анталья - Астана', 'Трансфер', 'Ultra All Inclusive']
        },
        rooms: [
          { type: 'Suite Main Building', priceBase: 260000 },
          { type: 'Terrace Suite (с джакузи)', priceBase: 350000 }
        ]
      }
    ]
  },
  {
    id: 'thailand',
    name: 'Таиланд (Пхукет)',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    description: 'Тропический рай с бирюзовыми лагунами и экзотической культурой.',
    flightFrom: 'Астана (NQZ) — С пересадкой в Алматы (~7.5 часов)',
    hotels: [
      {
        id: 'thailand-1',
        name: 'Rosewood Phuket 5*',
        category: '5',
        beach: 'Первая линия, пляж Изумрудной бухты',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        description: 'Уединенный роскошный курорт на берегу Андаманского моря.',
        amenities: {
          sport: 'Йога на закате, фитнес-центр, каякинг',
          restaurants: '4 премиум ресторана',
          children: 'Rosewood Explorers детский клуб',
          tourIncludes: ['Перелет Астана - Пхукет', 'Трансфер', 'Завтраки']
        },
        rooms: [
          { type: 'Ocean Pool Pavilion', priceBase: 320000 },
          { type: 'Beachfront Pool Villa', priceBase: 480000 }
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [flightClass, setFlightClass] = useState('economy');
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [nights, setNights] = useState(7);
  const [departureDate, setDepartureDate] = useState('2026-06-01');

  const [checkoutModal, setCheckoutModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [successVoucher, setSuccessVoucher] = useState(null);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-all duration-300">
      <Head>
        <title>Astana Travel | Премиальное турагентство</title>
      </Head>

      {/* Навигация с анимацией */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => { setActiveTab('home'); setSelectedCountry(null); setSelectedHotel(null); }}>
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition duration-300">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block">Astana Travel</span>
              <span className="text-[11px] text-blue-600 font-bold tracking-wider uppercase">Вылеты из Астаны (NQZ)</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-2">
            <button onClick={() => { setActiveTab('home'); setSelectedCountry(null); setSelectedHotel(null); }} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-300 ${activeTab === 'home' && !selectedCountry ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
              Главная
            </button>
            <button onClick={() => setActiveTab('favorites')} className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition duration-300 ${activeTab === 'favorites' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Избранное ({favorites.length})</span>
            </button>
            <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition duration-300 ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span>Мои туры ({bookings.length})</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Контент с плавной анимацией появления */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        
        {activeTab === 'home' && !selectedCountry && !selectedHotel && (
          <div>
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 md:p-14 mb-12 shadow-2xl">
              <div className="absolute inset-0 opacity-40 bg-cover bg-center transition-transform duration-1000 scale-105" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
              
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Премиальный сервис из Международного аэропорта Астаны</span>
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                  Путешествуйте с комфортом из столицы
                </h1>
                <p className="text-slate-300 text-sm md:text-base mb-8 leading-relaxed">
                  Лучшие курорты мира, моментальное бронирование, оплата через Kaspi Pay и официальные билеты в вашем смартфоне.
                </p>

                <div className="bg-white p-3 rounded-2xl shadow-2xl flex items-center space-x-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500">
                  <Search className="w-5 h-5 text-slate-400 ml-2" />
                  <input 
                    type="text" 
                    placeholder="Поиск по направлениям и отелям..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm md:text-base focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Популярные направления</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COUNTRIES_DATA.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((country) => (
                <div 
                  key={country.id}
                  onClick={() => setSelectedCountry(country)}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img src={country.image} alt={country.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{country.name}</h3>
                      <p className="text-xs text-slate-200 line-clamp-1">{country.description}</p>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-500 mb-4 flex items-center space-x-2">
                      <Plane className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>{country.flightFrom}</span>
                    </p>
                    <button className="w-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white py-3 rounded-2xl text-sm font-semibold transition duration-300 flex items-center justify-center space-x-2">
                      <span>Смотреть отели</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* СПИСОК ОТЕЛЕЙ В СТРАНЕ */}
        {activeTab === 'home' && selectedCountry && !selectedHotel && (
          <div className="animate-in fade-in duration-300">
            <button 
              onClick={() => setSelectedCountry(null)}
              className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6 transition"
            >
              <ArrowRight className="w-4 h-4 transform rotate-180" />
              <span>Назад к странам</span>
            </button>

            <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-8 text-white mb-10 shadow-xl">
              <h1 className="text-3xl font-bold mb-2">{selectedCountry.name}</h1>
              <p className="text-slate-300 text-sm max-w-2xl mb-4">{selectedCountry.description}</p>
              <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl text-xs text-blue-200 backdrop-blur-md">
                <Plane className="w-4 h-4 text-blue-400" />
                <span>{selectedCountry.flightFrom}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {selectedCountry.hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between">
                  <div>
                    <div className="relative h-52">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(hotel.id); }}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-700 shadow-md hover:scale-110 transition duration-300"
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(hotel.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                      </button>
                      <span className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full font-bold">
                        ★ {hotel.category} Звезд
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{hotel.name}</h3>
                      <p className="text-xs text-slate-500 mb-3 flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{hotel.beach}</span>
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2">{hotel.description}</p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold block">Цена от</span>
                        <span className="text-xl font-extrabold text-blue-600">
                          {hotel.rooms[0].priceBase.toLocaleString()} ₸
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">за 7 ночей</span>
                    </div>
                    <button 
                      onClick={() => setSelectedHotel(hotel)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-sm font-semibold transition duration-300 shadow-lg shadow-blue-500/20"
                    >
                      Выбрать номера
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ДЕТАЛИ ОТЕЛЯ И КОНФИГУРАТОР */}
        {activeTab === 'home' && selectedHotel && (
          <div className="animate-in fade-in duration-300">
            <button 
              onClick={() => setSelectedHotel(null)}
              className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6 transition"
            >
              <ArrowRight className="w-4 h-4 transform rotate-180" />
              <span>Назад к списку отелей</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                  <div className="relative h-80 rounded-2xl overflow-hidden mb-6 shadow-md">
                    <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" />
                  </div>

                  <h1 className="text-2xl font-bold text-slate-900 mb-2">{selectedHotel.name}</h1>
                  <p className="text-sm text-slate-500 flex items-center space-x-2 mb-4">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{selectedHotel.beach}</span>
                  </p>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">{selectedHotel.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Спорт</h4>
                      <p className="text-xs text-slate-700">{selectedHotel.amenities.sport}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Рестораны</h4>
                      <p className="text-xs text-slate-700">{selectedHotel.amenities.restaurants}</p>
                    </div>
                  </div>
                </div>

                {/* Выбор номеров */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Доступные номера</h3>
                  <div className="space-y-4">
                    {selectedHotel.rooms.map((room, idx) => {
                      const finalPrice = calculatePrice(room.priceBase);
                      return (
                        <div key={idx} className="border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-blue-500 transition duration-300 bg-slate-50/50">
                          <div className="mb-4 md:mb-0">
                            <h4 className="font-bold text-slate-900 text-base mb-1">{room.type}</h4>
                            <p className="text-xs text-slate-500">Включает перелет из Астаны, трансфер и проживание</p>
                          </div>
                          <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Итого</span>
                              <span className="text-xl font-extrabold text-blue-600">{finalPrice.toLocaleString()} ₸</span>
                            </div>
                            <button 
                              onClick={() => handleBookTour(room)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 transition duration-300"
                            >
                              Бронировать
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Сайдбар калькулятора */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm sticky top-28">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
                    <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                    <span>Параметры тура</span>
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-2">Дата вылета из Астаны (NQZ)</label>
                      <input 
                        type="date" 
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-2">Ночей: {nights}</label>
                      <input 
                        type="range" 
                        min="3" 
                        max="21" 
                        value={nights}
                        onChange={(e) => setNights(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">Взрослые</label>
                        <select 
                          value={adults} 
                          onChange={(e) => setAdults(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none"
                        >
                          {[1,2,3,4].map(n => <option key={n} value={n}>{n} взр.</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">Дети</label>
                        <select 
                          value={childrenCount} 
                          onChange={(e) => setChildrenCount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none"
                        >
                          {[0,1,2,3].map(n => <option key={n} value={n}>{n} дет.</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-2">Класс перелета</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'economy', label: 'Эконом' },
                          { id: 'business', label: 'Бизнес' },
                          { id: 'first', label: 'Первый' }
                        ].map(c => (
                          <button
                            key={c.id}
                            onClick={() => setFlightClass(c.id)}
                            className={`py-2.5 text-xs font-bold rounded-xl transition duration-300 ${flightClass === c.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
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

        {/* ИЗБРАННОЕ */}
        {activeTab === 'favorites' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Избранные отели ({favorites.length})</h1>
            {favorites.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold">Список избранного пуст</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COUNTRIES_DATA.flatMap(c => c.hotels).filter(h => favorites.includes(h.id)).map(hotel => (
                  <div key={hotel.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="relative h-48">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-slate-900 mb-1">{hotel.name}</h3>
                      <p className="text-xs text-slate-500 mb-4">{hotel.beach}</p>
                      <button 
                        onClick={() => { setSelectedCountry(COUNTRIES_DATA.find(c => c.hotels.some(h => h.id === hotel.id))); setSelectedHotel(hotel); setActiveTab('home'); }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-2xl text-xs font-bold transition"
                      >
                        Открыть тур
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* МОИ ТУРЫ */}
        {activeTab === 'bookings' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Забронированные туры ({bookings.length})</h1>
            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold">У вас пока нет оформленных поездок</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">{b.id}</span>
                      <h3 className="text-lg font-bold text-slate-900 mt-3">{b.hotel}</h3>
                      <p className="text-xs text-slate-500 mt-1">{b.country} • {b.room}</p>
                      <p className="text-xs text-slate-600 mt-1">Даты: {b.dates} | Пассажиры: {b.pax} | Класс: {b.class}</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <span className="text-xl font-extrabold text-blue-600 block">{b.total.toLocaleString()} ₸</span>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-xl inline-block mt-2">Оплачено через Kaspi Pay</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* МОДАЛЬНОЕ ОКНО ОПЛАТЫ КАСПИ */}
      {checkoutModal && selectedHotel && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
            <button onClick={() => setCheckoutModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-500 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl mb-3 shadow-lg shadow-red-500/30">
                K
              </div>
              <h2 className="text-xl font-bold text-slate-900">Kaspi Pay / Эквайринг</h2>
              <p className="text-xs text-slate-500 mt-1">Безопасная оплата туров с вылетом из Астаны</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 mb-6 text-xs text-slate-700">
              <div className="flex justify-between"><span className="text-slate-500">Отель:</span><span className="font-bold">{selectedHotel.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Номер:</span><span className="font-bold">{selectedRoom.type}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Вылет:</span><span className="font-bold">Астана (NQZ) → {departureDate}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-blue-600">
                <span>К оплате:</span>
                <span>{calculatePrice(selectedRoom.priceBase).toLocaleString()} ₸</span>
              </div>
            </div>

            <button 
              onClick={confirmPayment}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-red-500/30 transition duration-300 flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Оплатить через Kaspi / 0-0-12</span>
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО УСПЕХА */}
      {successVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Тур успешно оформлен!</h2>
            <p className="text-xs text-slate-500 mb-6">Электронные авиабилеты и ваучер успешно загружены в ваш профиль.</p>

            <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-1.5 text-xs text-slate-700 mb-6">
              <p><b>Код брони:</b> {successVoucher.id}</p>
              <p><b>Направление:</b> {successVoucher.country}</p>
              <p><b>Отель:</b> {successVoucher.hotel}</p>
              <p><b>Сумма:</b> {successVoucher.total.toLocaleString()} ₸</p>
            </div>

            <button 
              onClick={() => setSuccessVoucher(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl text-sm font-bold transition duration-300"
            >
              Отлично
            </button>
          </div>
        </div>
      )}

    </div>
  );
}