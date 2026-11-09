import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import {
  Plane, Heart, ShoppingBag, Search, ShieldCheck, ArrowRight, Star, X,
  Compass, Umbrella, Sparkles, Trash2, ShieldAlert, DollarSign, Bot, 
  History, TrendingUp, Users, Zap, Calendar, CheckCircle2, Filter, 
  MessageSquare, UserX, UserCheck, ThumbsUp, AlertTriangle, Edit3
} from 'lucide-react';

// --- ГЕНЕРАТОР БАЗЫ ДАННЫХ И ОТЗЫВОВ ---
const COUNTRIES = ["ОАЭ", "Турция", "Таиланд", "Египет", "Мальдивы", "Вьетнам", "Бали"];
const CITIES = { 
  "ОАЭ": ["Дубай", "Абу-Даби"], 
  "Турция": ["Анталья", "Белек", "Стамбул"], 
  "Таиланд": ["Пхукет", "Самуи"], 
  "Египет": ["Шарм-эль-Шейх", "Хургада"], 
  "Мальдивы": ["Мале", "Атолл Баа"], 
  "Вьетнам": ["Нячанг", "Фукуок"], 
  "Бали": ["Убуд", "Нуса Дуа"] 
};
const MEAL_TYPES = ["Ultra All Inclusive", "All Inclusive", "Full Board", "Half Board", "BB (Завтраки)"];

