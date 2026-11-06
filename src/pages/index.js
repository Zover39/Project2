import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Plane, Heart, ShoppingBag, Search, 
  ShieldCheck, CheckCircle, ArrowRight, Star, 
  X, QrCode, Compass, Umbrella, RotateCcw, Sparkles,
  LayoutDashboard, PlusCircle, Edit, Trash2, TrendingUp, Hotel, Check, Lock
} from 'lucide-react';

const INITIAL_COUNTRIES = [
  { name: "ОАЭ", city: "Дубай / Абу-Даби", imgBase: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80" },
  { name: "Турция", city: "Анталья / Стамбул", imgBase: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80" },
  { name: "Таиланд", city: "Пхукет / Паттайя", imgBase: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80" },
  { name: "Египет", city: "Шарм-эль-Шейх / Хургада", imgBase: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80" },
  { name: "Мальдивы", city: "Атолы Мальдив", imgBase: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80" },
  { name: "Вьетнам", city: "Нячанг / Фукуок", imgBase: "https://images.unsplash.com/photo-1509564132473-195977d46816?auto=format&fit=crop&w=800&q=80" },
  { name: "Индонезия", city: "Бали / Убуд", imgBase: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80" }
];

const PREFIXES = ["Grand", "Royal", "Palace", "Luxury", "Resort & Spa", "Sunset", "Beach Club", "Marina", "Empire", "Oasis"];
const MEALS = ["Ultra All Inclusive", "All Inclusive", "Full Board", "Half Board", "Breakfast"];

const generateInitialHotels = () => {
  let list = [];
  let idCounter = 1;
  INITIAL_COUNTRIES.forEach(c => {
    for (let i = 1; i <= 5; i++) {
      const stars = (i % 2 === 0) ? 4 : 5;
      const basePrice = 350000 + (i * 45000);
      const meal = MEALS[(i + c.name.length) % MEALS.length];

      list.push({
        id: `hotel-${idCounter++}`,
        country: c.name,
        city: c.city.split('/')[0].trim(),
        name: `${PREFIXES[(i - 1) % PREFIXES.length]} ${c.name} ${stars}★`,
        stars: stars,
        image: c.imgBase,
        price: basePrice,
        rating: (4.5 + (i % 4) * 0.1).toFixed(1),
        reviewsCount: 80 + i * 12,
        meal: meal,
        beach: "Песчаный пляж (1-я линия)",
        flightRoute: `Прямой рейс Air Astana из Астаны (NQZ)`,
        tourIncludes: [
          "Авиаперелет туда и обратно из Астаны (NQZ)",
          "Групповой трансфер",
          "Медицинская страховка",
          `Проживание с питанием (${meal})`
        ],
        rooms: [
          { id: 'std', name: 'Standard Room', desc: 'Комфортный двухместный номер', priceExtra: 0 },
          { id: 'dlx', name: 'Deluxe Sea View', desc: 'Панорамный вид на море', priceExtra: 85000 },
          { id: 'ste', name: 'Executive Suite', desc: 'Просторный люкс', priceExtra: 190000 }
        ]
      });
    }
  });
  return list;
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'favorites', 'bookings', 'admin'
  
  // Данные приложения
  const [hotels, setHotels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Фильтры
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedMeal, setSelectedMeal] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Конструктор тура
  const [activeHotel, setActiveHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [flightClass, setFlightClass] = useState(1.0);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [nights, setNights] = useState(7);
  const [departureDate, setDepartureDate] = useState('2026-06-01');

  // Админ-панель состояния
  const [adminSection, setAdminSection] = useState('hotels'); // 'hotels', 'bookings', 'add'
  const [newHotel, setNewHotel] = useState({
    name: '', country: 'ОАЭ', city: 'Дубай', price: 400000, stars: 5, meal: 'All Inclusive',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    beach: 'Песчаный пляж (1-я линия)'
  });
  const [editingHotel, setEditingHotel] = useState(null);

  // Модальные окна
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [voucherModal, setVoucherModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    setMounted(true);
    const savedHotels = localStorage.getItem('astana_hotels');
    const savedFavs = localStorage.getItem('astana_favs');
    const savedBookings = localStorage.getItem('astana_bookings');

    if (savedHotels) {
      setHotels(JSON.parse(savedHotels));
    } else {
      const initial = generateInitialHotels();
      setHotels(initial);
      localStorage.setItem('astana_hotels', JSON.stringify(initial));
    }

    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    if (savedBookings) setBookings(JSON.parse(savedBookings));
  }, []);

  const formatPrice = (num) => {
    if (!mounted || !num) return "0";
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

  const filteredHotels = hotels.filter(h => {
    const matchCountry = selectedCountry === 'all' || h.country === selectedCountry;
    const matchMeal = selectedMeal === 'all' || h.meal.includes(selectedMeal);
    const matchQuery = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       h.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       h.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCountry && matchMeal && matchQuery;
  });

  const calculateFinalPrice = () => {
    if (!activeHotel || !selectedRoom) return 0;
    const base = activeHotel.price;
    const roomExtra = selectedRoom.priceExtra || 0;
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
      total: total,
      totalStr: formatPrice(total) + ' ₸',
      flightRoute: activeHotel.flightRoute || 'Прямой рейс из Астаны (NQZ)',
      status: 'Оплачен (Kaspi Pay)',
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

  // Админские функции (CRUD)
  const handleAddHotel = (e) => {
    e.preventDefault();
    const created = {
      ...newHotel,
      id: `hotel-custom-${Date.now()}`,
      rating: "5.0",
      reviewsCount: 1,
      flightRoute: `Прямой рейс Air Astana из Астаны (NQZ)`,
      tourIncludes: ["Перелет из Астаны", "Трансфер", "Страховка", `Питание (${newHotel.meal})`],
      rooms: [
        { id: 'std', name: 'Standard Room', desc: 'Стандартный номер', priceExtra: 0 },
        { id: 'dlx', name: 'Deluxe Room', desc: 'Улучшенный номер', priceExtra: 60000 }
      ]
    };
    const updated = [created, ...hotels];
    setHotels(updated);
    localStorage.setItem('astana_hotels', JSON.stringify(