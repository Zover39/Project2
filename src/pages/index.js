import React, { useState } from 'react';
import Head from 'next/head';

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
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }} className="min-h-screen bg-slate-50 text-slate-800">
      <Head>
        <title>Astana Travel | Турагентство из Астаны</title>
      </Head>

      {/* Навигация */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActiveTab('home'); setSelectedCountry(null); setSelectedHotel(null); }}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
              ✈
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 block">Astana Travel</span>
              <span className="text-xs text-blue-600 font-semibold">Астана (NQZ)</span>
            </div>
          </div>

          <nav className="flex items-center space-x-2">
            <button onClick={() => { setActiveTab('home'); setSelectedCountry(null); setSelectedHotel(null); }} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === 'home' && !selectedCountry ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              Главная
            </button>
            <button onClick={() => setActiveTab('favorites')} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-1 ${activeTab === 'favorites' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span>❤️ Избранное ({favorites.length})</span>
            </button>
            <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-1 ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span>🛍 Мои туры ({bookings.length})</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'home' && !selectedCountry && !selectedHotel && (
          <div>
            <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-12 mb-10 shadow-xl">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                ✨ Вылеты из Международного аэропорта Астаны
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
                Лучшие туры с вылетом из столицы
              </h1>
              <p className="text-slate-300 text-sm md:text-base mb-6 max-w-xl">
                Бронируйте отели, настраивайте даты вылета и оплачивайте через Kaspi Pay с мгновенным получением билетов.
              </p>
              <input 
                type="text" 
                placeholder="Поиск по направлениям..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-96 bg-white text-slate-900 placeholder-slate-400 text-sm px-4 py-3 rounded-xl focus:outline-none shadow-lg"
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-6">Доступные направления</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COUNTRIES_DATA.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((country) => (
                <div 
                  key={country.id}
                  onClick={() => setSelectedCountry(country)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={country.image} alt={country.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{country.name}</h3>
                      <p className="text-xs text-slate-500 mb-4">{country.flightFrom}</p>
                    </div>
                    <button className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition">
                      Смотреть отели
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'home' && selectedCountry && !selectedHotel && (
          <div>
            <button onClick={() => setSelectedCountry(null)} className="text-xs font-bold text-slate-600 hover:text-blue-600 mb-4 block">
              ← Назад к странам
            </button>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{selectedCountry.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedCountry.hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="h-48 relative">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(hotel.id); }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg shadow"
                      >
                        {favorites.includes(hotel.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{hotel.name}</h3>
                      <p className="text-xs text-slate-500 mb-3">{hotel.beach}</p>
                      <p className="text-xs text-slate-600">{hotel.description}</p>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between mb-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">Цена от</span>
                      <span className="font-extrabold text-blue-600 text-base">{hotel.rooms[0].priceBase.toLocaleString()} ₸</span>
                    </div>
                    <button 
                      onClick={() => setSelectedHotel(hotel)}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700"
                    >
                      Выбрать номера и даты
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'home' && selectedHotel && (
          <div>
            <button onClick={() => setSelectedHotel(null)} className="text-xs font-bold text-slate-600 hover:text-blue-600 mb-4 block">
              ← Назад к отелям
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-64 object-cover rounded-xl mb-4" />
                  <h1 className="text-2xl font-bold mb-2">{selectedHotel.name}</h1>
                  <p className="text-xs text-slate-500 mb-4">{selectedHotel.beach}</p>
                  <p className="text-sm text-slate-60