// Реальная база премиум-отелей с качественными фото
const REAL_HOTELS_DB = [
  { country: "ОАЭ", city: "Дубай", name: "Atlantis The Palm 5*", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80", desc: "Легендарный курорт на искусственном острове Пальма Джумейра с огромным аквапарком Aquaventure и подводным аквариумом. Идеально для семейного VIP-отдыха.", stars: 5, price: 1200000, beach: "Собственный песчаный" },
  { country: "ОАЭ", city: "Абу-Даби", name: "Emirates Palace Mandarin Oriental", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", desc: "Дворец-отель с частным пляжем длиной 1.3 км, роскошными интерьерами из золота и мрамора. Настоящая арабская сказка в столице эмиратов.", stars: 5, price: 1500000, beach: "Первая линия, песок" },
  { country: "Турция", city: "Белек", name: "Maxx Royal Belek Golf Resort", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80", desc: "Один из лучших отелей Турции с концепцией Maxx Inclusive. Роскошные сьюты, поле для гольфа мирового класса и клубника в шоколаде при заезде.", stars: 5, price: 1800000, beach: "Песчаный пляж 300м" },
  { country: "Турция", city: "Анталья", name: "Rixos Premium Antalya", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", desc: "Премиальный отдых на Средиземном море. Безупречный сервис, огромная территория и бесплатный доступ в тематический парк The Land of Legends.", stars: 5, price: 950000, beach: "Собственный пляж" },
  { country: "Таиланд", city: "Пхукет", name: "Keemala Phuket Resort", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", desc: "Уникальный комплекс вилл с бассейнами в тропическом лесу. Дизайн в стиле домов на деревьях и птичьих гнезд для полного уединения.", stars: 5, price: 1100000, beach: "Трансфер на пляж Камала" },
  { country: "Египет", city: "Шарм-эль-Шейх", name: "Rixos Premium Seagate", img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80", desc: "Роскошный курорт на берегу Красного моря с собственным коралловым рифом, ультра все включено и множеством a-la carte ресторанов.", stars: 5, price: 850000, beach: "Кораллы, понтон" },
  { country: "Мальдивы", city: "Атолл Баа", name: "Soneva Jani", img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80", desc: "Знаменитые надводные виллы с водными горками прямо в океан и раздвигающимися крышами для наблюдения за звездами с кровати.", stars: 5, price: 3500000, beach: "Белоснежный песок, лагуна" },
  { country: "Вьетнам", city: "Фукуок", name: "JW Marriott Phu Quoc", img: "https://images.unsplash.com/photo-1509564132473-195977d46816?auto=format&fit=crop&w=800&q=80", desc: "Шедевр архитектора Билла Бенсли, стилизованный под вымышленный французский университет XIX века. Расположен на красивейшем пляже Кем.", stars: 5, price: 1050000, beach: "Частный пляж Khem Beach" },
  { country: "Бали", city: "Убуд", name: "Hanging Gardens of Bali", img: "https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=800&q=80", desc: "Отель в самом сердце джунглей Бали, известный на весь мир своими двухуровневыми панорамными бассейнами, нависающими над ущельем.", stars: 5, price: 1250000, beach: "Джунгли (без пляжа)" },
  { country: "Бали", city: "Нуса Дуа", name: "The Mulia Resort", img: "https://images.unsplash.com/photo-1580041065738-e72023775cdc?auto=format&fit=crop&w=800&q=80", desc: "Монументальный и роскошный курорт с гигантскими статуями у бассейнов и безупречным белоснежным пляжем Нуса Дуа.", stars: 5, price: 1400000, beach: "Первая линия Нуса Дуа" }
];

const generateReviews = () => {
  const mockReviews = [
    "Отличный отель, шикарный вид из окна!",
    "Еда на высшем уровне, но интернет слабоват в номерах.",
    "Идеально для отдыха с детьми, много анимации.",
    "Цена кусается, но сервис оправдывает каждую копейку.",
    "Пляж очень чистый, персонал вежливый. Рекомендую!"
  ];
  const count = Math.floor(Math.random() * 4) + 1;
  const reviews = [];
  for (let i = 0; i < count; i++) {
    reviews.push({
      id: `rev-${Date.now()}-${Math.random()}`,
      author: ["Айдос", "Алина", "Тимур", "Сабина", "Жандос"][Math.floor(Math.random() * 5)],
      text: mockReviews[Math.floor(Math.random() * mockReviews.length)],
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
      likes: Math.floor(Math.random() * 20),
      adminReply: null,
      date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('ru-RU')
    });
  }
  return reviews;
};

const generateHotels = () => {
  let list = [];
  let id = 1;
  
  // Сначала добавляем реальные отели
  REAL_HOTELS_DB.forEach(h => {
    list.push({
      id: `h-${id++}`,
      country: h.country,
      city: h.city,
      name: h.name,
      stars: h.stars,
      image: h.img,
      description: h.desc,
      price: h.price,
      rating: (4.7 + Math.random() * 0.3).toFixed(2),
      meal: MEAL_TYPES[Math.floor(Math.random() * 2)], // UAI или AI
      beach: h.beach,
      reviews: generateReviews(),
      viewers: Math.floor(Math.random() * 15) + 5,
      roomsLeft: Math.floor(Math.random() * 4) + 1
    });
  });

  // Затем догенерируем остальные для массовки
  COUNTRIES.forEach(country => {
    for(let i=1; i<=10; i++) {
      const isCustomImage = REAL_HOTELS_DB.find(r => r.country === country)?.img;
      list.push({
        id: `h-${id++}`,
        country,
        city: CITIES[country][i % CITIES[country].length],
        name: `Premium ${country} Resort & Spa ${i}`,
        stars: i % 3 === 0 ? 4 : 5,
        image: isCustomImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        description: `Отличный курортный отель в регионе ${country}. Прекрасно подходит для размеренного отдыха, наслаждения природой и высоким уровнем сервиса.`,
        price: 300000 + (Math.floor(Math.random() * 50) * 10000),
        rating: (4.2 + Math.random() * 0.8).toFixed(2),
        meal: MEAL_TYPES[i % MEAL_TYPES.length],
        beach: ["Песчаный", "Кораллы", "Первая линия"][i%3],
        reviews: generateReviews(),
        viewers: Math.floor(Math.random() * 10) + 1,
        roomsLeft: Math.floor(Math.random() * 5) + 1
      });
    }
  });
  return list;
};

// --- MOCK CRM USERS ---
const INITIAL_USERS = [
  { id: 'u-1', name: 'Арман Смагулов', phone: '+7 777 123 45 67', ltv: 1500000, status: 'Platinum', isBanned: false },
  { id: 'u-2', name: 'Дильназ Каримова', phone: '+7 701 555 33 22', ltv: 450000, status: 'Gold', isBanned: false },
  { id: 'u-admin', name: 'Super Admin', phone: '-', ltv: 0, status: 'Staff', isBanned: false }
];

const formatMoney = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export default function AstanaTravelApp() {
  const [mounted, setMounted] = useState(false);

  // -- ОСНОВНОЙ СТЕЙТ --
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [activeTab, setActiveTab] = useState('catalog'); 
  const [theme, setTheme] = useState('light');

  // -- ДАННЫЕ --
  const [hotels, setHotels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser] = useState(INITIAL_USERS[0]); 

  // -- ФИЛЬТРЫ КАТАЛОГА --
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('ALL');
  const [filterCity, setFilterCity] = useState('ALL');
  const [filterMeal, setFilterMeal] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(2000000);

  // -- СОСТОЯНИЯ UI --
  const [toast, setToast] = useState(null);
  const [activeHotel, setActiveHotel] = useState(null);
  const [modalTab, setModalTab] = useState('info'); // info | reviews
  const [tinderIndex, setTinderIndex] = useState(0);
  const [adminReplyText, setAdminReplyText] = useState({});
  const [logFilter, setLogFilter] = useState('ALL');

  // -- КОНСТРУКТОР ТУРА --
  const [tourConfig, setTourConfig] = useState({ class: 1, pax: 2, datePrice: 0 });
  const [checkoutStep, setCheckoutStep] = useState(0);

  // -- АДМИНКА --
  const [bulkConfig, setBulkConfig] = useState({ country: 'ОАЭ', percent: 10 });
  const [editingHotelId, setEditingHotelId] = useState(null);
  const [hotelForm, setHotelForm] = useState({ 
    name: '', price: 0, image: '', country: 'ОАЭ', city: 'Дубай', 
    meal: 'Ultra All Inclusive', stars: 5, beach: 'Песчаный', description: '' 
  });

  useEffect(() => {
    setMounted(true);
    const sHotels = localStorage.getItem('at_hotels_v2');
    const sFav = localStorage.getItem('at_favs');
    const sBook = localStorage.getItem('at_books');
    const sLogs = localStorage.getItem('at_logs');
    const sUsers = localStorage.getItem('at_users');
    const sTheme = localStorage.getItem('at_theme');

    if (sHotels) setHotels(JSON.parse(sHotels));
    else {
      const init = generateHotels();
      setHotels(init);
      localStorage.setItem('at_hotels_v2', JSON.stringify(init));
    }

    if (sUsers) setUsers(JSON.parse(sUsers));
    if (sFav) setFavorites(JSON.parse(sFav));
    if (sBook) setBookings(JSON.parse(sBook));
    if (sLogs) setLogs(JSON.parse(sLogs));
    if (sTheme) setTheme(sTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('at_theme', theme);
  }, [theme]);

  // -- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ --
  const pushToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const logAction = (action, details, type = 'СИСТЕМА') => {
    const newLog = { id: Date.now(), time: new Date().toLocaleString('ru-RU'), action, details, type };
    const newLogs = [newLog, ...logs];
    setLogs(newLogs);
    localStorage.setItem('at_logs', JSON.stringify(newLogs));
  };

  const syncHotels = (newH) => { setHotels(newH); localStorage.setItem('at_hotels_v2', JSON.stringify(newH)); };
  const syncUsers = (newU) => { setUsers(newU); localStorage.setItem('at_users', JSON.stringify(newU)); };

  const handleRoleSwitch = () => {
    const newRole = role === 'admin' ? 'user' : 'admin';
    setRole(newRole);
    setActiveTab(newRole === 'admin' ? 'admin-dash' : 'catalog');
    pushToast(`Смена роли: Вы вошли как ${newRole === 'admin' ? 'АДМИНИСТРАТОР' : 'ТУРИСТ'}`);
  };

  const toggleFav = (h) => {
    const isFav = favorites.includes(h.id);
    const newFavs = isFav ? favorites.filter(id => id !== h.id) : [...favorites, h.id];
    setFavorites(newFavs);
    localStorage.setItem('at_favs', JSON.stringify(newFavs));
    pushToast(isFav ? 'Удалено из избранного' : 'Добавлено в избранное!');
  };

  const confirmBooking = () => {
    const finalPrice = (tourConfig.datePrice || activeHotel.price) * tourConfig.class * tourConfig.pax;
    const newBooking = {
      id: 'PNR-' + Math.floor(Math.random()*90000),
      hotel: activeHotel,
      price: finalPrice,
      date: new Date().toLocaleDateString('ru-RU'),
      user: currentUser
    };
    const newBooks = [newBooking, ...bookings];
    setBookings(newBooks);
    localStorage.setItem('at_books', JSON.stringify(newBooks));
    logAction('Новая Бронь', `Пользователь ${currentUser.name} купил тур в ${activeHotel.name} за ${formatMoney(finalPrice)} ₸`, 'ПОКУПКА');
    
    // Обновление LTV пользователя (CRM)
    syncUsers(users.map(u => u.id === currentUser.id ? { ...u, ltv: u.ltv + finalPrice } : u));
    
    setCheckoutStep(2); // Show Voucher
    pushToast('Оплата Kaspi Pay прошла успешно!');
  };

  // -- МАССОВОЕ УПРАВЛЕНИЕ ЦЕНАМИ --
  const applyBulkPrice = () => {
    const multiplier = 1 + (bulkConfig.percent / 100);
    const newHotels = hotels.map(h => {
      if (bulkConfig.country === 'ALL' || h.country === bulkConfig.country) {
        return { ...h, price: Math.round(h.price * multiplier) };
      }
      return h;
    });
    syncHotels(newHotels);
    logAction('Изменение цен', `Цены на ${bulkConfig.country} изменены на ${bulkConfig.percent}%`, 'СИСТЕМА');
    pushToast('Цены успешно обновлены!');
  };

  // -- СОХРАНЕНИЕ / РЕДАКТИРОВАНИЕ ОТЕЛЯ В АДМИНКЕ --
  const handleSaveHotel = () => {
    if(!hotelForm.name) return pushToast('Введите название отеля!');
    
    if (editingHotelId) {
      const updated = hotels.map(h => h.id === editingHotelId ? { 
        ...h, 
        ...hotelForm, 
        price: Number(hotelForm.price), 
        stars: Number(hotelForm.stars) 
      } : h);
      syncHotels(updated);
      pushToast('Информация об отеле успешно обновлена!');
      logAction('Редактирование', `Изменены данные отеля: ${hotelForm.name}`, 'СИСТЕМА');
      setEditingHotelId(null);
    } else {
      const newH = { 
        id: `h-custom-${Date.now()}`, 
        ...hotelForm, 
        price: Number(hotelForm.price), 
        stars: Number(hotelForm.stars), 
        rating: '5.00', 
        roomsLeft: 10, 
        viewers: 1, 
        reviews: [] 
      };
      syncHotels([newH, ...hotels]);
      pushToast('Новый отель добавлен в базу!'); 
      logAction('Создание', `Добавлен новый отель: ${hotelForm.name}`, 'СИСТЕМА');
    }
    setHotelForm({name:'', price:0, image:'', country:'ОАЭ', city:'Дубай', meal:'Ultra All Inclusive', beach: 'Песчаный', stars: 5, description: ''});
  };

  const handleEditHotel = (hotel) => {
    setEditingHotelId(hotel.id);
    setHotelForm({
      name: hotel.name,
      price: hotel.price,
      image: hotel.image,
      country: hotel.country,
      city: hotel.city,
      meal: hotel.meal,
      beach: hotel.beach,
      stars: hotel.stars,
      description: hotel.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // -- ФУНКЦИИ МОДЕРАЦИИ (CRM / ОТЗЫВЫ) --
  const toggleBlockUser = (userId) => {
    const updated = users.map(u => u.id === userId ? { ...u, isBanned: !u.isBanned } : u);
    syncUsers(updated);
    const user = updated.find(u => u.id === userId);
    logAction('Модерация', `Пользователь ${user.name} ${user.isBanned ? 'ЗАБЛОКИРОВАН' : 'РАЗБЛОКИРОВАН'}`, 'МОДЕРАЦИЯ');
    pushToast(user.isBanned ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
  };

  const deleteReview = (hotelId, reviewId) => {
    const newHotels = hotels.map(h => {
      if (h.id === hotelId) return { ...h, reviews: h.reviews.filter(r => r.id !== reviewId) };
      return h;
    });
    syncHotels(newHotels);
    if(activeHotel?.id === hotelId) setActiveHotel(newHotels.find(h => h.id === hotelId));
    logAction('Удаление отзыва', `Отзыв удален модератором (Отель ID: ${hotelId})`, 'МОДЕРАЦИЯ');
    pushToast('Отзыв удален');
  };

  const replyToReview = (hotelId, reviewId) => {
    const reply = adminReplyText[reviewId];
    if (!reply) return;
    const newHotels = hotels.map(h => {
      if (h.id === hotelId) {
        return {
          ...h, reviews: h.reviews.map(r => r.id === reviewId ? { ...r, adminReply: reply } : r)
        };
      }
      return h;
    });
    syncHotels(newHotels);
    if(activeHotel?.id === hotelId) setActiveHotel(newHotels.find(h => h.id === hotelId));
    setAdminReplyText({...adminReplyText, [reviewId]: ''});
    logAction('Ответ на отзыв', `Администратор ответил на отзыв в ${hotelId}`, 'МОДЕРАЦИЯ');
    pushToast('Ответ опубликован');
  };

  const likeReview = (hotelId, reviewId) => {
    const newHotels = hotels.map(h => {
      if (h.id === hotelId) return { ...h, reviews: h.reviews.map(r => r.id === reviewId ? { ...r, likes: r.likes + 1 } : r) };
      return h;
    });
    syncHotels(newHotels);
    if(activeHotel?.id === hotelId) setActiveHotel(newHotels.find(h => h.id === hotelId));
  };


  if (!mounted) return null;

  // -- ЛОГИКА ФИЛЬТРАЦИИ КАТАЛОГА --
  const filteredCatalog = hotels.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = filterCountry === 'ALL' || h.country === filterCountry;
    const matchesCity = filterCity === 'ALL' || h.city === filterCity;
    const matchesMeal = filterMeal === 'ALL' || h.meal === filterMeal;
    const matchesPrice = h.price <= maxPrice;
    return matchesSearch && matchesCountry && matchesCity && matchesMeal && matchesPrice;
  });

  const filteredLogs = logs.filter(l => logFilter === 'ALL' || l.type === logFilter);
  const allReviews = hotels.flatMap(h => h.reviews.map(r => ({ ...r, hotelName: h.name, hotelId: h.id })));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <Head><title>Astana Premium Travel | App</title></Head>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab(role === 'admin' ? 'admin-dash' : 'catalog')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg">
              <Plane className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-indigo-600 leading-none">ASTANA TRAVEL</h1>
              <span className="text-[10px] font-bold text-slate-400">PREMIUM BOOKING</span>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {role === 'user' ? (
              <>
                <button onClick={() => setActiveTab('catalog')} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='catalog'?'bg-indigo-100 text-indigo-600':'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Каталог</button>
                <button onClick={() => setActiveTab('tinder')} className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='tinder'?'bg-rose-100 text-rose-600':'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Zap className="w-4 h-4"/> Tinder-Подбор</button>
                <button onClick={() => setActiveTab('ai')} className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 ${activeTab==='ai'?'bg-purple-100 text-purple-600':'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Bot className="w-4 h-4"/> AI</button>
                <button onClick={() => setActiveTab('profile')} className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 ${activeTab==='profile'?'bg-indigo-100 text-indigo-600':'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><ShoppingBag className="w-4 h-4"/> Кабинет</button>
              </>
            ) : (
              <>
                <button onClick={() => setActiveTab('admin-dash')} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='admin-dash'?'bg-slate-800 text-white':'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>Дашборд</button>
                <button onClick={() => setActiveTab('admin-hotels')} className={`hidden sm:block px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='admin-hotels'?'bg-slate-800 text-white':'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>Каталог</button>
                <button onClick={() => setActiveTab('admin-crm')} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='admin-crm'?'bg-slate-800 text-white':'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>CRM & Пользователи</button>
                <button onClick={() => setActiveTab('admin-mod')} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='admin-mod'?'bg-rose-600 text-white':'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>Модерация</button>
              </>
            )}
            
            {/* СМЕНА РОЛЕЙ И ТЕМЫ */}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700 ml-2">
              <button onClick={handleRoleSwitch} className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1 border transition-colors ${role === 'admin' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                {role === 'admin' ? <ShieldAlert className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                {role}
              </button>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Umbrella className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6">
        
        {/* === РЕЖИМ ТУРИСТА (B2C) === */}
        {role === 'user' && (
          <>
            {/* 1. КАТАЛОГ И ФИЛЬТРЫ */}
            {activeTab === 'catalog' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                  <h2 className="text-3xl font-black mb-2">Откройте мир с Astana Travel</h2>
                  <p className="text-indigo-200 text-sm mb-6">Сотни эксклюзивных туров с вылетом из Астаны.</p>
                  
                  {/* ADVANCED FILTERS */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-3 text-slate-300 w-5 h-5" />
                      <input type="text" placeholder="Поиск по названию отеля..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-12 pr-4 text-white placeholder:text-slate-300 focus:outline-none focus:bg-white/20 transition" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-indigo-200">Страна</label>
                        <select value={filterCountry} onChange={e => {setFilterCountry(e.target.value); setFilterCity('ALL');}} className="w-full bg-white/20 border border-white/20 rounded-lg p-2 text-sm text-white focus:outline-none">
                          <option value="ALL" className="text-slate-900">Все страны</option>
                          {COUNTRIES.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-indigo-200">Курорт / Город</label>
                        <select value={filterCity} onChange={e => setFilterCity(e.target.value)} disabled={filterCountry === 'ALL'} className="w-full bg-white/20 border border-white/20 rounded-lg p-2 text-sm text-white focus:outline-none disabled:opacity-50">
                          <option value="ALL" className="text-slate-900">Все курорты</option>
                          {filterCountry !== 'ALL' && CITIES[filterCountry].map(city => <option key={city} value={city} className="text-slate-900">{city}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-indigo-200">Тип питания</label>
                        <select value={filterMeal} onChange={e => setFilterMeal(e.target.value)} className="w-full bg-white/20 border border-white/20 rounded-lg p-2 text-sm text-white focus:outline-none">
                          <option value="ALL" className="text-slate-900">Любое питание</option>
                          {MEAL_TYPES.map(m => <option key={m} value={m} className="text-slate-900">{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-indigo-200">Цена до: {formatMoney(maxPrice)} ₸</label>
                        <input type="range" min="300000" max="3000000" step="50000" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))} className="w-full mt-2 accent-indigo-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center px-2">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Filter className="w-5 h-5 text-indigo-500"/> Найдено туров: {filteredCatalog.length}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCatalog.slice(0, 15).map(h => (
                    <div key={h.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition group relative flex flex-col">
                      {h.roomsLeft <= 3 && (
                        <div className="absolute top-4 left-4 z-10 bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-md animate-pulse">Осталось {h.roomsLeft} номера!</div>
                      )}
                      <div className="relative h-56 overflow-hidden">
                        <img src={h.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt={h.name} />
                        <button onClick={() => toggleFav(h)} className="absolute top-4 right-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-2 rounded-xl text-rose-500 hover:scale-110 transition shadow-sm">
                          <Heart className={`w-5 h-5 ${favorites.includes(h.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                        </button>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <span className="bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400"/> {h.rating} ({h.reviews.length} отз)</span>
                          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">Смотрят: {h.viewers} чел.</span>
                        </div>
                      </div>
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                            <span>{h.country}, {h.city}</span>
                            <span>{'★'.repeat(h.stars)}</span>
                          </div>
                          <h3 className="font-bold text-lg leading-tight line-clamp-1">{h.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Umbrella className="w-3 h-3"/> {h.beach} • {h.meal}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Цена за тур</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white">{formatMoney(h.price)} ₸</span>
                          </div>
                          <button onClick={() => { setActiveHotel(h); setModalTab('info'); setTourConfig({...tourConfig, datePrice: h.price}); setCheckoutStep(0); }} className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl hover:bg-indigo-600 hover:text-white transition">
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredCatalog.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="font-bold text-lg">По вашему запросу ничего не найдено</p>
                      <p className="text-slate-500">Попробуйте ослабить фильтры</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. TINDER РЕЖИМ */}
            {activeTab === 'tinder' && hotels.length > 0 && (
              <div className="flex flex-col items-center justify-center py-10 animate-in slide-in-from-bottom-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-rose-500 flex items-center justify-center gap-2"><Zap /> Быстрый подбор</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Смахните вправо, чтобы добавить в избранное.</p>
                </div>
                {tinderIndex < hotels.length ? (
                  <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="relative h-96">
                      <img src={hotels[tinderIndex].image} className="w-full h-full object-cover" alt="Hotel" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                        <h3 className="text-3xl font-black leading-tight mb-1">{hotels[tinderIndex].name}</h3>
                        <p className="text-sm opacity-90">{hotels[tinderIndex].country} • {'★'.repeat(hotels[tinderIndex].stars)}</p>
                        <p className="text-2xl font-bold mt-2 text-indigo-300">{formatMoney(hotels[tinderIndex].price)} ₸</p>
                      </div>
                    </div>
                    <div className="p-6 flex justify-center gap-8 bg-slate-50 dark:bg-slate-950">
                      <button onClick={() => setTinderIndex(i => i + 1)} className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-lg text-slate-400 flex items-center justify-center hover:scale-110 hover:text-rose-500 transition border border-slate-200 dark:border-slate-700"><X className="w-8 h-8" /></button>
                      <button onClick={() => { toggleFav(hotels[tinderIndex]); setTinderIndex(i => i + 1); }} className="w-16 h-16 rounded-full bg-indigo-600 shadow-lg shadow-indigo-600/40 text-white flex items-center justify-center hover:scale-110 transition"><Heart className="w-8 h-8" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center font-bold text-slate-500">Вы просмотрели всю базу! Перейдите в Избранное.</div>
                )}
              </div>
            )}

            {/* 3. AI ASSISTANT */}
            {activeTab === 'ai' && (
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg animate-in zoom-in-95">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center"><Bot className="w-8 h-8 text-purple-600 dark:text-purple-400"/></div>
                  <div><h2 className="text-2xl font-black">Smart AI Ассистент</h2><p className="text-sm text-slate-500 dark:text-slate-400">Напишите запрос в свободной форме</p></div>
                </div>
                <textarea rows="4" placeholder="Например: Хочу на море в Дубай, нас двое взрослых, бюджет до 1.5 млн тенге..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500 mb-4 placeholder:text-slate-400" />
                <button onClick={() => pushToast('AI: Анализирую базу данных... (Симуляция)')} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition">
                  <Sparkles className="w-5 h-5"/> Искать идеальный тур
                </button>
              </div>
            )}

            {/* 4. КАБИНЕТ (ПРОФИЛЬ & ЛОЯЛЬНОСТЬ) */}
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
                {currentUser.isBanned && (
                  <div className="bg-rose-500 text-white p-4 rounded-2xl font-bold flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6"/> Ваш аккаунт ограничен модератором. Вы не можете оставлять отзывы.
                  </div>
                )}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-2xl font-black text-indigo-600 dark:text-indigo-400">{currentUser.name[0]}</div>
                    <div><h2 className="text-2xl font-bold">{currentUser.name}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.phone}</p></div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs uppercase font-bold text-amber-500">Статус лояльности</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{currentUser.status}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mt-8">Мои путешествия и билеты</h3>
                {bookings.filter(b=>b.user.id === currentUser.id).length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">У вас пока нет купленных туров</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.filter(b=>b.user.id === currentUser.id).map(b => (
                      <div key={b.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                          <img src={b.hotel.image} className="w-20 h-20 rounded-xl object-cover" alt="Hotel" />
                          <div>
                            <h4 className="font-bold text-lg leading-tight">{b.hotel.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">PNR: {b.id} | Куплено: {b.date}</p>
                          </div>
                        </div>
                        <div className="text-right w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                          <p className="font-black text-xl text-indigo-600 dark:text-indigo-400">{formatMoney(b.price)} ₸</p>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 px-2 py-1 rounded-md font-bold mt-1 inline-block">
                            + Кешбэк {formatMoney(b.price * 0.01)} ₸
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* === РЕЖИМ АДМИНИСТРАТОРА (B2B / CRM) === */}
        {role === 'admin' && (
          <div className="space-y-6 animate-in fade-in">
            {/* 1. DASHBOARD */}
            {activeTab === 'admin-dash' && (
              <>
                <h2 className="text-2xl font-black">Аналитика Бизнеса</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"><TrendingUp className="text-emerald-500 w-8 h-8 mb-2"/><p className="text-sm text-slate-500 dark:text-slate-400">Общая выручка</p><p className="text-3xl font-black">{formatMoney(users.reduce((a,u)=>a+u.ltv,0))} ₸</p></div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"><ShoppingBag className="text-indigo-500 w-8 h-8 mb-2"/><p className="text-sm text-slate-500 dark:text-slate-400">Оформлено туров</p><p className="text-3xl font-black">{bookings.length}</p></div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"><Users className="text-rose-500 w-8 h-8 mb-2"/><p className="text-sm text-slate-500 dark:text-slate-400">Клиентов в CRM</p><p className="text-3xl font-black">{users.length}</p></div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 mt-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><DollarSign className="text-emerald-500"/> Динамическое управление ценами (Наценка)</h3>
                  <div className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                    <div className="w-full">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Регион (Страна)</label>
                      <select value={bulkConfig.country} onChange={e=>setBulkConfig({...bulkConfig, country: e.target.value})} className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none">
                        <option value="ALL">ВЕСЬ КАТАЛОГ</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="w-full">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Наценка / Скидка (%)</label>
                      <input type="number" value={bulkConfig.percent} onChange={e=>setBulkConfig({...bulkConfig, percent: Number(e.target.value)})} className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none" />
                    </div>
                    <button onClick={applyBulkPrice} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2.5 px-6 rounded-lg whitespace-nowrap w-full sm:w-auto hover:bg-slate-800 dark:hover:bg-slate-200 transition">Применить</button>
                  </div>
                </div>
              </>
            )}

            {/* 2. УПРАВЛЕНИЕ КАТАЛОГОМ (CRUD) */}
            {activeTab === 'admin-hotels' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3">
                    <h3 className="font-bold mb-4 text-xl">{editingHotelId ? 'Редактировать отель' : 'Добавить новый отель'}</h3>
                    <div className="space-y-3 text-sm">
                      <input type="text" placeholder="Название отеля" value={hotelForm.name} onChange={e=>setHotelForm({...hotelForm, name:e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-indigo-500 font-bold" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Базовая цена (₸)" value={hotelForm.price} onChange={e=>setHotelForm({...hotelForm, price:Number(e.target.value)})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-indigo-500" />
                        <select value={hotelForm.stars} onChange={e=>setHotelForm({...hotelForm, stars: Number(e.target.value)})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                          <option value="3">3 Звезды</option>
                          <option value="4">4 Звезды</option>
                          <option value="5">5 Звезд</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <select value={hotelForm.country} onChange={e=>setHotelForm({...hotelForm, country: e.target.value, city: CITIES[e.target.value][0]})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={hotelForm.city} onChange={e=>setHotelForm({...hotelForm, city: e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                          {CITIES[hotelForm.country].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <select value={hotelForm.meal} onChange={e=>setHotelForm({...hotelForm, meal: e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                          {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input type="text" placeholder="Тип пляжа" value={hotelForm.beach} onChange={e=>setHotelForm({...hotelForm, beach:e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none" />
                      </div>
                      <input type="text" placeholder="URL Картинки (или Base64)" value={hotelForm.image} onChange={e=>setHotelForm({...hotelForm, image:e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none" />
                      <textarea placeholder="Полное описание отеля..." rows="3" value={hotelForm.description} onChange={e=>setHotelForm({...hotelForm, description:e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none resize-none"></textarea>
                      
                      <div className="flex gap-2 pt-2">
                        <button onClick={handleSaveHotel} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl transition shadow-md">
                          {editingHotelId ? 'Сохранить изменения' : 'Создать отель'}
                        </button>
                        {editingHotelId && (
                          <button onClick={() => { setEditingHotelId(null); setHotelForm({name:'', price:0, image:'', country:'ОАЭ', city:'Дубай', meal:'Ultra All Inclusive', beach: 'Песчаный', stars: 5, description: ''}); }} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold p-3 rounded-xl transition hover:bg-slate-300 dark:hover:bg-slate-700">
                            Отмена
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 max-h-[650px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-2xl p-3 bg-slate-50 dark:bg-slate-950/50 space-y-2">
                    {hotels.map(h => (
                      <div key={h.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <img src={h.image} className="w-16 h-16 rounded-lg object-cover" alt="img" />
                          <div>
                            <p className="font-bold text-base">{h.name} {'★'.repeat(h.stars)}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatMoney(h.price)} ₸ • {h.country}, {h.city} • {h.meal}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditHotel(h)} className="text-indigo-500 p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition" title="Редактировать">
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button onClick={() => {syncHotels(hotels.filter(x=>x.id!==h.id)); pushToast('Отель удален'); logAction('Удаление', `Удален отель ${h.name}`, 'СИСТЕМА');}} className="text-rose-500 p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 rounded-lg transition" title="Удалить">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. CRM И ЛОГИ */}
            {activeTab === 'admin-crm' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><UserCheck className="w-5 h-5 text-indigo-500"/> CRM & Антифрод</h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {users.map(u => {
                      const userBookings = bookings.filter(b => b.user.id === u.id);
                      return (
                      <div key={u.id} className={`p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 ${u.isBanned ? 'border-rose-500 dark:border-rose-500/50' : 'border-slate-200 dark:border-slate-800'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm flex items-center gap-2">{u.name} {u.isBanned && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">Banned</span>}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{u.phone} • Статус: {u.status}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm text-emerald-600">{formatMoney(u.ltv)} ₸</p>
                            <p className="text-[10px] text-slate-500">Покупок: {userBookings.length}</p>
                          </div>
                        </div>
                        {userBookings.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                            {userBookings.map(b => (
                              <p key={b.id} className="text-xs text-slate-600 dark:text-slate-400 truncate">• {b.hotelName} ({b.date})</p>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 flex justify-end">
                          <button onClick={() => toggleBlockUser(u.id)} className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${u.isBanned ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {u.isBanned ? <CheckCircle2 className="w-3 h-3"/> : <UserX className="w-3 h-3"/>}
                            {u.isBanned ? 'Разблокировать' : 'Заблокировать'}
                          </button>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2"><History className="w-5 h-5 text-purple-500"/> Журнал аудита</h3>
                    <select value={logFilter} onChange={e=>setLogFilter(e.target.value)} className="bg-slate-100 dark:bg-slate-800 border-0 rounded-lg text-xs p-2 font-bold outline-none">
                      <option value="ALL">Все события</option>
                      <option value="ПОКУПКА">Покупки</option>
                      <option value="МОДЕРАЦИЯ">Модерация</option>
                      <option value="СИСТЕМА">Система</option>
                    </select>
                  </div>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {filteredLogs.map(l => (
                      <div key={l.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 flex gap-3">
                        <div className={`w-2 h-full rounded-full flex-shrink-0 ${l.type === 'ПОКУПКА' ? 'bg-emerald-500' : l.type === 'МОДЕРАЦИЯ' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                        <div className="w-full">
                          <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                            <span>{l.action}</span><span className="text-slate-400 font-normal">{l.time}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 leading-tight">{l.details}</p>
                        </div>
                      </div>
                    ))}
                    {filteredLogs.length === 0 && <p className="text-sm text-slate-500">Нет записей по этому фильтру.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* 4. МОДЕРАЦИЯ ОТЗЫВОВ */}
            {activeTab === 'admin-mod' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-rose-500"/> Единый центр модерации отзывов</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                  {allReviews.map(r => (
                    <div key={r.id} className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded uppercase">{r.hotelName}</span>
                            <p className="font-bold text-sm mt-1">{r.author} <span className="text-slate-400 font-normal">({r.date})</span></p>
                          </div>
                          <span className="flex items-center text-xs font-bold text-amber-500"><Star className="w-3 h-3 fill-amber-500 mr-1"/>{r.rating}</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">«{r.text}»</p>
                        {r.adminReply && (
                          <div className="mt-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="font-bold text-indigo-600 flex items-center gap-1 mb-1"><ShieldCheck className="w-3 h-3"/> Официальный ответ</span>
                            <p>{r.adminReply}</p>
                          </div>
                        )}
                      </div>
                      
                      {!r.adminReply && (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Официальный ответ..." value={adminReplyText[r.id] || ''} onChange={e=>setAdminReplyText({...adminReplyText, [r.id]: e.target.value})} className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none"/>
                          <button onClick={() => replyToReview(r.hotelId, r.id)} className="bg-indigo-600 text-white px-3 rounded-lg text-xs font-bold whitespace-nowrap">Ответить</button>
                        </div>
                      )}
                      <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button onClick={() => deleteReview(r.hotelId, r.id)} className="text-xs text-rose-500 font-bold flex items-center gap-1 hover:underline"><Trash2 className="w-3 h-3"/> Удалить отзыв</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* === МОДАЛЬНОЕ ОКНО ОТЕЛЯ (ИНФО И ОТЗЫВЫ) === */}
      {activeHotel && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex justify-center items-end sm:items-center sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-t-3xl sm:rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95">
            <button onClick={() => setActiveHotel(null)} className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-full z-10 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              <X className="w-5 h-5"/>
            </button>
            
            <div className="px-6 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800 flex gap-6">
              <button onClick={()=>setModalTab('info')} className={`pb-3 font-bold text-sm transition-colors ${modalTab==='info' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}>Обзор и бронирование</button>
              <button onClick={()=>setModalTab('reviews')} className={`pb-3 font-bold text-sm transition-colors flex items-center gap-1 ${modalTab==='reviews' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}>Отзывы <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px]">{activeHotel.reviews.length}</span></button>
            </div>

            <div className="overflow-y-auto p-6 flex-grow">
              
              {/* TAB: INFO */}
              {modalTab === 'info' && checkoutStep === 0 && (
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Левая часть: Инфо */}
                  <div className="w-full lg:w-1/2 space-y-6">
                    <img src={activeHotel.image} className="w-full h-64 object-cover rounded-2xl shadow-md" alt="Hotel" />
                    <div>
                      <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">{activeHotel.country}</span>
                      <h2 className="text-3xl font-black mt-2 leading-tight">{activeHotel.name}</h2>
                      <div className="flex gap-4 text-sm mt-2 text-slate-600 dark:text-slate-400">
                        <span className="flex gap-1 items-center"><Star className="w-4 h-4 fill-amber-400 text-amber-400"/> {activeHotel.rating}</span>
                        <span>{'★'.repeat(activeHotel.stars)}</span>
                        <span>{activeHotel.meal}</span>
                      </div>
                    </div>

                    {/* ОПИСАНИЕ ОТЕЛЯ */}
                    {activeHotel.description && (
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Об отеле</h4>
                        <p>{activeHotel.description}</p>
                      </div>
                    )}
                    
                    {/* МАТРИЦА ЦЕН */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400"/> Календарь выгодных цен
                      </h4>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {[0,1,2,3,4].map(i => {
                          const d = new Date(); d.setDate(d.getDate() + i);
                          const isCheap = i === 1 || i === 4;
                          const dPrice = activeHotel.price * (isCheap ? 0.85 : 1.1);
                          const isSelected = tourConfig.datePrice === dPrice;
                          return (
                            <button key={i} onClick={() => setTourConfig({...tourConfig, datePrice: dPrice})} className={`flex flex-col items-center p-2 rounded-xl border min-w-[80px] transition ${isSelected ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>
                              <span className="text-[10px] font-bold text-slate-400">{d.toLocaleDateString('ru',{weekday:'short', day:'numeric'})}</span>
                              <span className={`text-xs font-black mt-1 ${isCheap && !isSelected ? 'text-emerald-500' : ''}`}>{(dPrice/1000).toFixed(0)}k</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Правая часть: Конфигуратор */}
                  <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div className="space-y-5">
                      <h3 className="text-xl font-bold border-b border-slate-200 dark:border-slate-700 pb-4">Конструктор тура</h3>
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-2">Класс перелета (из Астаны NQZ)</label>
                        <div className="flex gap-2">
                          <button onClick={()=>setTourConfig({...tourConfig, class: 1})} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${tourConfig.class===1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>Эконом</button>
                          <button onClick={()=>setTourConfig({...tourConfig, class: 1.5})} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${tourConfig.class===1.5 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>Бизнес (+50%)</button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-2">Количество гостей</label>
                        <select value={tourConfig.pax} onChange={(e)=>setTourConfig({...tourConfig, pax: Number(e.target.value)})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none">
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Пассажиров</option>)}
                        </select>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 p-3 rounded-xl text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                        <CheckCircle2 className="w-4 h-4 inline mr-1" /> Медицинская страховка и трансфер включены
                      </div>
                    </div>
                    
                    <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                      <p className="text-xs font-bold text-slate-400 uppercase">Итоговая стоимость</p>
                      <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 mb-4">{formatMoney((tourConfig.datePrice || activeHotel.price) * tourConfig.class * tourConfig.pax)} ₸</p>
                      <button onClick={() => setCheckoutStep(1)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2 transition">
                        <ShieldCheck className="w-5 h-5"/> Оформить заказ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: REVIEWS */}
              {modalTab === 'reviews' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-indigo-50 dark:bg-indigo-950 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-100">Рейтинг: {activeHotel.rating} / 5</h3>
                      <p className="text-sm text-indigo-600 dark:text-indigo-300">На основе {activeHotel.reviews.length} отзывов</p>
                    </div>
                    <Star className="w-12 h-12 text-amber-500 fill-amber-500 opacity-20" />
                  </div>

                  <div className="space-y-4">
                    {activeHotel.reviews.length === 0 ? <p className="text-center text-slate-500 py-10">Отзывов пока нет.</p> : null}
                    {activeHotel.reviews.map(r => (
                      <div key={r.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{r.author} <span className="text-xs text-slate-400 font-normal ml-2">{r.date}</span></p>
                            <div className="flex mt-1">
                              {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-700'}`}/>)}
                            </div>
                          </div>
                          <button onClick={() => likeReview(activeHotel.id, r.id)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition"><ThumbsUp className="w-4 h-4"/> {r.likes}</button>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{r.text}</p>
                        
                        {r.adminReply && (
                          <div className="ml-6 mt-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-l-4 border-indigo-500">
                            <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mb-1"><ShieldCheck className="w-3 h-3"/> Ответ администрации</span>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{r.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ШАГ 2: KASPI ОПЛАТА */}
              {checkoutStep === 1 && modalTab === 'info' && (
                <div className="max-w-md mx-auto text-center space-y-6 py-10 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-red-600 rounded-[2rem] text-white flex items-center justify-center font-black text-4xl mx-auto shadow-2xl shadow-red-500/40">K</div>
                  <h3 className="text-2xl font-bold">Оплата через Kaspi Pay</h3>
                  <p className="text-slate-500 text-sm">Сумма к списанию: <br/><span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{formatMoney((tourConfig.datePrice || activeHotel.price) * tourConfig.class * tourConfig.pax)} ₸</span></p>
                  <button onClick={confirmBooking} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg transition">Подтвердить оплату</button>
                  <button onClick={() => setCheckoutStep(0)} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition">Отмена</button>
                </div>
              )}

              {/* ШАГ 3: VOUCHER */}
              {checkoutStep === 2 && modalTab === 'info' && (
                <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 animate-in fade-in relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-600"></div>
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                  <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-400">Посадочный ваучер</h3>
                  <p className="text-xs text-slate-500">Успешно оплачено и забронировано.</p>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-sm font-bold text-slate-700 dark:text-slate-300 space-y-2 shadow-sm">
                    <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Отель</span> <span>{activeHotel.name}</span></p>
                    <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Пассажиров</span> <span>{tourConfig.pax} чел.</span></p>
                    <p className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-slate-400">Рейс</span> <span>Из Астаны (NQZ)</span></p>
                    <div className="flex justify-center pt-4">
                      <div className="w-32 h-32 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-400 text-center text-xs">QR CODE<br/>(симуляция)</div>
                    </div>
                  </div>
                  <button onClick={() => {setActiveHotel(null); setActiveTab('profile');}} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl mt-4 transition">
                    В личный кабинет
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST ALERTS */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-bottom-5 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400"/>
          {toast}
        </div>
      )}
    </div>
  );
}